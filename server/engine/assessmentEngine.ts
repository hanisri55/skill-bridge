import { query } from "../db";
import { recalculateUserSkillEvidence } from "./evidenceEngine";
import type { AssessmentAttempt, Difficulty, Question } from "../../shared/types";

export const QUESTIONS_PER_ATTEMPT = 10;
const difficultyWeight: Record<Difficulty, number> = { Easy: 1, Medium: 2, Hard: 3 };

function targetDifficulty(index: number, startingLevel: number): Difficulty {
  const target = Math.max(1, Math.min(3, startingLevel + (index >= 5 ? 1 : 0) + (index >= 8 ? 1 : 0)));
  if (target <= 1) return "Easy";
  if (target >= 3) return "Hard";
  return "Medium";
}

export async function createAssessmentAttempt(userId: string, skillName: string): Promise<AssessmentAttempt> {
  // Resolve skill_id from name or slug
  const skillRes = await query("SELECT id, name FROM skills WHERE name ILIKE $1 OR id = $1 LIMIT 1", [skillName]);
  if (skillRes.rows.length === 0) {
    throw new Error(`Skill ${skillName} not found.`);
  }
  const skillId = skillRes.rows[0].id;
  const canonicalName = skillRes.rows[0].name;

  // Check recent questions used in last 2 attempts
  const recentRes = await query(
    `SELECT question_ids FROM assessment_attempts 
     WHERE user_id = $1 AND skill_id = $2 
     ORDER BY started_at DESC LIMIT 2`,
    [userId, skillId]
  );
  const recentIds = new Set<string>();
  for (const row of recentRes.rows) {
    const ids: string[] = Array.isArray(row.question_ids) ? row.question_ids : JSON.parse(row.question_ids || "[]");
    ids.forEach((id) => recentIds.add(id));
  }

  // Get user starting ability from history
  const historyRes = await query(
    `SELECT score FROM assessment_attempts 
     WHERE user_id = $1 AND skill_id = $2 AND status = 'completed' 
     ORDER BY completed_at DESC LIMIT 1`,
    [userId, skillId]
  );
  let userAbility = 1.7;
  if (historyRes.rows.length > 0 && historyRes.rows[0].score != null) {
    const s = historyRes.rows[0].score;
    userAbility = s >= 80 ? 2.5 : s >= 65 ? 2.0 : 1.3;
  }
  const startingLevel = Math.max(1, Math.min(3, Math.round(userAbility)));

  // Fetch all questions for this skill
  const bankRes = await query<Question>(
    `SELECT id, skill_id as skill, topic, difficulty, question_type as "questionType", question, options, correct_answer as "correctAnswer", explanation 
     FROM questions WHERE skill_id = $1`,
    [skillId]
  );
  const bank = bankRes.rows;
  if (bank.length < QUESTIONS_PER_ATTEMPT) {
    throw new Error(`Not enough questions in bank for ${canonicalName} (found ${bank.length}, need ${QUESTIONS_PER_ATTEMPT}).`);
  }

  const used = new Set<string>();
  const selectedQuestions: Question[] = [];

  for (let index = 0; index < QUESTIONS_PER_ATTEMPT; index++) {
    const desired = targetDifficulty(index, startingLevel);
    const candidates = bank
      .filter((q) => !used.has(q.id))
      .sort((a, b) => {
        const aPenalty = (a.difficulty === desired ? 0 : 1) + (recentIds.has(a.id) ? 4 : 0);
        const bPenalty = (b.difficulty === desired ? 0 : 1) + (recentIds.has(b.id) ? 4 : 0);
        return aPenalty - bPenalty || Math.random() - 0.5;
      });

    const next = candidates[0];
    if (!next) break;
    used.add(next.id);
    selectedQuestions.push(next);
  }

  if (selectedQuestions.length !== QUESTIONS_PER_ATTEMPT) {
    throw new Error("Unable to select 10 unique questions for assessment.");
  }

  // Shuffle order of 10 questions
  selectedQuestions.sort(() => Math.random() - 0.5);

  const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const questionIds = selectedQuestions.map((q) => q.id);

  await query(
    `INSERT INTO assessment_attempts (id, user_id, skill_id, question_ids, current_question, score, difficulty_state, status, started_at)
     VALUES ($1, $2, $3, $4, 0, NULL, $5, 'active', CURRENT_TIMESTAMP)`,
    [attemptId, userId, skillId, JSON.stringify(questionIds), userAbility]
  );

  return {
    attemptId,
    userId,
    skill: canonicalName,
    questionIds,
    currentQuestion: 0,
    answers: [],
    difficultyState: userAbility,
    status: "active",
    startedAt: new Date().toISOString(),
    questions: selectedQuestions.map((q) => ({
      id: q.id,
      skill: canonicalName,
      topic: q.topic,
      difficulty: q.difficulty,
      questionType: q.questionType,
      question: q.question,
      options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || "[]"),
      explanation: q.explanation,
    })),
  };
}

