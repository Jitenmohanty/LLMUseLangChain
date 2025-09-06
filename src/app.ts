import express from "express";
import cors from "cors";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import reportRoutes from "./routes/report.routes";
import analyticsRoutes from "./routes/analytics.routes";
import { errorHandler } from "./middleware/error";

const app = express();

app.use(cors({ origin: env.CORS_ORIGINS.split(","), credentials: true }));
app.use(express.json({ limit: "5mb" }));

app.get("/health", (req, res) => res.json({ status: "healthy", timestamp: new Date().toISOString() }));

app.use("/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/analytics", analyticsRoutes);

// final error handler
app.use(errorHandler);

export default app;
