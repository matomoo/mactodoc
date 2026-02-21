// biome-ignore assist/source/organizeImports: <will fix later>
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema/schema-db-ti-sul-onedb";

export const client = new Pool({
  host: process.env.DB_CONN_V2_HOST,
  port: parseInt(process.env.DB_CONN_V2_PORT as string, 10),
  user: process.env.DB_CONN_V2_USER,
  password: process.env.DB_CONN_V2_PASSWORD,
  database: process.env.DB_CONN_V2_NAME,
});

export const db_conn_v2 = drizzle(client, {
  schema: {
    ...schema,
  },
});
