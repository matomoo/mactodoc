import { defineConfig } from "drizzle-kit";
import "dotenv";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  // schema: "./src/drizzle/schema/schema-gefrdb-pumdb-v1.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: `${process.env.DATABASE_URL}`,
  },
  verbose: true,
  strict: true,
});
