import { Queue } from "bullmq";
import Redis from "ioredis";
import { env } from "../config/env";

const connection = new Redis(env.REDIS_URL);

export const cacheQueue = new Queue("cache", { connection });
export const cleanupQueue = new Queue("cleanup", { connection });
export const analyticsQueue = new Queue("analytics", { connection });
export const healthQueue = new Queue("health", { connection });
export const researchQueue = new Queue("research", { connection });
export const notificationsQueue = new Queue("notifications", { connection });
export const usageQueue = new Queue("usage", { connection });

// In BullMQ v5, repeatable jobs work directly via Queue.add()
// ✅ Wrap in async function
async function run() {
  await cacheQueue.add("some-job", { foo: "bar" }, { repeat: { every: 60000 } });
}
run();
