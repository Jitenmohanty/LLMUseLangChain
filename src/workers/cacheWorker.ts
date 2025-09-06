import { Worker } from "bullmq";
import { cacheQueue } from "../queues";
import { CacheService } from "../services/cacheService";
import { ResearchService } from "../services/researchService";

const worker = new Worker("cache", async (job) => {
  console.log("cacheWorker running", job.name);
  const cache = new CacheService();
  const research = new ResearchService();

  // warm popular topics quickly
  const topics = [
    "artificial intelligence",
    "climate change",
    "blockchain technology",
    "renewable energy",
    "machine learning"
  ];

  for (const topic of topics) {
    const cached = await cache.getCachedReport(topic);
    if (cached) continue;
    const refined = await research.analyzeAndRefineQuery(topic);
    const search = await research.fetchInformation(refined);
    const processed = await research.processAndSummarize(search, topic);
    const report = await research.generateReportStructure(processed, topic);
    await cache.cacheReport(topic, report);
  }
  return { status: "ok" };
});

worker.on("completed", (job) => console.log("cacheWorker completed:", job.id));
worker.on("failed", (job, err) => console.error("cacheWorker failed:", job?.id, err));
