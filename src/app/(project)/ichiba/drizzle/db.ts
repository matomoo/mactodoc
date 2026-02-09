// biome-ignore assist/source/organizeImports: <will fix later>
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Parse a PostgreSQL connection string into its components
 */
function parseDatabaseUrl(databaseUrl: string) {
  try {
    const url = new URL(databaseUrl);

    // For connection pooling URLs like postgres.xxx, we need special handling
    const isSupabasePooler = url.hostname.includes(".pooler.supabase.com");

    return {
      host: url.hostname,
      port: parseInt(url.port, 10) || 5432,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading "/"
      ssl: isSupabasePooler ? { rejectUnauthorized: false } : true,
    };
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Parse and validate the DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

const dbConfig = parseDatabaseUrl(databaseUrl);

export const client = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  ssl: dbConfig.ssl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db_conn1 = drizzle(client, {
  schema: {
    ...schema,
  },
});
