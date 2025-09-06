import { Worker } from "bullmq";
import { usageQueue } from "../queues";
import { db } from "../db";
import { api_usages } from "../db/schema";

const worker = new Worker("usage", async (job) => {
  const { userId, tokens, cost } = job.data;
  await db.insert(api_usages).values({
    user_id: userId,
    endpoint: "/api/generate-report",
    tokens_used: tokens,
    cost
  });
  return { ok: true };
});

worker.on("failed", (_, err) => console.error("usageWorker failed:", err));
