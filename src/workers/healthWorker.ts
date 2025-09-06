import { Worker } from "bullmq";
import { healthQueue } from "../queues";
import { DatabaseManager } from "../db";
import { CacheService } from "../services/cacheService";
import os from "os";

const worker = new Worker("health", async (job) => {
  console.log("healthWorker:", job.name);
  const dbOk = await DatabaseManager.checkConnection();
  const cache = new CacheService();
  const cacheOk = await cache.stats().then(() => true).catch(() => false);

  const disk = Math.round((os.freemem() / os.totalmem()) * 100);

  return {
    database: dbOk,
    cache: cacheOk,
    memory_free_percent: disk
  };
});

worker.on("failed", (_, err) => console.error("healthWorker failed:", err));
