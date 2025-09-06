import { Worker } from "bullmq";
import { cleanupQueue } from "../queues";
import fs from "fs";
import path from "path";

const worker = new Worker("cleanup", async (job) => {
  console.log("cleanupWorker:", job.name);
  const folder = path.join(process.cwd(), "generated_reports");
  const files = fs.existsSync(folder) ? fs.readdirSync(folder) : [];
  const now = Date.now();
  const deleted: string[] = [];

  for (const f of files) {
    const stat = fs.statSync(path.join(folder, f));
    const ageDays = (now - stat.mtimeMs) / (1000 * 60 * 60 * 24);
    if (ageDays > 30) {
      fs.unlinkSync(path.join(folder, f));
      deleted.push(f);
    }
  }

  console.log(`Deleted ${deleted.length} old reports`);
  return { deleted };
});

worker.on("failed", (_, err) => console.error("cleanupWorker failed:", err));
