/**
 * MCP HTTP Endpoint
 * Model Context Protocol server at /api/mcp
 * Exposes create/list/update tools for Author_Profiles, Series, Novels, Chapters, Characters.
 * Authenticates via API key (Req 12.9).
 * Requirements: 12.1-12.9
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createAuthor,
  createSeries,
  createNovel,
  createChapter,
  createCharacter,
  listContent,
  updateContent,
  type CreateAuthorParams,
  type CreateSeriesParams,
  type CreateNovelParams,
  type CreateChapterParams,
  type CreateCharacterParams,
  type ListContentParams,
  type UpdateContentParams,
} from "@/lib/mcp/mcp-data";

/** Get API key from request - supports Authorization: Bearer and X-API-Key */
function getApiKey(request: NextRequest): string | null {
  const auth = request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  const apiKey = request.headers.get("X-API-Key");
  if (apiKey) return apiKey.trim();
  return null;
}

/** Simple sliding-window rate limit per API key fingerprint (in-memory; per instance). */
const MCP_RATE_LIMIT_WINDOW_MS = 60_000;
const MCP_RATE_LIMIT_MAX = 120;
const mcpRateBuckets = new Map<string, { count: number; windowStart: number }>();

function fingerprintKey(key: string): string {
  // Avoid logging the raw key; short stable hash for rate buckets / audit.
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (Math.imul(31, h) + key.charCodeAt(i)) | 0;
  return `mcp_${(h >>> 0).toString(16)}`;
}

function checkRateLimit(keyFingerprint: string): boolean {
  const now = Date.now();
  const bucket = mcpRateBuckets.get(keyFingerprint);
  if (!bucket || now - bucket.windowStart > MCP_RATE_LIMIT_WINDOW_MS) {
    mcpRateBuckets.set(keyFingerprint, { count: 1, windowStart: now });
    return true;
  }
  if (bucket.count >= MCP_RATE_LIMIT_MAX) return false;
  bucket.count += 1;
  return true;
}

function auditMcp(
  keyFingerprint: string,
  action: string,
  detail: Record<string, unknown>
) {
  console.info(
    JSON.stringify({
      type: "mcp_audit",
      at: new Date().toISOString(),
      key: keyFingerprint,
      action,
      ...detail,
    })
  );
}

/** Validate API key - returns 401 if invalid; fail closed if unset */
function validateApiKey(request: NextRequest): NextResponse | null {
  const configuredKey = process.env.MCP_API_KEY ?? process.env.API_KEY;
  if (!configuredKey) {
    // Production must never run MCP open; fail closed.
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32001, message: "MCP API key not configured" } },
      { status: 503 }
    );
  }
  const provided = getApiKey(request);
  if (!provided || provided !== configuredKey) {
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32001, message: "Invalid API key" } },
      { status: 401 }
    );
  }
  const fp = fingerprintKey(provided);
  if (!checkRateLimit(fp)) {
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32002, message: "Rate limit exceeded" } },
      { status: 429 }
    );
  }
  // Stash fingerprint for audit in handlers via header clone is awkward; use WeakMap on request
  (request as NextRequest & { __mcpKeyFp?: string }).__mcpKeyFp = fp;
  return null;
}

/** JSON-RPC 2.0 request shape */
interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

/** MCP tool definition - inputSchema follows JSON Schema */
interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, Record<string, unknown>>;
    required?: string[];
  };
}

const MCP_TOOLS: MCPTool[] = [
  {
    name: "create_author",
    description: "Create an Author_Profile with name, biography, avatar URL, and style tags",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Author display name" },
        biography: { type: "string", description: "Author biography" },
        avatar_url: { type: "string", description: "URL to avatar image" },
        style_tags: { type: "array", description: "Writing style tags", items: { type: "string" } },
      },
      required: ["name"],
    },
  },
  {
    name: "create_series",
    description: "Create a Series with title, author reference, description, and genre tags",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Series title" },
        author_id: { type: "string", description: "Author_Profile UUID" },
        description: { type: "string", description: "Series description" },
        genre_tags: { type: "array", description: "Genre tags", items: { type: "string" } },
      },
      required: ["title", "author_id"],
    },
  },
  {
    name: "create_novel",
    description: "Create a Novel with title, series/author reference, cover, synopsis, and genre tags",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Novel title" },
        series_id: { type: "string", description: "Series UUID (optional for standalone)" },
        author_id: { type: "string", description: "Author_Profile UUID" },
        cover_image_url: { type: "string", description: "Cover image URL" },
        synopsis: { type: "string", description: "Novel synopsis" },
        genre_tags: { type: "array", description: "Genre tags", items: { type: "string" } },
      },
      required: ["title", "author_id"],
    },
  },
  {
    name: "create_chapter",
    description: "Create a Chapter with novel reference, chapter number, title, content, and free/locked status",
    inputSchema: {
      type: "object",
      properties: {
        novel_id: { type: "string", description: "Novel UUID" },
        chapter_number: { type: "number", description: "Chapter number (1-based)" },
        title: { type: "string", description: "Chapter title" },
        content: { type: "string", description: "Chapter text content" },
        is_free: { type: "boolean", description: "Whether chapter is free to read" },
      },
      required: ["novel_id", "chapter_number", "title", "content"],
    },
  },
  {
    name: "create_character",
    description: "Create a Character with novel reference, name, role, portrait, description, backstory, stats, and secrets",
    inputSchema: {
      type: "object",
      properties: {
        novel_id: { type: "string", description: "Novel UUID" },
        name: { type: "string", description: "Character name" },
        role: { type: "string", description: "Role subtitle" },
        portrait_url: { type: "string", description: "Portrait image URL" },
        description: { type: "string", description: "Short description" },
        backstory: { type: "string", description: "Character backstory" },
        stats: { type: "object", description: "Stats (age, status, height, etc.)" },
        secrets: { type: "array", description: "Character secrets", items: { type: "string" } },
      },
      required: ["novel_id", "name"],
    },
  },
  {
    name: "list_content",
    description: "List Author_Profiles, Series, Novels, Chapters, or Characters with optional filtering",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description: "Content type: authors, series, novels, chapters, characters",
          enum: ["authors", "series", "novels", "chapters", "characters"],
        },
        filter_by: {
          type: "object",
          description: "Optional filter",
          properties: {
            author_id: { type: "string" },
            series_id: { type: "string" },
            novel_id: { type: "string" },
          },
        },
      },
      required: ["type"],
    },
  },
  {
    name: "update_content",
    description: "Update an existing content record by type and id",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description: "Content type: authors, series, novels, chapters, characters",
          enum: ["authors", "series", "novels", "chapters", "characters"],
        },
        id: { type: "string", description: "Record UUID" },
        updates: { type: "object", description: "Fields to update" },
      },
      required: ["type", "id", "updates"],
    },
  },
];

