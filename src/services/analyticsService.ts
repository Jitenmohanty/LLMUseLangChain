import { db } from "../db";
import { reports, users } from "../db/schema";  // ✅ add users
import { sql,eq } from "drizzle-orm";


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
    // Total reports + average confidence
    const [agg] = await db
      .select({
        total: sql<number>`count(*)`,
        avgConfidence: sql<number>`avg(${reports.confidence})`,
      })
      .from(reports)
      .where(eq(reports.user_id, userId));

    // Reports created in the last 7 days
    const [weekAgg] = await db
      .select({
        weekCount: sql<number>`count(*)`,
      })
      .from(reports)
      .where(
        sql`${reports.user_id} = ${userId} AND ${reports.created_at} >= NOW() - interval '7 days'`
      );

    // When did this user register?
    const [userRow] = await db
      .select({ member_since: users.created_at })
      .from(users)
      .where(eq(users.id, userId));

    return {
      total_reports: Number(agg?.total ?? 0),
      average_confidence: agg?.avgConfidence ? Number(agg.avgConfidence) : null,
      reports_this_week: Number(weekAgg?.weekCount ?? 0),
      member_since: userRow?.member_since ?? null,
    };
  }
}
