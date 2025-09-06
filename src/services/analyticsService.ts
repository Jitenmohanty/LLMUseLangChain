import { db } from "../db";
import { reports } from "../db/schema";
import { sql } from "drizzle-orm";

export class AnalyticsService {
  async popularTopics(limit = 10) {
    const res = await db
      .select({
        topic: reports.topic,
        count: sql<number>`COUNT(*)`.as('count')
      })
      .from(reports)
      .groupBy(reports.topic)
      .limit(limit);

    return res;
  }

  async userStats(userId: number) {
    const total = await db
      .select()
      .from(reports)
      .where(sql`${reports.user_id} = ${userId}`);

    return {
      total_reports: total.length
    };
  }
}
