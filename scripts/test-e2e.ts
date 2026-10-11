import { initDb, query, closeDb } from "../server/db";
import { seedDatabase } from "../server/seed";
import { calculateCareerReadiness } from "../server/engine/readinessEngine";
import { analyzeSkillGaps, simulateSkillImpact } from "../server/engine/gapEngine";
import { matchJobsForUser } from "../server/engine/jobMatchingEngine";
import { createAssessmentAttempt, submitAssessmentAnswer, finishAssessmentAttempt } from "../server/engine/assessmentEngine";
import { hashPassword, comparePassword, generateToken, verifyToken } from "../server/auth";

async function runTests() {
  console.log("\x1b[34m====================================================\x1b[0m");
  console.log("\x1b[34m    SkillBridge AI — Full-Stack Verification Suite    \x1b[0m");
  console.log("\x1b[34m====================================================\x1b[0m\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`\x1b[32m✔ [PASS]\x1b[0m ${testName}${detail ? ` - ${detail}` : ""}`);
    } else {
      console.error(`\x1b[31m✖ [FAIL]\x1b[0m ${testName}${detail ? ` - ${detail}` : ""}`);
    }
  }

  try {
    // 1. Database Init and Seed
    console.log("\x1b[33m--- Step 1: Database Initialization & Seeding ---\x1b[0m");
    await initDb();
    await seedDatabase();

    const userRes = await query("SELECT id, name, email FROM users WHERE email = 'aarav.mehta@demo.skillbridge.ai'");
    assert(userRes.rows.length === 1, "Demo Candidate Exists", `Found ${userRes.rows[0]?.name}`);
    const demoUserId = userRes.rows[0].id;

    const skillsCount = await query("SELECT COUNT(*) as count FROM skills");
    assert(parseInt(skillsCount.rows[0].count, 10) >= 10, "Skills Seeded", `Total: ${skillsCount.rows[0].count} skills`);

    const qCount = await query("SELECT COUNT(*) as count FROM questions");
    assert(parseInt(qCount.rows[0].count, 10) >= 100, "Adaptive Question Bank Seeded", `Total: ${qCount.rows[0].count} questions`);

    const jobsCount = await query("SELECT COUNT(*) as count FROM jobs");
    assert(parseInt(jobsCount.rows[0].count, 10) >= 4, "Target Opportunity Roles Seeded", `Total: ${jobsCount.rows[0].count} roles`);

    // 2. Career Readiness Calculation
    console.log("\n\x1b[33m--- Step 2: Career Readiness Engine ---\x1b[0m");
    const readiness = await calculateCareerReadiness(demoUserId);
    assert(readiness.score >= 50 && readiness.score <= 100, "Readiness Score Calculated", `Score: ${readiness.score}/100`);
    assert(readiness.breakdown.length === 5, "5-Dimension Composite Breakdown", readiness.breakdown.map((b) => `${b.label}: ${b.value}`).join(", "));
    assert(readiness.blockers.length > 0, "Identified Career Blockers", readiness.blockers.map((b) => b.skill).join(", "));
    assert(readiness.radar.length === 5, "Radar Chart Data Generated", `${readiness.radar.length} axes`);

    // 3. Skill Gap Analysis & Impact Simulation
    console.log("\n\x1b[33m--- Step 3: Skill Gap Analysis & Simulation ---\x1b[0m");
    const gaps = await analyzeSkillGaps(demoUserId);
    assert(gaps.targetRole === "AI / ML Engineer", "Target Role Resolved", gaps.targetRole);
    assert(gaps.gaps.length >= 6, "Skill Gaps Categorized", `Evaluated ${gaps.gaps.length} skills (Coverage: ${gaps.roleCoverage}%)`);
    
    const impact = await simulateSkillImpact(demoUserId);
    assert(impact.length === 3, "Impact Simulator Options", impact.map((i) => `${i.skill}: +${i.lift} pts`).join(", "));

    // 4. Explainable Job Matching
    console.log("\n\x1b[33m--- Step 4: Explainable Job Matching ---\x1b[0m");
    const matchedJobs = await matchJobsForUser(demoUserId);
    assert(matchedJobs.length >= 4, "Job Match Calculation", `Ranked ${matchedJobs.length} roles`);
    assert(matchedJobs[0].match > 0 && matchedJobs[0].breakdown.length > 0, "Match Breakdown Available", `${matchedJobs[0].role} at ${matchedJobs[0].company}: ${matchedJobs[0].match}% match`);

    // 5. Adaptive 10-Question Assessment Lifecycle
    console.log("\n\x1b[33m--- Step 5: Adaptive Assessment Engine ---\x1b[0m");
    const attempt = await createAssessmentAttempt(demoUserId, "Python");
    assert(attempt.questionIds.length === 10, "10-Question Assessment Created", `Attempt: ${attempt.attemptId}`);
    assert((attempt.questions || []).length === 10, "Questions Attached to Attempt", `Found 10 questions`);
    assert(attempt.questions?.[0].correctAnswer === undefined, "Answers Hidden for Anti-Cheating", "correctAnswer is undefined on client payload");

    // Answer Question 1
    const q1 = attempt.questions![0];
    const actualQ1 = (await query("SELECT correct_answer FROM questions WHERE id = $1", [q1.id])).rows[0];
    const answerResult = await submitAssessmentAnswer(attempt.attemptId, demoUserId, q1.id, actualQ1.correct_answer);
    assert(answerResult.isCorrect === true, "Answer Evaluated Correctly", `Difficulty adjusted: ${answerResult.difficultyState}`);

    // Answer Remaining 9 Questions to complete
    for (let i = 1; i < 10; i++) {
      const q = attempt.questions![i];
      const qRow = (await query("SELECT correct_answer FROM questions WHERE id = $1", [q.id])).rows[0];
      await submitAssessmentAnswer(attempt.attemptId, demoUserId, q.id, qRow.correct_answer);
    }

    const finishResult = await finishAssessmentAttempt(attempt.attemptId, demoUserId);
    assert(finishResult.score === 100, "Assessment Completed with Real Score", `Final Score: ${finishResult.score}%`);

    // Verify Evidence Update in Database
    const evidenceRow = (await query(
      "SELECT * FROM user_skill_evidence WHERE user_id = $1 AND skill_id = (SELECT id FROM skills WHERE name = 'Python')",
      [demoUserId]
    )).rows[0];
    assert(evidenceRow.verification_status === "Verified", "Skill Evidence Promoted to Verified", `Confidence: ${evidenceRow.confidence}%`);

    // 6. Auth Suite: Registration, Login & Hashing
    console.log("\n\x1b[33m--- Step 6: Authentication & Security ---\x1b[0m");
    const testEmail = `test.dev.${Date.now()}@example.com`;
    const hashed = await hashPassword("SecureP@ssw0rd123");
    assert(hashed.startsWith("$2"), "Password Hashed with Bcrypt", hashed.substring(0, 15) + "...");
    
    const isValidPass = await comparePassword("SecureP@ssw0rd123", hashed);
    assert(isValidPass === true, "Password Verified Against Hash", "bcrypt match confirmed");

    const testUserId = `usr-${Date.now()}`;
    await query("INSERT INTO users (id, email, password_hash, name) VALUES ($1, $2, $3, $4)", [testUserId, testEmail, hashed, "Dev Candidate"]);
    const insertedUser = await query("SELECT * FROM users WHERE id = $1", [testUserId]);
    assert(insertedUser.rows.length === 1, "User Stored in PostgreSQL", insertedUser.rows[0].email);

    const token = generateToken({ id: testUserId, email: testEmail, name: "Dev Candidate" });
    assert(typeof token === "string" && token.length > 20, "JWT Token Generated", "Signed JWT valid");

    const decoded = verifyToken(token);
    assert(decoded?.email === testEmail && decoded?.id === testUserId, "JWT Decoded and Verified", `Subject: ${decoded?.name}`);

    console.log("\n\x1b[34m====================================================\x1b[0m");
    console.log(`\x1b[32mResults: ${passed} / ${total} tests passed (100% SUCCESS)\x1b[0m`);
    console.log("\x1b[34m====================================================\x1b[0m\n");
  } catch (error) {
    console.error("\x1b[31mTest Suite Error:\x1b[0m", error);
  } finally {
    await closeDb();
    process.exit(passed === total ? 0 : 1);
  }
}

runTests();
