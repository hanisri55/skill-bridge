import { Router } from "express";
import { query } from "../db";
import { optionalAuth } from "../auth";
import type { Notification } from "../../shared/types";

const router = Router();

async function getEffectiveUserId(req: any): Promise<string> {
  if (req.user?.id) return req.user.id;
  const demo = await query("SELECT id FROM users WHERE email = 'aarav.mehta@demo.skillbridge.ai' LIMIT 1");
  return demo.rows[0]?.id || "demo-aarav-user";
}

// GET /api/notifications
router.get("/", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);

    const notifRes = await query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
      [userId]
    );

    const notifications: Notification[] = notifRes.rows.map((row) => {
      const diffMs = Date.now() - new Date(row.created_at).getTime();
      const mins = Math.floor(diffMs / 60000);
      let time = "Just now";
      if (mins >= 60 * 24) time = `${Math.floor(mins / (60 * 24))} days ago`;
      else if (mins >= 60) time = `${Math.floor(mins / 60)} hours ago`;
      else if (mins > 0) time = `${mins} min ago`;

      return {
        id: row.id,
        type: row.type,
        title: row.title,
        description: row.description,
        time,
        unread: !!row.unread,
      };
    });

    res.json({ success: true, data: notifications });
  } catch (error: any) {
    console.error("Notifications fetch error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch notifications" });
  }
});

// PATCH /api/notifications/read-all
router.patch("/read-all", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);
    await query("UPDATE notifications SET unread = FALSE WHERE user_id = $1", [userId]);
    res.json({ success: true, message: "Marked all as read" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update notifications" });
  }
});

export default router;
