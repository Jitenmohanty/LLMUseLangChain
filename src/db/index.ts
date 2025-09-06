import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../config/env";

export const pool = new Pool({
  connectionString: env.DATABASE_URL
});

export const db = drizzle(pool);

export class DatabaseManager {
  static async checkConnection(): Promise<boolean> {
    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT 1");
        return true;
      } finally {
        client.release();
      }
    } catch (e) {
      console.warn("DB check failed:", e);
      return false;
    }
  }
}
