// app/tinfra/_drizzle/db_ti_sul_edge.ts  ← new file

// biome-ignore assist/source/organizeImports: <none>
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/schema-db-ti-sul-onedb";

const clientEdge = postgres({
  host: process.env.DB_CONN_V2_HOST,
  port: parseInt(process.env.DB_CONN_V2_PORT as string, 10),
  user: process.env.DB_CONN_V2_USER,
  password: process.env.DB_CONN_V2_PASSWORD,
  database: process.env.DB_CONN_V2_NAME,
  max: 5, // smaller pool, just for heavy queries
});

export const db_conn_v2_edge = drizzle(clientEdge, {
  schema: { ...schema },
});
