import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  const isTestOrMock =
    process.env.NODE_ENV === "test" || process.env.USE_MOCK_STORAGE === "true";
  if (!isTestOrMock) {
    throw new Error(
      "FATAL: DATABASE_URL environment variable is required to run MicroPlace. " +
      "Please configure a valid PostgreSQL connection string or explicitly set USE_MOCK_STORAGE=true for isolated testing."
    );
  }
}

export const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

export const db = pool ? drizzle(pool, { schema }) : (null as any);
