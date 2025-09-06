import { Worker } from "bullmq";
import { notificationsQueue } from "../queues";

const worker = new Worker("notifications", async (job) => {
  const { email, subject, message } = job.data;
  console.log(`Pretend-sending email to ${email}: ${subject}\n${message}`);
  // Integrate real provider here
  return { status: "sent" };
});

worker.on("failed", (_, err) => console.error("notificationWorker failed:", err));
