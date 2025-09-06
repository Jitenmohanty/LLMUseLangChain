import { cacheQueue, cleanupQueue, analyticsQueue, healthQueue } from "./index";

async function scheduleJobs() {
  // every 4 hours
  await cacheQueue.add("warm-cache", {}, { repeat: { pattern: "0 */4 * * *" } });
  // daily at 2 AM
  await cleanupQueue.add("cleanup-old-reports", {}, { repeat: { pattern: "0 2 * * *" } });
  // daily at 3 AM
  await analyticsQueue.add("generate-analytics", {}, { repeat: { pattern: "0 3 * * *" } });
  // every 30 minutes
  await healthQueue.add("system-health", {}, { repeat: { pattern: "*/30 * * * *" } });

  console.log("Scheduled repeatable jobs");
}

scheduleJobs().catch((e) => {
  console.error("Failed to schedule jobs:", e);
  process.exit(1);
});
