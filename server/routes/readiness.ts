import { Router } from "express";
import { query } from "../db";
import { optionalAuth } from "../auth";
import { calculateCareerReadiness } from "../engine/readinessEngine";

const router = Router();

async function getEffectiveUserId(req: any): Promise<string> {
  if (req.user?.id) return req.user.id;
  const demo = await query("SELECT id FROM users WHERE email = 'aarav.mehta@demo.skillbridge.ai' LIMIT 1");
  return demo.rows[0]?.id || "demo-aarav-user";
}

// GET /api/readiness
router.get("/", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);
    const data = await calculateCareerReadiness(userId);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Career readiness calculate error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to calculate readiness" });
  }
});

export default router;
