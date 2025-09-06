import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { z } from "zod";

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("8000"),
  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:8080"),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default("30m"),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  GOOGLE_API_KEY: z.string().min(1),
  SERP_API_KEY: z.string().min(1)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid .env:", parsed.error.format());
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
