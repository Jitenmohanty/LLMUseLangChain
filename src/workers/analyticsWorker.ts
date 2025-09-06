import { Worker } from "bullmq";
import { analyticsQueue } from "../queues";
import { db } from "../db";
import { reports } from "../db/schema";

const worker = new Worker("analytics", async (job) => {
  console.log("analyticsWorker:", job.name);
  // Simple daily metrics (example)
  // For real aggregates, write better drizzle queries
  const all = await db.select().from(reports).execute();
  return {
    total_reports: all.length
  };
});

worker.on("failed", (_, err) => console.error("analyticsWorker failed:", err));
