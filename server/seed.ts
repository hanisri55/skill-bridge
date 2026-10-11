import bcrypt from "bcryptjs";
import { query } from "./db";
import { questionBank, jobs, demoProfile, skillEvidence, roadmap, notifications, assessmentHistory } from "../client/src/data/mockData";

export async function seedDatabase(): Promise<void> {
  // Check if skills already seeded
  const existingSkills = await query("SELECT COUNT(*) as count FROM skills");
  const skillCount = parseInt(existingSkills.rows[0]?.count || "0", 10);

  if (skillCount === 0) {
    console.log("[Seed] Seeding standard skills catalog...");
    const skillsToSeed = [
      { id: "python", name: "Python", category: "Technical", description: "General-purpose programming and data workflows." },
      { id: "sql", name: "SQL", category: "Technical", description: "Relational querying, joins, and aggregations." },
      { id: "ml", name: "Machine Learning", category: "Technical", description: "Predictive modeling, validation, and metrics." },
      { id: "nlp", name: "NLP", category: "Technical", description: "Language processing, embeddings, and transformers." },
      { id: "statistics", name: "Statistics", category: "Technical", description: "Probability, inference, and hypothesis testing." },
      { id: "dl", name: "Deep Learning", category: "Technical", description: "Neural architectures, optimization, and backprop." },
      { id: "react", name: "React", category: "Frontend", description: "Component-based web user interfaces." },
      { id: "docker", name: "Docker", category: "DevOps / MLOps", description: "Containerization and reproducible environments." },
      { id: "aws", name: "AWS", category: "Cloud", description: "Cloud computing and managed services." },
      { id: "mlops", name: "MLOps", category: "ML Engineering", description: "Model deployment, monitoring, and pipelines." },
    ];

    for (const s of skillsToSeed) {
      await query(
        "INSERT INTO skills (id, name, category, description) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING",
        [s.id, s.name, s.category, s.description]
      );
    }
  }

  // Check if questions already seeded
  const existingQuestions = await query("SELECT COUNT(*) as count FROM questions");
  const questionCount = parseInt(existingQuestions.rows[0]?.count || "0", 10);

  if (questionCount === 0) {
    console.log(`[Seed] Seeding ${questionBank.length} technical questions into question bank...`);
    const skillSlugMap: Record<string, string> = {
      "Python": "python",
      "SQL": "sql",
      "Machine Learning": "ml",
      "Statistics": "statistics",
      "NLP": "nlp",
      "Deep Learning": "dl",
    };

    for (const q of questionBank) {
      const skillId = skillSlugMap[q.skill] || q.skill.toLowerCase().replace(/\s+/g, "-");
      await query(
        `INSERT INTO questions (id, skill_id, topic, difficulty, question_type, question, options, correct_answer, explanation)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [q.id, skillId, q.topic, q.difficulty, q.questionType, q.question, JSON.stringify(q.options), q.correctAnswer, q.explanation]
      );
    }
  }

  // Check if jobs already seeded
  const existingJobs = await query("SELECT COUNT(*) as count FROM jobs");
  const jobCount = parseInt(existingJobs.rows[0]?.count || "0", 10);

  if (jobCount === 0) {
    console.log(`[Seed] Seeding ${jobs.length} opportunity roles...`);
    for (const j of jobs) {
      await query(
        `INSERT INTO jobs (id, role, company, location, work_mode, salary, description, required_skills)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [j.id, j.role, j.company, j.location, j.workMode, j.salary, j.description, JSON.stringify(j.requiredSkills)]
      );
    }
  }

  // Check if demo user exists
  const existingDemoUser = await query("SELECT id FROM users WHERE email = $1", ["aarav.mehta@demo.skillbridge.ai"]);
  if (existingDemoUser.rows.length === 0) {
    console.log("[Seed] Seeding default demo candidate (Aarav Mehta)...");
    const userId = "demo-aarav-user";
    const passwordHash = await bcrypt.hash("demo-password", 10);

    await query(
      "INSERT INTO users (id, email, password_hash, name) VALUES ($1, $2, $3, $4)",
      [userId, "aarav.mehta@demo.skillbridge.ai", passwordHash, demoProfile.name]
    );

    // Profile
    await query(
      `INSERT INTO profiles (id, user_id, degree, specialization, college, graduation_year, target_role, career_goal, preferred_location, experience_level, resume_name, onboarding_completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        "profile-" + userId,
        userId,
        demoProfile.degree,
        demoProfile.specialization,
        demoProfile.college,
        demoProfile.graduationYear,
        demoProfile.targetRole,
        demoProfile.careerGoal,
        demoProfile.preferredLocation,
        demoProfile.experienceLevel,
        demoProfile.resumeName,
        true,
      ]
    );

    // Projects
    for (let i = 0; i < demoProfile.projects.length; i++) {
      const p = demoProfile.projects[i];
      await query(
        "INSERT INTO user_projects (id, user_id, name, description, technologies) VALUES ($1, $2, $3, $4, $5)",
        [`project-${userId}-${i}`, userId, p.name, p.description, JSON.stringify(p.technologies)]
      );
    }

    // Skill evidence
    for (const se of skillEvidence) {
      await query(
        `INSERT INTO user_skill_evidence (id, user_id, skill_id, level, confidence, assessment_score, evidence_resume, evidence_project, evidence_assessment, verification_status, summary)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (user_id, skill_id) DO NOTHING`,
        [
          `se-${userId}-${se.id}`,
          userId,
          se.id,
          se.level,
          se.confidence,
          se.assessmentScore,
          se.evidence.Resume,
          se.evidence.Project,
          se.evidence.Assessment,
          se.verificationStatus,
          se.summary,
        ]
      );
    }

    // Roadmap items
    for (const r of roadmap) {
      await query(
        `INSERT INTO user_roadmaps (id, user_id, stage, skill, reason, difficulty, effort, progress, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [`road-${userId}-${r.id}`, userId, r.stage, r.skill, r.reason, r.difficulty, r.effort, r.progress, r.status]
      );
    }

    // Notifications
    for (const n of notifications) {
      await query(
        `INSERT INTO notifications (id, user_id, type, title, description, unread)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [`notif-${userId}-${n.id}`, userId, n.type, n.title, n.description, n.unread]
      );
    }

    // Assessment history
    const skillSlugMap: Record<string, string> = {
      "Python": "python",
      "Machine Learning": "ml",
      "SQL": "sql",
      "Statistics": "statistics",
      "NLP": "nlp",
      "Deep Learning": "dl",
    };

    for (let i = 0; i < assessmentHistory.length; i++) {
      const h = assessmentHistory[i];
      const attemptId = `att-seed-${h.attemptId}`;
      const skillId = skillSlugMap[h.skill] || "ml";
      await query(
        `INSERT INTO assessment_attempts (id, user_id, skill_id, question_ids, current_question, score, difficulty_state, status, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
        [attemptId, userId, skillId, JSON.stringify([]), 10, h.score, 1.8, "completed"]
      );
    }

    console.log("[Seed] Demo user and initial intelligence state successfully seeded.");
  }
}
