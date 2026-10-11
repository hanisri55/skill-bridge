import { Router } from "express";
import { query } from "../db";
import { optionalAuth } from "../auth";
import type { RoadmapItem } from "../../shared/types";

const router = Router();

async function getEffectiveUserId(req: any): Promise<string> {
  if (req.user?.id) return req.user.id;
  const demo = await query("SELECT id FROM users WHERE email = 'aarav.mehta@demo.skillbridge.ai' LIMIT 1");
  return demo.rows[0]?.id || "demo-aarav-user";
}

// GET /api/roadmap
router.get("/", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);

    const roadmapRes = await query(
      "SELECT * FROM user_roadmaps WHERE user_id = $1 ORDER BY stage ASC",
      [userId]
    );

    if (roadmapRes.rows.length === 0) {
      // Seed initial default roadmap for user
      const defaultRoadmap = [
        { stage: 1, skill: "Strengthen Python", reason: "Make your verified foundation effortless before adding production layers.", difficulty: "Medium", effort: "2 weeks · 8 hours", progress: 100, status: "Complete" },
        { stage: 2, skill: "Prove SQL depth", reason: "Analytical confidence lifts both data-science and ML-engineering matches.", difficulty: "Medium", effort: "2 weeks · 10 hours", progress: 68, status: "In progress" },
        { stage: 3, skill: "Learn Docker", reason: "Your highest-impact next skill; unlocks repeatable model serving workflows.", difficulty: "Medium", effort: "3 weeks · 12 hours", progress: 18, status: "Next up" },
        { stage: 4, skill: "Build on AWS", reason: "Turn local experiments into deployable, observable systems.", difficulty: "Hard", effort: "4 weeks · 16 hours", progress: 0, status: "Queued" },
        { stage: 5, skill: "Develop MLOps", reason: "Close the gap between a promising model and a dependable product.", difficulty: "Hard", effort: "5 weeks · 22 hours", progress: 0, status: "Queued" },
      ];

      for (const item of defaultRoadmap) {
        await query(
          `INSERT INTO user_roadmaps (id, user_id, stage, skill, reason, difficulty, effort, progress, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [`road-${userId}-${item.stage}`, userId, item.stage, item.skill, item.reason, item.difficulty, item.effort, item.progress, item.status]
        );
      }

      const seeded = await query("SELECT * FROM user_roadmaps WHERE user_id = $1 ORDER BY stage ASC", [userId]);
      const items: RoadmapItem[] = seeded.rows.map((r) => ({
        id: r.id,
        stage: r.stage,
        skill: r.skill,
        reason: r.reason,
        difficulty: r.difficulty,
        effort: r.effort,
        progress: r.progress,
        status: r.status,
      }));
      res.json({ success: true, data: items });
      return;
    }

    const items: RoadmapItem[] = roadmapRes.rows.map((r) => ({
      id: r.id,
      stage: r.stage,
      skill: r.skill,
      reason: r.reason,
      difficulty: r.difficulty,
      effort: r.effort,
      progress: r.progress,
      status: r.status,
    }));

    res.json({ success: true, data: items });
  } catch (error: any) {
    console.error("Fetch roadmap error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch roadmap" });
  }
});

// POST /api/roadmap/:id/complete
router.post("/:id/complete", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);
    const roadId = req.params.id;

    // Find milestone by ID or stage
    const rowRes = await query(
      "SELECT * FROM user_roadmaps WHERE (id = $1 OR id LIKE $2) AND user_id = $3",
      [roadId, `%${roadId}%`, userId]
    );

    if (rowRes.rows.length === 0) {
      res.status(404).json({ success: false, error: "Milestone not found" });
      return;
    }

    const targetId = rowRes.rows[0].id;
    const skill = rowRes.rows[0].skill;

    await query(
      "UPDATE user_roadmaps SET status = 'Complete', progress = 100, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [targetId]
    );

    // Create notification
    await query(
      `INSERT INTO notifications (id, user_id, type, title, description, unread, created_at)
       VALUES ($1, $2, 'roadmap', $3, $4, TRUE, CURRENT_TIMESTAMP)`,
      [
        `notif-road-${Date.now()}`,
        userId,
        `${skill} milestone completed`,
        "Your personalized learning sequence updated. Readiness momentum increased.",
      ]
    );

    res.json({ success: true, message: "Milestone marked complete" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update milestone" });
  }
});

export default router;
