import express from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { cacheQueue, cleanupQueue, analyticsQueue, researchQueue } from "./queues";

const app = express();
const serverAdapter = new ExpressAdapter();

createBullBoard({
  queues: [
    new BullMQAdapter(cacheQueue),
    new BullMQAdapter(cleanupQueue),
    new BullMQAdapter(analyticsQueue),
    new BullMQAdapter(researchQueue)
  ],
  serverAdapter
});

serverAdapter.setBasePath("/admin/queues");
app.use("/admin/queues", serverAdapter.getRouter());

app.listen(8081, () => console.log("Bull board available on http://localhost:8081/admin/queues"));
