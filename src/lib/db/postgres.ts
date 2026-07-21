/**
 * Drop-in replacement for `@vercel/postgres` backed by `@neondatabase/serverless`.
 *
 * Preserves the tagged-template `sql` / `sql.connect()` / `createPool` API used
 * throughout Midnight Satin. Prefer importing from here (or `@/lib/db`) instead
 * of `@vercel/postgres` (deprecated).
 *
 * Env: `POSTGRES_URL` (pooled) or `DATABASE_URL`; direct: `POSTGRES_URL_NON_POOLING`.
 */

import {
  Client,
  neon,
  neonConfig,
  Pool,
  types,
} from "@neondatabase/serverless";
import type {
  ClientConfig,
  PoolClient,
  PoolConfig,
  QueryResult,
  QueryResultRow,
} from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

export { types };
export type {
  Pool,
  Client,
  QueryResult,
  QueryResultRow,
} from "@neondatabase/serverless";

type VercelPostgresErrorCode =
  | "invalid_connection_string"
  | "missing_connection_string"
  | "invalid_connection_type"
  | "incorrect_tagged_template_call";

export class VercelPostgresError extends Error {
  constructor(
    public code: VercelPostgresErrorCode,
    message: string
  ) {
    super(`VercelPostgresError - '${code}': ${message}`);
    this.name = "VercelPostgresError";
  }
}

type ConfigItemsToOmit = "user" | "database" | "password" | "host" | "port";
export type VercelPostgresClientConfig = Omit<ClientConfig, ConfigItemsToOmit>;
export type VercelPostgresPoolConfig = Omit<PoolConfig, ConfigItemsToOmit>;

