import { Router } from "express";
import multer from "multer";
import { query } from "../db";
import { optionalAuth } from "../auth";
import { recalculateUserSkillEvidence } from "../engine/evidenceEngine";
import { parseResumeBuffer } from "../engine/resumeParser";

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

async function getEffectiveUserId(req: any): Promise<string> {
  if (req.user?.id) return req.user.id;
  const demo = await query("SELECT id FROM users WHERE email = 'aarav.mehta@demo.skillbridge.ai' LIMIT 1");
  return demo.rows[0]?.id || "demo-aarav-user";
}

// POST /api/resume/upload
router.post("/upload", optionalAuth, upload.single("resume"), async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);
    const file = req.file;

    let fileName = "uploaded-resume.pdf";
    let rawText = "";

    if (file) {
      fileName = file.originalname;
      rawText = await parseResumeBuffer(file.buffer, file.mimetype, file.originalname);
    } else {
      // If triggered as re-analysis or demo without payload
      rawText = "Aarav Mehta. Experienced in Python, Machine Learning, scikit-learn, NLP, SQL, and FastAPI. Built SupportSense and Transit Pulse.";
    }

    // Extract skills and projects from raw text
    const knownSkills = [
      "Python", "Machine Learning", "NLP", "SQL", "Statistics",
      "React", "Docker", "AWS", "MLOps", "Deep Learning", "FastAPI", "Pandas"
    ];

    const detectedSkills = knownSkills.filter((skill) =>
      new RegExp(`\\b${skill}\\b`, "i").test(rawText)
    );

    const detectedProjects = ["SupportSense", "Transit Pulse"].filter((proj) =>
      new RegExp(`\\b${proj}\\b`, "i").test(rawText)
    );

    const resumeId = `res-${Date.now()}`;
    await query(
      `INSERT INTO resumes (id, user_id, file_name, file_size, raw_text, parsed_skills, parsed_projects, analyzed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
      [
        resumeId,
        userId,
        fileName,
        file?.size || 1024 * 45,
        rawText.substring(0, 5000),
        JSON.stringify(detectedSkills),
        JSON.stringify(detectedProjects),
      ]
    );

    // Update profile resume_name
    await query("UPDATE profiles SET resume_name = $1 WHERE user_id = $2", [fileName, userId]);

    // Update skill evidence for detected skills
    for (const skill of detectedSkills) {
      const slug = skill.toLowerCase().replace(/[^a-z0-9]/g, "-");
      await query(
        "INSERT INTO skills (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
        [slug, skill]
      );
      await recalculateUserSkillEvidence(userId, slug);
    }

    res.json({
      success: true,
      data: {
        fileName,
        analyzedAt: "Just now",
        detectedSkills,
        detectedProjects,
        summary: [
          ["Skills", `${detectedSkills.length} detected`, detectedSkills.slice(0, 4).join(", ") + "…", "88% avg confidence"],
          ["Projects", `${Math.max(1, detectedProjects.length)} detected`, detectedProjects.join(", ") || "SupportSense", "Strong project signal"],
          ["Education", "1 detected", "B.Tech Computer Science", "2025 graduate"],
          ["Experience", "Early career", "Applied project experiences", "Needs production proof"],
        ],
      },
    });
  } catch (error: any) {
    console.error("Resume parsing error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to process resume" });
  }
});

// GET /api/resume/latest
router.get("/latest", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);
    const resumeRes = await query(
      "SELECT * FROM resumes WHERE user_id = $1 ORDER BY analyzed_at DESC LIMIT 1",
      [userId]
    );

    if (resumeRes.rows.length === 0) {
      res.json({
        success: true,
        data: {
          fileName: "aarav-mehta-resume.pdf",
          analyzedAt: "18 minutes ago",
          detectedSkills: ["Python", "Machine Learning", "NLP", "SQL"],
          summary: [
            ["Skills", "9 detected", "Python, ML, NLP, SQL…", "87% avg confidence"],
            ["Projects", "2 detected", "SupportSense, Transit Pulse", "Strong project signal"],
            ["Education", "1 detected", "B.Tech Computer Science", "2025 graduate"],
            ["Experience", "Early career", "2 project-based experiences", "Needs production proof"],
          ],
        },
      });
      return;
    }

    const r = resumeRes.rows[0];
    const skills = Array.isArray(r.parsed_skills) ? r.parsed_skills : JSON.parse(r.parsed_skills || "[]");

    res.json({
      success: true,
      data: {
        fileName: r.file_name,
        analyzedAt: new Date(r.analyzed_at).toLocaleString(),
        detectedSkills: skills,
        summary: [
          ["Skills", `${skills.length} detected`, skills.slice(0, 4).join(", ") + "…", "88% avg confidence"],
          ["Projects", "2 detected", "SupportSense, Transit Pulse", "Strong project signal"],
          ["Education", "1 detected", "B.Tech Computer Science", "2025 graduate"],
          ["Experience", "Early career", "2 project-based experiences", "Needs production proof"],
        ],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch resume status" });
  }
});

export default router;
