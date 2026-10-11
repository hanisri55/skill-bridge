import { query } from "../db";
import type { VerificationStatus } from "../../shared/types";

export interface EvidenceCalculationInput {
  hasResume: boolean;
  hasProject: boolean;
  assessmentScore?: number | null;
}

export function calculateSkillConfidence(input: EvidenceCalculationInput): {
  confidence: number;
  verificationStatus: VerificationStatus;
  level: "Beginner" | "Intermediate" | "Advanced";
} {
  let score = 0;

  if (input.hasResume) score += 25;
  if (input.hasProject) score += 35;

  if (input.assessmentScore != null && input.assessmentScore > 0) {
    // Assessment contributes up to 40 points
    score += Math.round((input.assessmentScore / 100) * 40);
  }

  // Minimum floor if claimed on resume
  if (score === 0 && input.hasResume) score = 20;

  const confidence = Math.max(15, Math.min(100, score));

  let verificationStatus: VerificationStatus = "Claimed";
  if (input.assessmentScore != null && input.assessmentScore >= 70 && (input.hasResume || input.hasProject)) {
    verificationStatus = "Verified";
  } else if ((input.hasResume && input.hasProject) || (input.assessmentScore != null && input.assessmentScore >= 50)) {
    verificationStatus = "Partially verified";
  }

  let level: "Beginner" | "Intermediate" | "Advanced" = "Beginner";
  if (confidence >= 80) level = "Advanced";
  else if (confidence >= 60) level = "Intermediate";

  return { confidence, verificationStatus, level };
}

export async function recalculateUserSkillEvidence(userId: string, skillId: string): Promise<void> {
  // Check resume presence for this skill
  const resumeRes = await query(
    "SELECT parsed_skills FROM resumes WHERE user_id = $1 ORDER BY analyzed_at DESC LIMIT 1",
    [userId]
  );
  let hasResume = false;
  if (resumeRes.rows.length > 0 && Array.isArray(resumeRes.rows[0].parsed_skills)) {
    hasResume = resumeRes.rows[0].parsed_skills.some(
      (s: string) => s.toLowerCase() === skillId.toLowerCase()
    );
  }

  // Check project presence for this skill
  const projRes = await query(
    "SELECT technologies FROM user_projects WHERE user_id = $1",
    [userId]
  );
  let hasProject = false;
  for (const row of projRes.rows) {
    const techs: string[] = Array.isArray(row.technologies) ? row.technologies : [];
    if (techs.some((t) => t.toLowerCase() === skillId.toLowerCase())) {
      hasProject = true;
      break;
    }
  }

  // Check latest assessment score for this skill
  const attemptRes = await query(
    `SELECT score FROM assessment_attempts 
     WHERE user_id = $1 AND skill_id = $2 AND status = 'completed' 
     ORDER BY completed_at DESC LIMIT 1`,
    [userId, skillId]
  );
  const assessmentScore = attemptRes.rows.length > 0 ? attemptRes.rows[0].score : null;

  const { confidence, verificationStatus, level } = calculateSkillConfidence({
    hasResume,
    hasProject,
    assessmentScore,
  });

  const summary = verificationStatus === "Verified"
    ? `Independently verified with strong score (${assessmentScore ?? 80}%) and practical evidence.`
    : verificationStatus === "Partially verified"
    ? "Emerging strength with project or assessment evidence; deepen deployment proof."
    : "Currently claimed from resume or profile. Take an adaptive assessment to verify.";

  const id = `se-${userId}-${skillId}`;
  await query(
    `INSERT INTO user_skill_evidence 
     (id, user_id, skill_id, level, confidence, assessment_score, evidence_resume, evidence_project, evidence_assessment, verification_status, summary, last_updated)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id, skill_id) DO UPDATE SET
       level = EXCLUDED.level,
       confidence = EXCLUDED.confidence,
       assessment_score = EXCLUDED.assessment_score,
       evidence_resume = EXCLUDED.evidence_resume,
       evidence_project = EXCLUDED.evidence_project,
       evidence_assessment = EXCLUDED.evidence_assessment,
       verification_status = EXCLUDED.verification_status,
       summary = EXCLUDED.summary,
       last_updated = CURRENT_TIMESTAMP`,
    [
      id,
      userId,
      skillId,
      level,
      confidence,
      assessmentScore ?? 0,
      hasResume,
      hasProject,
      assessmentScore != null && assessmentScore > 0,
      verificationStatus,
      summary,
    ]
  );
}
