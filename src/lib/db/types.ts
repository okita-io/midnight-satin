/**
 * Domain types for auth. Full types in design.md.
 */

export interface Reader {
  id: string;
  email: string;
  displayName: string | null;
  creditBalance: number;
  role: "reader" | "admin";
  createdAt: Date;
  lastLoginAt: Date | null;
}

/** Row from readers table (snake_case) */
export interface ReaderRow {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  credit_balance: number;
  role: string;
  created_at: Date;
  last_login_at: Date | null;
}

export function readerRowToReader(row: ReaderRow): Reader {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name ?? null,
    creditBalance: row.credit_balance,
    role: row.role === "admin" ? "admin" : "reader",
    createdAt: new Date(row.created_at),
    lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : null,
  };
}
