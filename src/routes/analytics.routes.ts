import { Router } from "express";
import AnalyticsController from "../controllers/analytics.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/popular-topics", AnalyticsController.popularTopics);
router.get("/user-stats", authMiddleware, AnalyticsController.userStats);

export default router;
