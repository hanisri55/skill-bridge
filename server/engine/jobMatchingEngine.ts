import { query } from "../db";
import type { JobMatch } from "../../shared/types";

export async function matchJobsForUser(userId: string): Promise<JobMatch[]> {
  const jobsRes = await query("SELECT * FROM jobs ORDER BY id ASC");
  const userEvidenceRes = await query(
    `SELECT se.*, s.name as skill_name 
     FROM user_skill_evidence se 
     JOIN skills s ON se.skill_id = s.id 
     WHERE se.user_id = $1`,
    [userId]
  );
  const evidenceList = userEvidenceRes.rows;

  const userSkillsMap = new Map<string, { confidence: number; verified: boolean; assessmentScore: number; hasProject: boolean }>();
  for (const e of evidenceList) {
    userSkillsMap.set((e.skill_name || "").toLowerCase(), {
      confidence: e.confidence || 0,
      verified: e.verification_status === "Verified",
      assessmentScore: e.assessment_score || 0,
      hasProject: !!e.evidence_project,
    });
  }

  const matches: JobMatch[] = [];

  for (const job of jobsRes.rows) {
    const requiredSkills: string[] = Array.isArray(job.required_skills)
      ? job.required_skills
      : JSON.parse(job.required_skills || "[]");

    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    let totalSkillScore = 0;
    let projectMatchCount = 0;
    let assessmentScoreSum = 0;
    let assessmentCount = 0;

    for (const req of requiredSkills) {
      const lower = req.toLowerCase();
      const userSkill = userSkillsMap.get(lower);
      if (userSkill && (userSkill.confidence >= 40 || userSkill.verified)) {
        matchingSkills.push(req);
        totalSkillScore += userSkill.confidence;
        if (userSkill.hasProject) projectMatchCount++;
        if (userSkill.assessmentScore > 0) {
          assessmentScoreSum += userSkill.assessmentScore;
          assessmentCount++;
        }
      } else {
        missingSkills.push(req);
      }
    }

    const skillMatchScore = requiredSkills.length > 0
      ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
      : 0;

    const experienceScore = 78;
    const projectAlignment = matchingSkills.length > 0
      ? Math.min(95, Math.round((projectMatchCount / matchingSkills.length) * 100) || 75)
      : 50;

    const assessmentAlignment = assessmentCount > 0
      ? Math.round(assessmentScoreSum / assessmentCount)
      : 70;

    // Overall match percentage
    const match = Math.min(98, Math.max(25, Math.round(
      skillMatchScore * 0.45 +
      experienceScore * 0.2 +
      projectAlignment * 0.2 +
      assessmentAlignment * 0.15
    )));

    matches.push({
      id: job.id,
      role: job.role,
      company: job.company,
      location: job.location,
      workMode: job.work_mode,
      match,
      requiredSkills,
      matchingSkills,
      missingSkills,
      salary: job.salary,
      description: job.description,
      breakdown: [
        { label: "Skill match", value: skillMatchScore },
        { label: "Experience", value: experienceScore },
        { label: "Project alignment", value: projectAlignment },
        { label: "Assessment alignment", value: assessmentAlignment },
      ],
    });
  }

  return matches.sort((a, b) => b.match - a.match);
}
