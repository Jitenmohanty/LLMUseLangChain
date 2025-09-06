import { Request, Response } from "express";
import { AnalyticsService } from "../services/analyticsService";

const svc = new AnalyticsService();

export default class AnalyticsController {
  static async popularTopics(req: Request, res: Response) {
    try {
      const limit = Number(req.query.limit || 10);
      const topics = await svc.popularTopics(limit);
      res.json(topics);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  static async userStats(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const stats = await svc.userStats(user.id);
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
}
