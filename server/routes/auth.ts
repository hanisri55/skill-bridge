import { Router } from "express";
import { query } from "../db";
import { hashPassword, comparePassword, generateToken, requireAuth } from "../auth";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 8) {
      res.status(400).json({ success: false, error: "Please provide name, email, and password (at least 8 chars)." });
      return;
    }

    // Check duplicate
    const existing = await query("SELECT id FROM users WHERE email = $1", [email.trim().toLowerCase()]);
    if (existing.rows.length > 0) {
      res.status(409).json({ success: false, error: "An account with this email already exists." });
      return;
    }

    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const passwordHash = await hashPassword(password);

    await query(
      "INSERT INTO users (id, email, password_hash, name) VALUES ($1, $2, $3, $4)",
      [userId, email.trim().toLowerCase(), passwordHash, name.trim()]
    );

    // Create default empty profile
    const profileId = `profile-${userId}`;
    await query(
      "INSERT INTO profiles (id, user_id, onboarding_completed) VALUES ($1, $2, FALSE)",
      [profileId, userId]
    );

    const token = generateToken({ id: userId, email: email.trim().toLowerCase(), name: name.trim() });

    const isProd = process.env.NODE_ENV === "production";
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      maxAge: ONE_YEAR_MS,
      sameSite: "lax",
      secure: isProd,
    });

    res.json({
      success: true,
      data: {
        user: { id: userId, email: email.trim().toLowerCase(), name: name.trim() },
        token,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, error: error.message || "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: "Email and password are required." });
      return;
    }

    const userRes = await query("SELECT * FROM users WHERE email = $1", [email.trim().toLowerCase()]);
    if (userRes.rows.length === 0) {
      res.status(401).json({ success: false, error: "Invalid email or password." });
      return;
    }

    const user = userRes.rows[0];
    const match = await comparePassword(password, user.password_hash);
    if (!match) {
      res.status(401).json({ success: false, error: "Invalid email or password." });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name });

    const isProd = process.env.NODE_ENV === "production";
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      maxAge: ONE_YEAR_MS,
      sameSite: "lax",
      secure: isProd,
    });

    // Fetch profile
    const profileRes = await query("SELECT * FROM profiles WHERE user_id = $1", [user.id]);
    const profile = profileRes.rows[0] || null;

    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        profile,
        token,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: error.message || "Login failed" });
  }
});

// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ success: true, message: "Logged out successfully" });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userRes = await query("SELECT id, email, name, created_at FROM users WHERE id = $1", [req.user!.id]);
    if (userRes.rows.length === 0) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    const profileRes = await query("SELECT * FROM profiles WHERE user_id = $1", [req.user!.id]);

    res.json({
      success: true,
      data: {
        user: userRes.rows[0],
        profile: profileRes.rows[0] || null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch user" });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || password.length < 8) {
      res.status(400).json({ success: false, error: "Email and password (at least 8 chars) required." });
      return;
    }

    const hash = await hashPassword(password);
    const updateRes = await query("UPDATE users SET password_hash = $1 WHERE email = $2", [hash, email.trim().toLowerCase()]);

    if (updateRes.rowCount === 0) {
      res.status(404).json({ success: false, error: "No account found with this email." });
      return;
    }

    res.json({ success: true, message: "Password updated successfully." });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Password reset failed" });
  }
});

export default router;
