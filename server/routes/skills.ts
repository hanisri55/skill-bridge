import { Router } from "express";
import { query } from "../db";
import { optionalAuth } from "../auth";
import { analyzeSkillGaps, simulateSkillImpact } from "../engine/gapEngine";
import type { SkillEvidence } from "../../shared/types";

const router = Router();

async function getEffectiveUserId(req: any): Promise<string> {
  if (req.user?.id) return req.user.id;
  const demo = await query("SELECT id FROM users WHERE email = 'aarav.mehta@demo.skillbridge.ai' LIMIT 1");
  return demo.rows[0]?.id || "demo-aarav-user";
}

// GET /api/skills/portfolio
router.get("/portfolio", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);

    const evidenceRes = await query(
      `SELECT se.*, s.name as skill_name 
       FROM user_skill_evidence se 
       JOIN skills s ON se.skill_id = s.id 
       WHERE se.user_id = $1 
       ORDER BY se.confidence DESC`,
      [userId]
    );

    const portfolio: SkillEvidence[] = evidenceRes.rows.map((row) => ({
      id: row.skill_id,
      skill: row.skill_name,
      level: row.level,
      confidence: row.confidence,
      assessmentScore: row.assessment_score,
      evidence: {
        Resume: !!row.evidence_resume,
        Project: !!row.evidence_project,
        Assessment: !!row.evidence_assessment,
      },
      verificationStatus: row.verification_status,
      summary: row.summary,
      lastUpdated: new Date(row.last_updated).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));

    res.json({ success: true, data: portfolio });
  } catch (error: any) {
    console.error("Portfolio fetch error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch skills portfolio" });
  }
});

// GET /api/skills/gaps
router.get("/gaps", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);
    const gaps = await analyzeSkillGaps(userId);
    res.json({ success: true, data: gaps });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to analyze skill gaps" });
  }
});

// POST /api/skills/simulate-impact
router.post("/simulate-impact", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);
    const options = await simulateSkillImpact(userId);
    res.json({ success: true, data: options });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to simulate impact" });
  }
});

export default router;
