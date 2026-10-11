import { Router } from "express";
import { query } from "../db";
import { requireAuth, optionalAuth } from "../auth";
import type { Profile } from "../../shared/types";

const router = Router();

// Helper to get effective user ID
async function getEffectiveUserId(req: any): Promise<string> {
  if (req.user?.id) return req.user.id;
  // Default to demo user if unauthenticated
  const demo = await query("SELECT id FROM users WHERE email = 'aarav.mehta@demo.skillbridge.ai' LIMIT 1");
  return demo.rows[0]?.id || "demo-aarav-user";
}

// GET /api/profile
router.get("/", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);

    const userRes = await query("SELECT id, email, name FROM users WHERE id = $1", [userId]);
    const profileRes = await query("SELECT * FROM profiles WHERE user_id = $1", [userId]);
    const projectsRes = await query("SELECT name, description, technologies FROM user_projects WHERE user_id = $1 ORDER BY created_at ASC", [userId]);
    const skillsRes = await query(
      `SELECT s.name 
       FROM user_skill_evidence se 
       JOIN skills s ON se.skill_id = s.id 
       WHERE se.user_id = $1`,
      [userId]
    );

    const user = userRes.rows[0] || { name: "Aarav Mehta", email: "aarav.mehta@demo.skillbridge.ai" };
    const p = profileRes.rows[0] || {};

    const profile: Profile = {
      id: p.id,
      userId,
      name: user.name,
      email: user.email,
      degree: p.degree || "B.Tech Computer Science",
      specialization: p.specialization || "Intelligent Systems",
      college: p.college || "Pune Institute of Technology",
      graduationYear: p.graduation_year || "2025",
      targetRole: p.target_role || "AI / ML Engineer",
      careerGoal: p.career_goal || "Build reliable ML products that turn messy data into useful decisions.",
      preferredLocation: p.preferred_location || "Bengaluru · Remote",
      experienceLevel: p.experience_level || "Early career",
      skills: skillsRes.rows.map((r) => r.name),
      projects: projectsRes.rows.map((r) => ({
        name: r.name,
        description: r.description,
        technologies: Array.isArray(r.technologies) ? r.technologies : JSON.parse(r.technologies || "[]"),
      })),
      resumeName: p.resume_name || "aarav-mehta-resume.pdf",
    };

    res.json({ success: true, data: profile });
  } catch (error: any) {
    console.error("Fetch profile error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch profile" });
  }
});

// PUT /api/profile
router.put("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const {
      name,
      degree,
      specialization,
      college,
      graduationYear,
      targetRole,
      careerGoal,
      preferredLocation,
      experienceLevel,
    } = req.body;

    if (name) {
      await query("UPDATE users SET name = $1 WHERE id = $2", [name, userId]);
    }

    await query(
      `UPDATE profiles SET
         degree = COALESCE($1, degree),
         specialization = COALESCE($2, specialization),
         college = COALESCE($3, college),
         graduation_year = COALESCE($4, graduation_year),
         target_role = COALESCE($5, target_role),
         career_goal = COALESCE($6, career_goal),
         preferred_location = COALESCE($7, preferred_location),
         experience_level = COALESCE($8, experience_level),
         updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $9`,
      [degree, specialization, college, graduationYear, targetRole, careerGoal, preferredLocation, experienceLevel, userId]
    );

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update profile" });
  }
});

// POST /api/profile/onboarding
router.post("/onboarding", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);
    const {
      name,
      email,
      degree,
      specialization,
      college,
      graduationYear,
      targetRole,
      careerGoal,
      preferredLocation,
      skills,
      projects,
    } = req.body;

    if (name) {
      await query("UPDATE users SET name = $1 WHERE id = $2", [name, userId]);
    }

    await query(
      `UPDATE profiles SET
         degree = $1,
         specialization = $2,
         college = $3,
         graduation_year = $4,
         target_role = $5,
         career_goal = $6,
         preferred_location = $7,
         onboarding_completed = TRUE,
         updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $8`,
      [degree, specialization, college, graduationYear, targetRole, careerGoal, preferredLocation, userId]
    );

    // Save projects if provided
    if (Array.isArray(projects) && projects.length > 0) {
      await query("DELETE FROM user_projects WHERE user_id = $1", [userId]);
      for (let i = 0; i < projects.length; i++) {
        const p = projects[i];
        if (p.name) {
          await query(
            "INSERT INTO user_projects (id, user_id, name, description, technologies) VALUES ($1, $2, $3, $4, $5)",
            [`proj-${userId}-${i}-${Date.now()}`, userId, p.name, p.description || "", JSON.stringify(p.technologies || [])]
          );
        }
      }
    }

    // Register claimed skills into user_skill_evidence
    if (Array.isArray(skills)) {
      for (const skillName of skills) {
        const skillSlug = skillName.toLowerCase().replace(/[^a-z0-9]/g, "-");
        // Ensure skill in catalog
        await query(
          "INSERT INTO skills (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
          [skillSlug, skillName]
        );

        await query(
          `INSERT INTO user_skill_evidence (id, user_id, skill_id, level, confidence, verification_status, summary)
           VALUES ($1, $2, $3, 'Beginner', 30, 'Claimed', 'Claimed during onboarding profile setup.')
           ON CONFLICT (user_id, skill_id) DO NOTHING`,
          [`se-${userId}-${skillSlug}`, userId, skillSlug]
        );
      }
    }

    res.json({ success: true, message: "Onboarding completed successfully" });
  } catch (error: any) {
    console.error("Onboarding save error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to complete onboarding" });
  }
});

export default router;
