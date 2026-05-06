import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export type SqlClient = NeonQueryFunction<false, false>;

let cachedSql: SqlClient | null = null;

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql(): SqlClient | null {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return null;
  }

  cachedSql ??= neon(databaseUrl);

  return cachedSql;
}
