import { Request, Response } from "express";
import { ResearchService } from "../services/researchService";
import { CacheService } from "../services/cacheService";
import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { reports } from "../db/schema";
import { PDFService, ReportData } from "../services/pdfService";

export default class ReportController {
  static async generate(req: Request, res: Response) {
  try {
    const { query, forceRefresh } = req.body;
    const user = (req as any).user;

    if (!user?.id) {
      return res.status(401).json({ error: "Unauthorized: missing user" });
    }

    const cache = new CacheService();

    if (!forceRefresh) {
      const cached = await cache.getCachedReport(query);
      if (cached) return res.json(cached.data);
    }

    const research = new ResearchService();
    const refined = await research.analyzeAndRefineQuery(query);
    const fetched = await research.fetchInformation(refined);
    const processed = await research.processAndSummarize(fetched, query);
    const report = await research.generateReportStructure(processed, query);

    const [dbReport] = await db
      .insert(reports)
      .values({
        topic: query,
        content: report,
        confidence: report.confidence ?? 50,
        user_id: user.id, // now works ✅
      })
      .returning()
      .execute();

    await cache.cacheReport(query, report);

    res.json({
      id: dbReport.id,
      topic: query,
      summary: report.summary,
      key_points: report.key_points,
      sources: report.sources,
      confidence: report.confidence,
      generated_at: dbReport.created_at,
    });
  } catch (err) {
    console.error("generate report error:", err);
    res.status(500).json({ error: (err as Error).message });
  }
  }

  static async list(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const rows = await db
        .select()
        .from(reports)
        .where(eq(reports.user_id, user.id))
        .execute();

      res.json(
        rows.map((r) => ({
          id: r.id,
          topic: r.topic,
          confidence: r.confidence,
          created_at: r.created_at,
        }))
      );
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  static async getReport(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const user = (req as any).user;

      const [r] = await db
        .select()
        .from(reports)
        .where(and(eq(reports.id, id), eq(reports.user_id, user.id)))
        .execute();

      if (!r) return res.status(404).json({ error: "Not found" });
      res.json(r);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  static async deleteReport(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const user = (req as any).user;

      await db
        .delete(reports)
        .where(and(eq(reports.id, id), eq(reports.user_id, user.id)))
        .execute();

      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  static async exportPdf(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const user = (req as any).user;

      const [r] = await db
        .select()
        .from(reports)
        .where(and(eq(reports.id, id), eq(reports.user_id, user.id)))
        .execute();

      if (!r) return res.status(404).json({ error: "Not found" });

      const pdfService = new PDFService();
      const filename = `report_${r.id}_${user.id}.pdf`;
      const filepath = await pdfService.generatePdf(
        r.topic,
        r.content as ReportData,
        filename
      );

      res.download(filepath, `${r.topic.replace(/\s+/g, "_")}_report.pdf`);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
}