export async function submitAssessmentAnswer(
  attemptId: string,
  userId: string,
  questionId: string,
  userAnswer: string
): Promise<{ isCorrect: boolean; difficultyState: number }> {
  // Fetch attempt
  const attemptRes = await query(
    "SELECT * FROM assessment_attempts WHERE id = $1 AND user_id = $2",
    [attemptId, userId]
  );
  if (attemptRes.rows.length === 0) throw new Error("Attempt not found");
  const attempt = attemptRes.rows[0];

  // Fetch question
  const qRes = await query(
    "SELECT * FROM questions WHERE id = $1",
    [questionId]
  );
  if (qRes.rows.length === 0) throw new Error("Question not found");
  const q = qRes.rows[0];

  const isCorrect = q.correct_answer.trim().toLowerCase() === userAnswer.trim().toLowerCase();
  const direction = isCorrect ? 0.18 : -0.22;
  const currentDiff = attempt.difficulty_state || 1.7;
  const nextDiff = Math.max(0.5, Math.min(3.0, Number((currentDiff + direction).toFixed(2))));

  // Record or update answer
  const answerId = `ans-${attemptId}-${questionId}`;
  await query(
    `INSERT INTO assessment_answers (id, attempt_id, question_id, user_answer, is_correct, difficulty, topic, answered_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
     ON CONFLICT (attempt_id, question_id) DO UPDATE SET
       user_answer = EXCLUDED.user_answer,
       is_correct = EXCLUDED.is_correct,
       answered_at = CURRENT_TIMESTAMP`,
    [answerId, attemptId, questionId, userAnswer, isCorrect, q.difficulty, q.topic]
  );

  // Update attempt difficulty state
  await query(
    "UPDATE assessment_attempts SET difficulty_state = $1 WHERE id = $2",
    [nextDiff, attemptId]
  );

  return { isCorrect, difficultyState: nextDiff };
}

export async function finishAssessmentAttempt(
  attemptId: string,
  userId: string
): Promise<{ score: number; skill: string }> {
  const attemptRes = await query(
    "SELECT at.*, s.name as skill_name FROM assessment_attempts at JOIN skills s ON at.skill_id = s.id WHERE at.id = $1 AND at.user_id = $2",
    [attemptId, userId]
  );
  if (attemptRes.rows.length === 0) throw new Error("Attempt not found");
  const attempt = attemptRes.rows[0];

  // Count correct answers
  const answersRes = await query(
    "SELECT is_correct FROM assessment_answers WHERE attempt_id = $1",
    [attemptId]
  );
  const correctCount = answersRes.rows.filter((a) => a.is_correct).length;
  const score = Math.round((correctCount / QUESTIONS_PER_ATTEMPT) * 100);

  await query(
    `UPDATE assessment_attempts 
     SET score = $1, status = 'completed', completed_at = CURRENT_TIMESTAMP, current_question = 9 
     WHERE id = $2`,
    [score, attemptId]
  );

  // Recalculate skill evidence
  await recalculateUserSkillEvidence(userId, attempt.skill_id);

  // Trigger in-app notification
  const notifId = `notif-ass-${Date.now()}`;
  await query(
    `INSERT INTO notifications (id, user_id, type, title, description, unread, created_at)
     VALUES ($1, $2, 'assessment', $3, $4, TRUE, CURRENT_TIMESTAMP)`,
    [
      notifId,
      userId,
      `${attempt.skill_name} assessment scored ${score}%`,
      `Your verified signal updated to ${score >= 70 ? "Verified" : "Partially verified"}.`,
    ]
  );

  return { score, skill: attempt.skill_name };
}
