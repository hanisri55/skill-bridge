import { Router } from "express";
import { query } from "../db";
import { optionalAuth } from "../auth";
import { calculateCareerReadiness } from "../engine/readinessEngine";
import { matchJobsForUser } from "../engine/jobMatchingEngine";

const router = Router();

async function getEffectiveUserId(req: any): Promise<string> {
  if (req.user?.id) return req.user.id;
  const demo = await query("SELECT id FROM users WHERE email = 'aarav.mehta@demo.skillbridge.ai' LIMIT 1");
  return demo.rows[0]?.id || "demo-aarav-user";
}

// GET /api/analytics/overview
router.get("/overview", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);

    const readiness = await calculateCareerReadiness(userId);
    const jobs = await matchJobsForUser(userId);
    const bestMatch = jobs[0]?.match ?? 86;

    const roadmapRes = await query("SELECT progress, status FROM user_roadmaps WHERE user_id = $1", [userId]);
    let roadmapProgress = 68;
    if (roadmapRes.rows.length > 0) {
      const sum = roadmapRes.rows.reduce((acc, cur) => acc + (cur.progress || 0), 0);
      roadmapProgress = Math.round(sum / roadmapRes.rows.length);
    }

    const assessmentRes = await query(
      "SELECT score FROM assessment_attempts WHERE user_id = $1 AND status = 'completed'",
      [userId]
    );
    const assessmentCount = assessmentRes.rows.length;
    const avgScore = assessmentCount > 0
      ? Math.round(assessmentRes.rows.reduce((acc, cur) => acc + (cur.score || 0), 0) / assessmentCount)
      : 74;

    const growthSeries = [
      { month: "May", score: Math.max(40, readiness.score - 20), match: Math.max(45, bestMatch - 24), roadmap: 12 },
      { month: "Jun", score: Math.max(45, readiness.score - 15), match: Math.max(50, bestMatch - 19), roadmap: 22 },
      { month: "Jul", score: Math.max(55, readiness.score - 9), match: Math.max(60, bestMatch - 13), roadmap: 36 },
      { month: "Aug", score: Math.max(65, readiness.score - 4), match: Math.max(70, bestMatch - 7), roadmap: 52 },
      { month: "Sep", score: readiness.score, match: bestMatch, roadmap: roadmapProgress },
    ];

    res.json({
      success: true,
      data: {
        readiness: readiness.score,
        bestMatch,
        roadmapProgress,
        assessmentCount,
        avgScore,
        growthSeries,
      },
    });
  } catch (error: any) {
    console.error("Analytics overview error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch analytics" });
  }
});

export default router;
