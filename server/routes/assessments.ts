import { Router } from "express";
import { query } from "../db";
import { optionalAuth } from "../auth";
import {
  createAssessmentAttempt,
  submitAssessmentAnswer,
  finishAssessmentAttempt,
  QUESTIONS_PER_ATTEMPT,
} from "../engine/assessmentEngine";
import type { Question } from "../../shared/types";

const router = Router();

async function getEffectiveUserId(req: any): Promise<string> {
  if (req.user?.id) return req.user.id;
  const demo = await query("SELECT id FROM users WHERE email = 'aarav.mehta@demo.skillbridge.ai' LIMIT 1");
  return demo.rows[0]?.id || "demo-aarav-user";
}

// GET /api/assessments/skills
router.get("/skills", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);

    const skillsRes = await query(
      `SELECT s.id, s.name, COUNT(q.id) as question_count 
       FROM skills s 
       JOIN questions q ON s.id = q.skill_id 
       GROUP BY s.id, s.name 
       HAVING COUNT(q.id) >= $1`,
      [QUESTIONS_PER_ATTEMPT]
    );

    const data = await Promise.all(
      skillsRes.rows.map(async (row) => {
        const attemptRes = await query(
          `SELECT score FROM assessment_attempts 
           WHERE user_id = $1 AND skill_id = $2 AND status = 'completed' 
           ORDER BY completed_at DESC LIMIT 1`,
          [userId, row.id]
        );
        return {
          id: row.id,
          name: row.name,
          questionCount: parseInt(row.question_count, 10),
          lastScore: attemptRes.rows[0]?.score ?? null,
        };
      })
    );

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch assessable skills" });
  }
});

// POST /api/assessments/start
router.post("/start", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);
    const { skill } = req.body;
    if (!skill) {
      res.status(400).json({ success: false, error: "Skill name is required." });
      return;
    }

    const attempt = await createAssessmentAttempt(userId, skill);
    res.json({ success: true, data: attempt });
  } catch (error: any) {
    console.error("Start assessment error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to start assessment" });
  }
});

// GET /api/assessments/active
router.get("/active", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);
    const attemptRes = await query(
      `SELECT at.*, s.name as skill_name 
       FROM assessment_attempts at 
       JOIN skills s ON at.skill_id = s.id 
       WHERE at.user_id = $1 AND at.status = 'active' 
       ORDER BY at.started_at DESC LIMIT 1`,
      [userId]
    );

    if (attemptRes.rows.length === 0) {
      res.json({ success: true, data: null });
      return;
    }

    const attempt = attemptRes.rows[0];
    const questionIds: string[] = Array.isArray(attempt.question_ids)
      ? attempt.question_ids
      : JSON.parse(attempt.question_ids || "[]");

    // Fetch questions, excluding correct_answer to prevent client inspection
    const questionsRes = await query(
      `SELECT id, skill_id as skill, topic, difficulty, question_type as "questionType", question, options, explanation 
       FROM questions WHERE id = ANY($1)`,
      [questionIds]
    );

    // Fetch recorded answers
    const answersRes = await query(
      "SELECT question_id, user_answer, is_correct, difficulty, topic FROM assessment_answers WHERE attempt_id = $1",
      [attempt.id]
    );

    const questionsMap = new Map<string, Question>();
    for (const q of questionsRes.rows) {
      questionsMap.set(q.id, {
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || "[]"),
      });
    }

    // Preserve exact selected sequence
    const questions = questionIds.map((id) => questionsMap.get(id)).filter(Boolean);

    res.json({
      success: true,
      data: {
        attemptId: attempt.id,
        userId: attempt.user_id,
        skill: attempt.skill_name,
        questionIds,
        currentQuestion: attempt.current_question || 0,
        difficultyState: attempt.difficulty_state || 1.7,
        status: attempt.status,
        startedAt: attempt.started_at,
        questions,
        answers: answersRes.rows.map((a) => ({
          questionId: a.question_id,
          answer: a.user_answer,
          isCorrect: a.is_correct,
          difficulty: a.difficulty,
          topic: a.topic,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch active attempt" });
  }
});

// POST /api/assessments/answer
router.post("/answer", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);
    const { attemptId, questionId, answer } = req.body;

    if (!attemptId || !questionId || !answer) {
      res.status(400).json({ success: false, error: "attemptId, questionId, and answer are required." });
      return;
    }

    const result = await submitAssessmentAnswer(attemptId, userId, questionId, answer);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to submit answer" });
  }
});

// POST /api/assessments/finish
router.post("/finish", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);
    const { attemptId } = req.body;

    if (!attemptId) {
      res.status(400).json({ success: false, error: "attemptId is required." });
      return;
    }

    const result = await finishAssessmentAttempt(attemptId, userId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to finish attempt" });
  }
});

// GET /api/assessments/history
router.get("/history", optionalAuth, async (req, res) => {
  try {
    const userId = await getEffectiveUserId(req);
    const historyRes = await query(
      `SELECT at.id as "attemptId", s.name as skill, at.score, at.difficulty_state, at.completed_at 
       FROM assessment_attempts at 
       JOIN skills s ON at.skill_id = s.id 
       WHERE at.user_id = $1 AND at.status = 'completed' 
       ORDER BY at.completed_at DESC`,
      [userId]
    );

    const history = historyRes.rows.map((row) => ({
      attemptId: row.attemptId,
      skill: row.skill,
      score: row.score ?? 70,
      questionCount: QUESTIONS_PER_ATTEMPT,
      difficulty: `Adaptive · ${Number(row.difficulty_state || 1.8).toFixed(1)}`,
      performance: (row.score ?? 70) >= 80 ? "Strong applied signal" : (row.score ?? 70) >= 65 ? "Improving steadily" : "Foundational",
      date: new Date(row.completed_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    }));

    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch assessment history" });
  }
});

export default router;
