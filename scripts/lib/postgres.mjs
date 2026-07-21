/**
 * Node/ESM drop-in for scripts — mirrors src/lib/db/postgres.ts
 * (`createPool` + tagged `sql`) on `@neondatabase/serverless`.
 */

import {
  Client,
  neon,
  neonConfig,
  Pool,
} from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

export class VercelPostgresError extends Error {
  constructor(code, message) {
    super(`VercelPostgresError - '${code}': ${message}`);
    this.name = "VercelPostgresError";
    this.code = code;
  }
}

export function postgresConnectionString(type = "pool") {
  let connectionString;
  if (type === "pool") {
    connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  } else if (type === "direct") {
    connectionString =
      process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL_UNPOOLED;
  } else {
    throw new VercelPostgresError(
      "invalid_connection_type",
      `Unhandled type: ${type}`
    );
  }
  if (connectionString === "undefined") connectionString = undefined;
  return connectionString;
}

export function isPooledConnectionString(connectionString) {
  return connectionString.includes("-pooler.");
}

export function isDirectConnectionString(connectionString) {
  return !isPooledConnectionString(connectionString);
}

export function isLocalhostConnectionString(connectionString) {
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

export function sqlTemplate(strings, ...values) {
  if (!Array.isArray(strings) || !("raw" in strings) || !Array.isArray(values)) {
    throw new VercelPostgresError(
      "incorrect_tagged_template_call",
      "Use sql as a tagged template: sql`SELECT …`, not sql('SELECT …')"
    );
  }
  let result = strings[0] ?? "";
  for (let i = 1; i < strings.length; i++) {
    result += `$${i}${strings[i] ?? ""}`;
  }
  return [result, values];
}

export class VercelClient extends Client {
  async sql(strings, ...values) {
    const [query, params] = sqlTemplate(strings, ...values);
    return this.query(query, params);
  }
}

export class VercelPool extends Pool {
  constructor(config) {
    super(config);
    this.Client = VercelClient;
    this.connectionString = config.connectionString ?? "";
  }

  async sql(strings, ...values) {
    const [query, params] = sqlTemplate(strings, ...values);
    const httpSql = neon(this.connectionString, { fullResults: true });
    return httpSql.query(query, params);
  }
}

export function createPool(config = {}) {
  const connectionString =
    config.connectionString ?? postgresConnectionString("pool");
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
  return new VercelPool({ ...config, connectionString });
}