/** Values accepted by the `sql` tagged template (Postgres parameters). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Primitive = any;

export type ConnectionStringType = "pool" | "direct";

export function postgresConnectionString(
  type: ConnectionStringType = "pool"
): string | undefined {
  let connectionString: string | undefined;

  switch (type) {
    case "pool":
      connectionString =
        process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? undefined;
      break;
    case "direct":
      connectionString =
        process.env.POSTGRES_URL_NON_POOLING ??
        process.env.DATABASE_URL_UNPOOLED ??
        undefined;
      break;
    default: {
      const _exhaustive: never = type;
      throw new VercelPostgresError(
        "invalid_connection_type",
        `Unhandled type: ${_exhaustive as string}`
      );
    }
  }

  if (connectionString === "undefined") connectionString = undefined;
  return connectionString;
}

export function isPooledConnectionString(connectionString: string): boolean {
  return connectionString.includes("-pooler.");
}

export function isDirectConnectionString(connectionString: string): boolean {
  return !isPooledConnectionString(connectionString);
}

export function isLocalhostConnectionString(connectionString: string): boolean {
  try {
    const withHttpsProtocol = connectionString.replace(
      /^postgresql:\/\//,
      "https://"
    );
    return new URL(withHttpsProtocol).hostname === "localhost";
  } catch (err) {
    if (err instanceof TypeError) return false;
    throw err;
  }
}

export function sqlTemplate(
  strings: TemplateStringsArray,
  ...values: Primitive[]
): [string, Primitive[]] {
  if (!isTemplateStringsArray(strings) || !Array.isArray(values)) {
    throw new VercelPostgresError(
      "incorrect_tagged_template_call",
      "It looks like you tried to call `sql` as a function. Make sure to use it as a tagged template.\n\tExample: sql`SELECT * FROM users`, not sql('SELECT * FROM users')"
    );
  }
  let result = strings[0] ?? "";
  for (let i = 1; i < strings.length; i++) {
    result += `$${i}${strings[i] ?? ""}`;
  }
  return [result, values];
}

function isTemplateStringsArray(
  strings: unknown
): strings is TemplateStringsArray {
  return (
    Array.isArray(strings) && "raw" in strings && Array.isArray(strings.raw)
  );
}

export class VercelClient extends Client {
  async sql<O extends QueryResultRow>(
    strings: TemplateStringsArray,
    ...values: Primitive[]
  ): Promise<QueryResult<O>> {
    const [query, params] = sqlTemplate(strings, ...values);
    return this.query<O>(query, params);
  }
}

export function createClient(
  config?: VercelPostgresClientConfig
): VercelClient {
  const connectionString =
    config?.connectionString ?? postgresConnectionString("direct");
  if (!connectionString) {
    throw new VercelPostgresError(
      "missing_connection_string",
      "You did not supply a 'connectionString' and no 'POSTGRES_URL_NON_POOLING' env var was found."
    );
  }
  if (
    !isLocalhostConnectionString(connectionString) &&
    !isDirectConnectionString(connectionString)
  ) {
    throw new VercelPostgresError(
      "invalid_connection_string",
      "This connection string is meant to be used with a pooled connection. Try `createPool()` instead."
    );
  }
  return new VercelClient({ ...config, connectionString });
}

export interface VercelPoolClient extends VercelClient {
  release: (err?: Error | boolean) => void;
}

export class VercelPool extends Pool {
  Client = VercelClient;
  private connectionString: string;

  constructor(config: VercelPostgresPoolConfig) {
    super(config);
    this.connectionString = config.connectionString ?? "";
  }

  async sql<O extends QueryResultRow>(
    strings: TemplateStringsArray,
    ...values: Primitive[]
  ): Promise<QueryResult<O>> {
    const [query, params] = sqlTemplate(strings, ...values);
    const httpSql = neon(this.connectionString, { fullResults: true });
    return httpSql.query(query, params) as unknown as Promise<QueryResult<O>>;
  }

  connect(): Promise<VercelPoolClient>;
  connect(
    callback: (
      err: Error | undefined,
      client: VercelPoolClient | undefined,
      done: (release?: unknown) => void
    ) => void
  ): void;
  connect(
    callback?: (
      err: Error | undefined,
      client: VercelPoolClient | undefined,
      done: (release?: unknown) => void
    ) => void
  ): void | Promise<VercelPoolClient> {
    if (callback) {
      return super.connect(
        callback as (
          err: Error | undefined,
          client: PoolClient | undefined,
          done: (release?: unknown) => void
        ) => void
      );
    }
    return super.connect() as Promise<VercelPoolClient>;
  }
}

export function createPool(config?: VercelPostgresPoolConfig): VercelPool {
  const connectionString =
    config?.connectionString ?? postgresConnectionString("pool");
  if (!connectionString) {
    throw new VercelPostgresError(
      "missing_connection_string",
      "You did not supply a 'connectionString' and no 'POSTGRES_URL' env var was found."
    );
  }
  if (
    !isLocalhostConnectionString(connectionString) &&
    !isPooledConnectionString(connectionString)
  ) {
    throw new VercelPostgresError(
      "invalid_connection_string",
      "This connection string is meant to be used with a direct connection. Make sure to use a pooled connection string or try `createClient()` instead."
    );
  }

  let maxUses = config?.maxUses;
  let max = config?.max;
  if (typeof (globalThis as { EdgeRuntime?: unknown }).EdgeRuntime !== "undefined") {
    maxUses = 1;
    max = 10_000;
  }

  return new VercelPool({ ...config, connectionString, maxUses, max });
}

let pool: VercelPool | undefined;

export const sql: VercelPool &
  (<O extends QueryResultRow>(
    strings: TemplateStringsArray,
    ...values: Primitive[]
  ) => Promise<QueryResult<O>>) = new Proxy(() => {}, {
  get(_, prop) {
    if (!pool) pool = createPool();
    const val = Reflect.get(pool, prop);
    if (typeof val === "function") return val.bind(pool);
    return val;
  },
  apply(_, __, argumentsList) {
    if (!pool) pool = createPool();
    // @ts-expect-error Proxy apply forwards tagged-template args to pool.sql
    return pool.sql(...argumentsList);
  },
}) as VercelPool &
  (<O extends QueryResultRow>(
    strings: TemplateStringsArray,
    ...values: Primitive[]
  ) => Promise<QueryResult<O>>);

export const db = sql;
