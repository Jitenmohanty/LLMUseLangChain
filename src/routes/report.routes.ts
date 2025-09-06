import { Router } from "express";
import ReportController from "../controllers/report.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/", authMiddleware, ReportController.generate);
router.get("/", authMiddleware, ReportController.list);
router.get("/:id", authMiddleware, ReportController.getReport);
router.delete("/:id", authMiddleware, ReportController.deleteReport);
router.get("/:id/pdf", authMiddleware, ReportController.exportPdf);

export default router;
