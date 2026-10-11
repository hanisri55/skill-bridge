import { Router } from "express";
import { query } from "../db";
import { optionalAuth } from "../auth";
import { calculateCareerReadiness } from "../engine/readinessEngine";
import { analyzeSkillGaps } from "../engine/gapEngine";

const router = Router();

async function getEffectiveUserId(req: any): Promise<string> {
  if (req.user?.id) return req.user.id;
  const demo = await query("SELECT id FROM users WHERE email = 'aarav.mehta@demo.skillbridge.ai' LIMIT 1");
  return demo.rows[0]?.id || "demo-aarav-user";
}

// POST /api/assistant/chat
router.post("/chat", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ success: false, error: "Message is required." });
      return;
    }

    // Fetch user context
    const profileRes = await query("SELECT * FROM profiles WHERE user_id = $1", [userId]);
    const profile = profileRes.rows[0] || {};
    const targetRole = profile.target_role || "AI / ML Engineer";

    const readiness = await calculateCareerReadiness(userId);
    const gaps = await analyzeSkillGaps(userId);

    const promptLower = message.toLowerCase();
    let reply = "";

    const highestPriorityGap = gaps.gaps.find((g) => g.status === "High priority")?.name || "Docker";

    if (promptLower.includes("next") || promptLower.includes("learn")) {
      reply = `${highestPriorityGap} is your highest-impact next move. It is currently a priority gap for your target role (${targetRole}), and closing it will raise your readiness by an estimated 6 points while unlocking production workflows for MLOps.`;
    } else if (promptLower.includes("match") || promptLower.includes("low") || promptLower.includes("job")) {
      const topBlockers = readiness.blockers.map((b) => b.skill).join(" and ");
      reply = `Your match score is currently pulled down by unverified production signals: ${topBlockers} are claimed or missing. Proving either through an applied project or adaptive assessment will raise your role match faster than adding more conceptual coursework.`;
    } else if (promptLower.includes("improve") || promptLower.includes("score")) {
      reply = `Focus on three signals right now: ${highestPriorityGap} containerization, proving SQL analytical depth, and hypothesis testing. Your composite readiness is currently ${readiness.score}/100, and addressing these will help cross into advanced career readiness.`;
    } else if (promptLower.includes("engineer") || promptLower.includes("role") || promptLower.includes("path")) {
      reply = `Your path toward ${targetRole} is credible: strengthen your verified core, build a containerized project in ${highestPriorityGap}, then acquire deployment habits in AWS. The evidence loop (Project + Assessment proof) matters more than passive certificate collection.`;
    } else {
      reply = `Based on your live profile (${targetRole}, current readiness: ${readiness.score}/100), your primary unlock is turning ${highestPriorityGap} into verified evidence. Would you like a suggested project milestone or guidance on taking an adaptive assessment?`;
    }

    // Save messages to history
    await query(
      "INSERT INTO assistant_messages (id, user_id, role, content) VALUES ($1, $2, 'user', $3)",
      [`msg-u-${Date.now()}`, userId, message]
    );
    await query(
      "INSERT INTO assistant_messages (id, user_id, role, content) VALUES ($1, $2, 'ai', $3)",
      [`msg-a-${Date.now()}`, userId, reply]
    );

    res.json({
      success: true,
      data: {
        role: "ai",
        text: reply,
      },
    });
  } catch (error: any) {
    console.error("Assistant chat error:", error);
    res.status(500).json({ success: false, error: error.message || "Assistant unavailable" });
  }
});

// GET /api/assistant/history
router.get("/history", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);
    const msgRes = await query(
      "SELECT role, content as text FROM assistant_messages WHERE user_id = $1 ORDER BY created_at ASC LIMIT 50",
      [userId]
    );

    if (msgRes.rows.length === 0) {
      res.json({
        success: true,
        data: [
          { role: "ai", text: "I’m your SkillBridge guide. Ask about your next skill, your match, or the path to an AI Engineer role." },
        ],
      });
      return;
    }

    res.json({ success: true, data: msgRes.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch chat history" });
  }
});

export default router;
