import { Worker } from "bullmq";
import { researchQueue } from "../queues";
import { ResearchService } from "../services/researchService";
import { db } from "../db";
import { reports } from "../db/schema";

const worker = new Worker("research", async (job) => {
  console.log("researchWorker job:", job.name, job.data);
  const service = new ResearchService();

  const { queries = [], userId } = job.data as { queries: string[]; userId: number };
  const results: Array<
    | { query: string; reportId: number; status: "success" }
    | { query: string; status: "failed"; error: string }
  > = [];

  for (const query of queries) {
    try {
      const refined = await service.analyzeAndRefineQuery(query);
      const fetched = await service.fetchInformation(refined);
      const processed = await service.processAndSummarize(fetched, query);
      const report = await service.generateReportStructure(processed, query);

      const [dbReport] = await db.insert(reports).values({
        topic: query,
        content: report,
        confidence: report.confidence ?? 50,
        user_id: userId
      }).returning();

      results.push({ query, reportId: dbReport.id, status: "success" });
    } catch (e) {
      results.push({ query, status: "failed", error: (e as Error).message });
    }
  }

  return results;
});

worker.on("failed", (job, err) => console.error("research worker failed", job?.id, err));
