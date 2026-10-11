/** SkillBridge AI shared domain types across client and server. */

export type Difficulty = "Easy" | "Medium" | "Hard";
export type QuestionType = "Conceptual" | "Application" | "Scenario" | "Practical";
export type EvidenceSource = "Resume" | "Project" | "Assessment";
export type VerificationStatus = "Verified" | "Partially verified" | "Claimed";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Question {
  id: string;
  skill: string;
  topic: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswer?: string; // Optional on client to prevent cheating
  explanation: string;
  questionType: QuestionType;
}

export interface AssessmentAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  difficulty: Difficulty;
  topic: string;
}

export interface AssessmentAttempt {
  attemptId: string;
  userId: string;
  skill: string;
  questionIds: string[];
  currentQuestion: number;
  answers: AssessmentAnswer[];
  score?: number;
  startedAt: string;
  completedAt?: string;
  difficultyState: number;
  status: "active" | "completed";
  questions?: Question[];
}

export interface SkillEvidence {
  id: string;
  skill: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  confidence: number;
  assessmentScore: number;
  evidence: Record<EvidenceSource, boolean>;
  verificationStatus: VerificationStatus;
  summary: string;
  lastUpdated: string;
}

export interface JobMatch {
  id: string;
  role: string;
  company: string;
  location: string;
  workMode: "Remote" | "Hybrid" | "On-site";
  match: number;
  requiredSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  breakdown: { label: string; value: number }[];
  salary: string;
  description: string;
}

export interface RoadmapItem {
  id: string;
  stage: number;
  skill: string;
  reason: string;
  difficulty: Difficulty;
  effort: string;
  progress: number;
  status: "Complete" | "In progress" | "Next up" | "Queued";
}

export interface Notification {
  id: string;
  type: "assessment" | "skill" | "recommendation" | "job" | "roadmap";
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string[];
}

export interface Profile {
  id?: string;
  userId?: string;
  name: string;
  email: string;
  degree: string;
  specialization: string;
  college: string;
  graduationYear: string;
  targetRole: string;
  careerGoal: string;
  preferredLocation: string;
  experienceLevel: string;
  skills: string[];
  projects: ProjectItem[];
  resumeName: string;
}

export interface AssessmentHistoryItem {
  attemptId: string;
  skill: string;
  score: number;
  questionCount: number;
  difficulty: string;
  performance: string;
  date: string;
}

export interface ReadinessBreakdownItem {
  label: string;
  value: number;
  color?: string;
}

export interface CareerReadinessData {
  score: number;
  previousScore: number;
  delta: number;
  breakdown: ReadinessBreakdownItem[];
  blockers: { rank: string; skill: string; reason: string }[];
  radar: { subject: string; score: number; fullMark: number }[];
}

export interface SkillGapItem {
  name: string;
  value: number;
  status: "Matched" | "High priority" | "Medium priority";
  tone: "cyan" | "amber" | "indigo";
}

export interface SkillGapAnalysis {
  targetRole: string;
  roleCoverage: number;
  gaps: SkillGapItem[];
  priorityReasoning: { label: string; value: string; detail: string }[];
}

export interface ImpactOption {
  skill: string;
  readiness: number;
  lift: number;
  coverage: number;
  matches: number;
  role: string;
}
