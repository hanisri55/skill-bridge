/** Signal Atlas assessment engine: stable local prototype of the future adaptive-assessment API. */
import { questionBank } from "@/data/mockData";
import type { AssessmentAnswer, AssessmentAttempt, Difficulty, Question } from "@/data/types";

export const QUESTIONS_PER_ATTEMPT = 10;

const difficultyWeight: Record<Difficulty, number> = { Easy: 1, Medium: 2, Hard: 3 };

export function getQuestionsForSkill(skill: string): Question[] {
  return questionBank.filter((question) => question.skill === skill);
}

function recentQuestionIds(skill: string, history: AssessmentAttempt[]): Set<string> {
  return new Set(history.filter((attempt) => attempt.skill === skill).slice(0, 2).flatMap((attempt) => attempt.questionIds));
}

function targetDifficulty(index: number, startingLevel: number): Difficulty {
  const target = Math.max(1, Math.min(3, startingLevel + (index >= 5 ? 1 : 0) + (index >= 8 ? 1 : 0)));
  if (target <= 1) return "Easy";
  if (target >= 3) return "Hard";
  return "Medium";
}

export function selectQuestionSet(skill: string, history: AssessmentAttempt[], userAbility = 1.7): Question[] {
  const bank = getQuestionsForSkill(skill);
  if (bank.length < QUESTIONS_PER_ATTEMPT) throw new Error(`Not enough questions for ${skill}.`);
  const recent = recentQuestionIds(skill, history);
  const used = new Set<string>();
  const startingLevel = Math.max(1, Math.min(3, Math.round(userAbility)));
  const selected: Question[] = [];

  // Pick by a planned adaptive difficulty curve. IDs remain fixed on the attempt so refreshes never mutate the test.
  for (let index = 0; index < QUESTIONS_PER_ATTEMPT; index += 1) {
    const desired = targetDifficulty(index, startingLevel);
    const candidates = bank
      .filter((question) => !used.has(question.id))
      .sort((a, b) => {
        const aPenalty = (a.difficulty === desired ? 0 : 1) + (recent.has(a.id) ? 4 : 0);
        const bPenalty = (b.difficulty === desired ? 0 : 1) + (recent.has(b.id) ? 4 : 0);
        return aPenalty - bPenalty || Math.random() - 0.5;
      });
    const next = candidates[0];
    if (!next) break;
    used.add(next.id);
    selected.push(next);
  }

  // The bank is intentionally larger than ten. This guard guarantees the product invariant even if data changes.
  if (selected.length !== QUESTIONS_PER_ATTEMPT) throw new Error("Assessment must contain exactly 10 unique questions.");
  return selected.sort(() => Math.random() - 0.5);
}

export function randomizeOptions(question: Question): Question {
  return { ...question, options: [...question.options].sort(() => Math.random() - 0.5) };
}

export function recordAnswer(attempt: AssessmentAttempt, question: Question, answer: string): AssessmentAttempt {
  const isCorrect = answer === question.correctAnswer;
  const nextAnswers: AssessmentAnswer[] = [...attempt.answers.filter((item) => item.questionId !== question.id), {
    questionId: question.id,
    answer,
    isCorrect,
    difficulty: question.difficulty,
    topic: question.topic,
  }];
  const direction = isCorrect ? 0.18 : -0.22;
  return {
    ...attempt,
    answers: nextAnswers,
    difficultyState: Math.max(0.5, Math.min(3, Number((attempt.difficultyState + direction).toFixed(2)))),
  };
}

export function scoreAttempt(attempt: AssessmentAttempt): number {
  if (attempt.answers.length === 0) return 0;
  return Math.round((attempt.answers.filter((answer) => answer.isCorrect).length / QUESTIONS_PER_ATTEMPT) * 100);
}

export function difficultySummary(attempt: AssessmentAttempt): string {
  const average = attempt.questionIds.length
    ? attempt.questionIds.reduce((sum, id) => {
      const question = questionBank.find((item) => item.id === id);
      return sum + (question ? difficultyWeight[question.difficulty] : 2);
    }, 0) / attempt.questionIds.length
    : 2;
  return `Adaptive · ${average.toFixed(1)}`;
}

export function abilityFromHistory(skill: string, history: AssessmentAttempt[]): number {
  const attempts = history.filter((attempt) => attempt.skill === skill && attempt.status === "completed");
  if (!attempts.length) return 1.7;
  const latest = attempts[0].score ?? scoreAttempt(attempts[0]);
  return latest >= 80 ? 2.5 : latest >= 65 ? 2 : 1.3;
}