/** Invoke a tool by name */
async function callTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: { type: "text"; text: string }[] } | { content: { type: "text"; text: string }[]; isError: true }> {
  const toText = (obj: unknown) =>
    JSON.stringify(obj, (_, v) => (v instanceof Date ? v.toISOString() : v), 2);

  try {
    switch (name) {
      case "create_author": {
        const result = await createAuthor(args as unknown as CreateAuthorParams);
        if ("code" in result) {
          return {
            content: [{ type: "text" as const, text: toText({ error: result }) }],
            isError: true,
          };
        }
        return { content: [{ type: "text", text: toText(result) }] };
      }
      case "create_series": {
        const result = await createSeries(args as unknown as CreateSeriesParams);
        if ("code" in result) {
          return {
            content: [{ type: "text" as const, text: toText({ error: result }) }],
            isError: true,
          };
        }
        return { content: [{ type: "text", text: toText(result) }] };
      }
      case "create_novel": {
        const result = await createNovel(args as unknown as CreateNovelParams);
        if ("code" in result) {
          return {
            content: [{ type: "text" as const, text: toText({ error: result }) }],
            isError: true,
          };
        }
        return { content: [{ type: "text", text: toText(result) }] };
      }
      case "create_chapter": {
        const result = await createChapter(args as unknown as CreateChapterParams);
        if ("code" in result) {
          return {
            content: [{ type: "text" as const, text: toText({ error: result }) }],
            isError: true,
          };
        }
        return { content: [{ type: "text", text: toText(result) }] };
      }
      case "create_character": {
        const result = await createCharacter(args as unknown as CreateCharacterParams);
        if ("code" in result) {
          return {
            content: [{ type: "text" as const, text: toText({ error: result }) }],
            isError: true,
          };
        }
        return { content: [{ type: "text", text: toText(result) }] };
      }
      case "list_content": {
        const result = await listContent(args as unknown as ListContentParams);
        if ("code" in result) {
          return {
            content: [{ type: "text" as const, text: toText({ error: result }) }],
            isError: true,
          };
        }
        return { content: [{ type: "text", text: toText(result) }] };
      }
      case "update_content": {
        const result = await updateContent(args as unknown as UpdateContentParams);
        if ("code" in result) {
          return {
            content: [{ type: "text" as const, text: toText({ error: result }) }],
            isError: true,
          };
        }
        return { content: [{ type: "text", text: toText(result) }] };
      }
      default:
        return {
          content: [{ type: "text", text: toText({ error: { code: "VALIDATION_ERROR", message: `Unknown tool: ${name}` } }) }],
          isError: true,
        };
    }
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: toText({
            error: {
              code: "INTERNAL_ERROR" as const,
              message: err instanceof Error ? err.message : "Internal error",
            },
          }),
        },
      ],
      isError: true,
    };
  }
}

export async function POST(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  let body: JsonRpcRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" } },
      { status: 400 }
    );
  }

  if (body.jsonrpc !== "2.0" || !body.method) {
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32600, message: "Invalid Request" } },
      { status: 400 }
    );
  }

  const id = body.id ?? null;

  switch (body.method) {
    case "initialize": {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "midnight-satin-mcp", version: "1.0.0" },
        },
      });
    }
    case "tools/list": {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: { tools: MCP_TOOLS },
      });
    }
    case "tools/call": {
      const params = (body.params ?? {}) as { name?: string; arguments?: Record<string, unknown> };
      const toolName = params.name;
      const toolArgs = params.arguments ?? {};

      if (!toolName || typeof toolName !== "string") {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32602, message: "Invalid params: tool name required" },
        });
      }

      const keyFp =
        (request as NextRequest & { __mcpKeyFp?: string }).__mcpKeyFp ?? "unknown";
      auditMcp(keyFp, "tools/call", {
        tool: toolName,
        // Never log full content payloads — entity type / ids only when present
        entityHint:
          typeof toolArgs.id === "string"
            ? toolArgs.id
            : typeof toolArgs.novel_id === "string"
              ? toolArgs.novel_id
              : undefined,
      });

      const result = await callTool(toolName, toolArgs);
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result,
      });
    }
    default:
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Method not found: ${body.method}` },
      });
  }
}
