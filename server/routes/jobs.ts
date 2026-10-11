import { Router } from "express";
import { query } from "../db";
import { optionalAuth } from "../auth";
import { matchJobsForUser } from "../engine/jobMatchingEngine";

const router = Router();

async function getEffectiveUserId(req: any): Promise<string> {
  if (req.user?.id) return req.user.id;
  const demo = await query("SELECT id FROM users WHERE email = 'aarav.mehta@demo.skillbridge.ai' LIMIT 1");
  return demo.rows[0]?.id || "demo-aarav-user";
}

// GET /api/jobs
router.get("/", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);
    const jobs = await matchJobsForUser(userId);
    res.json({ success: true, data: jobs });
  } catch (error: any) {
    console.error("Job match error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to match jobs" });
  }
});

// GET /api/jobs/:id
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);
    const jobs = await matchJobsForUser(userId);
    const job = jobs.find((j) => j.id === req.params.id);
    if (!job) {
      res.status(404).json({ success: false, error: "Job not found" });
      return;
    }
    res.json({ success: true, data: job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch job" });
  }
});

// POST /api/jobs/:id/save
router.post("/:id/save", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);
    const jobRes = await query("SELECT role, company FROM jobs WHERE id = $1", [req.params.id]);
    const job = jobRes.rows[0];
    if (job) {
      await query(
        `INSERT INTO notifications (id, user_id, type, title, description, unread, created_at)
         VALUES ($1, $2, 'job', $3, $4, TRUE, CURRENT_TIMESTAMP)`,
        [
          `notif-job-${Date.now()}`,
          userId,
          `Saved role: ${job.role}`,
          `${job.company} added to your opportunity list.`,
        ]
      );
    }
    res.json({ success: true, message: "Job saved successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to save job" });
  }
});

export default router;
