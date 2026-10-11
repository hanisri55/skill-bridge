/** Signal Atlas assessment experience: ten fixed questions, adaptive intent, no duplicate IDs, and explainable results. */
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BarChart3, Check, ChevronRight, Clock3, RotateCcw, Sparkles, Target, Trophy, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { DemoTag, InfoCallout, PageHeader, SectionTitle, SignalBadge, SkillNetworkBackground, SkillBar } from "@/components/shared";
import { assessmentHistory, questionBank } from "@/data/mockData";
import type { AssessmentAttempt, AssessmentHistoryItem, Question } from "@/data/types";
import { abilityFromHistory, difficultySummary, QUESTIONS_PER_ATTEMPT, randomizeOptions, recordAnswer, scoreAttempt, selectQuestionSet } from "@/lib/assessmentEngine";
import { getAttempts, getHistory, saveAttempt, saveHistory } from "@/lib/storage";
import { api } from "@/lib/api";

const supportedSkills = ["Python", "SQL", "Machine Learning", "Statistics", "NLP", "Deep Learning"];
const skillNotes: Record<string, string> = {
  Python: "Applied fluency · 20 questions in bank",
  SQL: "Analytics foundation · 18 questions in bank",
  "Machine Learning": "Modeling judgment · 20 questions in bank",
  Statistics: "Decision confidence · 18 questions in bank",
  NLP: "Language systems · 18 questions in bank",
  "Deep Learning": "Neural foundations · 18 questions in bank",
};

export function Assessment() {
  const [, navigate] = useLocation();
  const [attempt, setAttempt] = useState<AssessmentAttempt | undefined>(() =>
    getAttempts().find((item) => item.status === "active")
  );
  const [skill, setSkill] = useState("Machine Learning");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    // Check server for active attempt
    api.assessments.getActive().then((active) => {
      if (active) {
        setAttempt(active);
      }
    }).catch(() => {
      // Fallback to local storage if server unreachable
    });
  }, []);

  const start = async () => {
    setStarting(true);
    try {
      const nextAttempt = await api.assessments.start(skill);
      if (nextAttempt) {
        saveAttempt(nextAttempt);
        setAttempt(nextAttempt);
        toast.success(`New ${skill} attempt created with exactly 10 questions`);
        return;
      }
    } catch {
      // Offline / client fallback
      try {
        const attempts = getAttempts();
        const questions = selectQuestionSet(skill, attempts, abilityFromHistory(skill, attempts));
        const next: AssessmentAttempt = {
          attemptId: `att-${Date.now()}`,
          userId: "demo-aarav",
          skill,
          questionIds: questions.map((question) => question.id),
          currentQuestion: 0,
          answers: [],
          startedAt: new Date().toISOString(),
          difficultyState: abilityFromHistory(skill, attempts),
          status: "active",
          questions,
        };
        saveAttempt(next);
        setAttempt(next);
        toast.success(`New ${skill} attempt created with exactly 10 questions`);
      } catch {
        toast.error("This skill needs more question coverage before it can be assessed.");
      }
    } finally {
      setStarting(false);
    }
  };

  if (!attempt) return <AssessmentStart skill={skill} setSkill={setSkill} onStart={start} starting={starting} />;
  return (
    <AssessmentRunner
      attempt={attempt}
      setAttempt={setAttempt}
      onFinish={(completed) => {
        saveAttempt(completed);
        setAttempt(undefined);
        navigate("/assessment/results");
      }}
    />
  );
}

function AssessmentStart({
  skill,
  setSkill,
  onStart,
  starting,
}: {
  skill: string;
  setSkill: (skill: string) => void;
  onStart: () => void;
  starting: boolean;
}) {
  const [historyItems, setHistoryItems] = useState<AssessmentHistoryItem[]>(() => getHistory());

  useEffect(() => {
    api.assessments.getHistory().then((data) => {
      if (data && data.length > 0) {
        setHistoryItems(data);
      }
    }).catch(() => {});
  }, []);

  const attempts = historyItems.length > 0 ? historyItems : getHistory();
  const latestScore = attempts[0]?.score ?? 74;

  return (
    <AppShell>
      <div className="assessment-shell">
        <PageHeader
          eyebrow="Intelligence layer"
          title="Adaptive assessments"
          detail="Verify what you know with a focused, ten-question assessment that responds to your performance and avoids recent repeats."
          action={<DemoTag />}
        />
        <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <div className="surface-card atlas-surface relative overflow-hidden p-6">
            <SkillNetworkBackground variant="minimal" />
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Sparkles size={20} />
              </div>
              <h2 className="mt-6 font-display text-2xl font-semibold tracking-[-.04em]">Choose a skill to verify</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Each attempt selects exactly 10 unique questions from a larger question bank across topics, difficulty, and realistic question types.
              </p>
              <div className="mt-7 grid gap-2 sm:grid-cols-2">
                {supportedSkills.map((item) => (
                  <button
                    onClick={() => setSkill(item)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                      skill === item ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-200"
                    }`}
                    key={item}
                  >
                    <span>
                      <span className="block text-xs font-extrabold text-slate-800">{item}</span>
                      <span className="mt-1 block text-[10px] text-slate-500">{skillNotes[item]}</span>
                    </span>
                    {skill === item ? (
                      <Check size={15} className="text-indigo-600" />
                    ) : (
                      <ChevronRight size={14} className="text-slate-400" />
                    )}
                  </button>
                ))}
              </div>
              <button onClick={onStart} disabled={starting} className="button-primary mt-7 w-full sm:w-auto">
                {starting ? "Preparing your set…" : "Start new assessment"} <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <div className="surface-card atlas-surface p-5">
            <SectionTitle
              eyebrow="Your history"
              title="Assessment signal"
              detail="Recent performance influences the next starting difficulty."
            />
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Latest overall</span>
                <span className="font-display text-2xl font-semibold text-slate-950">{latestScore}%</span>
              </div>
              <div className="mt-4 flex items-end gap-1.5">
                {attempts.slice(0, 6).reverse().map((item) => (
                  <div key={item.attemptId} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-md bg-indigo-500"
                      style={{ height: `${Math.max(22, item.score * 0.55)}px` }}
                    />
                    <span className="text-[9px] text-slate-400">{item.score}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {attempts.slice(0, 3).map((item) => (
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0" key={item.attemptId}>
                  <div>
                    <div className="text-xs font-extrabold text-slate-800">{item.skill}</div>
                    <div className="mt-1 text-[10px] text-slate-400">
                      {item.date} · {item.questionCount} questions
                    </div>
                  </div>
                  <div className="font-display text-lg font-semibold text-indigo-600">{item.score}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5">
          <InfoCallout tone="cyan">
            <strong>How adaptation works:</strong>&nbsp; your recent performance sets the starting curve, and every answer updates the difficulty state for the next selection cycle. The ten question IDs are saved at start so refreshes never change your attempt.
          </InfoCallout>
        </div>
      </div>
    </AppShell>
  );
}

function AssessmentRunner({
  attempt,
  setAttempt,
  onFinish,
}: {
  attempt: AssessmentAttempt;
  setAttempt: (attempt: AssessmentAttempt) => void;
  onFinish: (attempt: AssessmentAttempt) => void;
}) {
  const currentIndex = attempt.currentQuestion;
  const currentQuestionId = attempt.questionIds[currentIndex];

  const question: Question = useMemo(() => {
    if (attempt.questions && attempt.questions[currentIndex]) {
      return attempt.questions[currentIndex];
    }
    return (
      questionBank.find((item) => item.id === currentQuestionId) || {
        id: currentQuestionId,
        skill: attempt.skill,
        topic: "Core Fundamentals",
        difficulty: "Medium",
        questionType: "Application",
        question: "Select the most accurate technical approach:",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
        explanation: "Verified approach based on architecture standards.",
      }
    );
  }, [attempt.questions, currentIndex, currentQuestionId, attempt.skill]);

  const [selectedAnswer, setSelectedAnswer] = useState(
    () => attempt.answers.find((answer) => answer.questionId === currentQuestionId)?.answer ?? ""
  );

  useEffect(() => {
    const existing = attempt.answers.find((answer) => answer.questionId === currentQuestionId);
    setSelectedAnswer(existing?.answer ?? "");
  }, [currentQuestionId, attempt.answers]);

  const randomized = useMemo(() => randomizeOptions(question), [question.id]);
  const answered = attempt.answers.length;
  const isLast = currentIndex === QUESTIONS_PER_ATTEMPT - 1;

  const choose = async (answer: string) => {
    setSelectedAnswer(answer);
    // Send answer to server
    try {
      const res = await api.assessments.answer(attempt.attemptId, question.id, answer);
      if (res) {
        const nextAnswers = [
          ...attempt.answers.filter((item) => item.questionId !== question.id),
          {
            questionId: question.id,
            answer,
            isCorrect: res.isCorrect,
            difficulty: question.difficulty,
            topic: question.topic,
          },
        ];
        const updated: AssessmentAttempt = {
          ...attempt,
          answers: nextAnswers,
          difficultyState: res.difficultyState,
        };
        saveAttempt(updated);
        setAttempt(updated);
        return;
      }
    } catch {
      // Offline fallback
    }
    const updated = recordAnswer(attempt, question, answer);
    saveAttempt(updated);
    setAttempt(updated);
  };

  const next = async () => {
    if (!selectedAnswer) {
      toast.error("Choose an answer before continuing");
      return;
    }
    if (isLast) {
      try {
        const res = await api.assessments.finish(attempt.attemptId);
        if (res) {
          const completed: AssessmentAttempt = {
            ...attempt,
            score: res.score,
            completedAt: new Date().toISOString(),
            status: "completed",
            currentQuestion: QUESTIONS_PER_ATTEMPT - 1,
          };
          const history = getHistory();
          saveHistory([
            {
              attemptId: completed.attemptId,
              skill: completed.skill,
              score: res.score,
              questionCount: QUESTIONS_PER_ATTEMPT,
              difficulty: difficultySummary(completed),
              performance: res.score >= 80 ? "Strong applied signal" : res.score >= 65 ? "Improving steadily" : "Foundational",
              date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            },
            ...history,
          ]);
          onFinish(completed);
          return;
        }
      } catch {
        // Fallback
      }

      const finalScore = scoreAttempt(attempt);
      const completed: AssessmentAttempt = {
        ...attempt,
        score: finalScore,
        completedAt: new Date().toISOString(),
        status: "completed",
        currentQuestion: QUESTIONS_PER_ATTEMPT - 1,
      };
      const history = getHistory();
      saveHistory([
        {
          attemptId: completed.attemptId,
          skill: completed.skill,
          score: finalScore,
          questionCount: QUESTIONS_PER_ATTEMPT,
          difficulty: difficultySummary(completed),
          performance: finalScore >= 80 ? "Strong applied signal" : finalScore >= 65 ? "Improving steadily" : "Foundational",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        },
        ...history,
      ]);
      onFinish(completed);
      return;
    }

    const updated: AssessmentAttempt = { ...attempt, currentQuestion: currentIndex + 1 };
    saveAttempt(updated);
    setAttempt(updated);
  };

  const previous = () => {
    if (currentIndex === 0) return;
    const updated: AssessmentAttempt = { ...attempt, currentQuestion: currentIndex - 1 };
    saveAttempt(updated);
    setAttempt(updated);
  };

  return (
    <AppShell>
      <div className="assessment-shell">
        <div className="assessment-topline">
          <div>
            <Link href="/assessment" className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <ArrowLeft size={13} /> Assessments
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-lg font-semibold">{attempt.skill}</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-slate-500">Adaptive assessment</span>
              <SignalBadge tone="indigo">
                Attempt #{getAttempts().filter((item) => item.skill === attempt.skill).length || 1}
              </SignalBadge>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="adaptive-meter">
              <span className="text-[10px] font-bold text-slate-400">Difficulty</span>
              <div className="adaptive-track">
                {[1, 2, 3, 4, 5].map((item) => (
                  <i key={item} className={item <= Math.round(attempt.difficultyState * 1.65) ? "active" : ""} />
                ))}
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Clock3 size={13} /> ~8 min
            </span>
          </div>
        </div>

        <div className="mt-5 assessment-progress">
          <div style={{ width: `${((currentIndex + 1) / QUESTIONS_PER_ATTEMPT) * 100}%` }} />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="eyebrow">
            Question {currentIndex + 1} of {QUESTIONS_PER_ATTEMPT}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">
            {answered} answered · {Math.round(attempt.difficultyState * 33)}% adaptive state
          </span>
        </div>

        <div className="surface-card assessment-card mt-5">
          <div className="flex flex-wrap items-center gap-2">
            <SignalBadge tone="cyan">{question.topic}</SignalBadge>
            <SignalBadge tone={question.difficulty === "Hard" ? "rose" : question.difficulty === "Medium" ? "indigo" : "green"}>
              {question.difficulty}
            </SignalBadge>
            <span className="text-[10px] font-bold text-slate-400">{question.questionType}</span>
          </div>

          <h1 className="mt-7 max-w-3xl font-display text-2xl font-semibold leading-tight tracking-[-.045em] text-slate-950 sm:text-3xl">
            {question.question}
          </h1>

          <div className="mt-8 grid gap-3">
            {randomized.options.map((option, index) => (
              <button
                key={option}
                onClick={() => choose(option)}
                className={selectedAnswer === option ? "question-option question-option-selected" : "question-option"}
              >
                <span className="question-option-key">{String.fromCharCode(65 + index)}</span>
                <span>{option}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <button className="button-quiet" disabled={currentIndex === 0} onClick={previous}>
              <ArrowLeft size={14} /> Previous
            </button>
            <div className="flex items-center gap-2">
              <span className="hidden text-[10px] text-slate-400 sm:inline">Your answer is securely evaluated</span>
              <button className="button-primary" onClick={next}>
                {isLast ? "Finish assessment" : "Next question"} {isLast ? <Trophy size={14} /> : <ArrowRight size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">Question set locked at start · no duplicate IDs</span>
          <button
            className="text-[10px] font-bold text-slate-400 hover:text-rose-500"
            onClick={() => {
              localStorage.removeItem("skillbridge.attempts");
              window.location.reload();
            }}
          >
            Exit attempt
          </button>
        </div>
      </div>
    </AppShell>
  );
}

export function AssessmentResults() {
  const [history, setHistory] = useState<AssessmentHistoryItem[]>(() => getHistory());
  const [latestAttempt, setLatestAttempt] = useState<AssessmentAttempt | undefined>(() =>
    getAttempts().find((item) => item.status === "completed")
  );

  useEffect(() => {
    api.assessments.getHistory().then((data) => {
      if (data && data.length > 0) {
        setHistory(data);
      }
    }).catch(() => {});
  }, []);

  const score = latestAttempt?.score ?? history[0]?.score ?? 79;
  const correct = Math.round((score / 100) * 10);
  const topicData = [
    { label: "Conceptual", value: Math.min(96, score + 9) },
    { label: "Application", value: Math.max(52, score - 3) },
    { label: "Practical", value: Math.max(48, score - 8) },
  ];

  return (
    <AppShell>
      <div className="assessment-shell">
        <PageHeader
          eyebrow="Assessment result"
          title="Your signal is getting stronger."
          detail={`You scored ${correct} out of ${QUESTIONS_PER_ATTEMPT} on the ${latestAttempt?.skill ?? history[0]?.skill ?? "Machine Learning"} adaptive assessment.`}
          action={<SignalBadge tone="cyan">Completed</SignalBadge>}
        />
        <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
          <div className="surface-card flex flex-col items-center justify-center p-6">
            <div className="eyebrow">Overall score</div>
            <div className="mt-5 font-display text-7xl font-semibold tracking-[-.1em] text-indigo-600">
              {correct}
              <span className="text-3xl text-slate-300"> / 10</span>
            </div>
            <div className="mt-4">
              <SignalBadge tone={score >= 80 ? "cyan" : "indigo"}>
                {score >= 80 ? "Advanced signal" : "Intermediate signal"}
              </SignalBadge>
            </div>
            <p className="mt-5 max-w-xs text-center text-xs leading-6 text-slate-500">
              A strong result across an adaptive path. Your next edge is turning knowledge into production evidence.
            </p>
            <Link href="/assessment" className="button-primary mt-6 w-full">
              <RotateCcw size={15} /> Take another assessment
            </Link>
          </div>

          <div className="surface-card p-5">
            <SectionTitle
              eyebrow="Performance breakdown"
              title="Where the signal landed"
              detail="Topic and difficulty performance from this attempt."
            />
            <div className="grid gap-4">
              {topicData.map((item) => (
                <SkillBar key={item.label} label={item.label} value={item.value} color={item.label === "Conceptual" ? "cyan" : "indigo"} />
              ))}
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-cyan-50 p-4">
                <div className="eyebrow text-cyan-700">Strength</div>
                <div className="mt-2 text-sm font-extrabold text-cyan-950">Model evaluation instincts</div>
                <p className="mt-2 text-xs leading-5 text-cyan-800">You handled trade-offs and generalization scenarios well.</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-4">
                <div className="eyebrow text-amber-700">Work next</div>
                <div className="mt-2 text-sm font-extrabold text-amber-950">Production problem solving</div>
                <p className="mt-2 text-xs leading-5 text-amber-800">Practice choosing safe, reproducible deployment patterns.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card mt-5 p-5">
          <SectionTitle
            eyebrow="Assessment history"
            title="Improvement trend"
            detail="Every new attempt selects a new question set when the bank allows, prioritizing questions you have not seen recently."
            action={<DemoTag />}
          />
          <div className="overflow-x-auto">
            <table className="assessment-table">
              <thead>
                <tr>
                  <th>Attempt</th>
                  <th>Date</th>
                  <th>Skill</th>
                  <th>Score</th>
                  <th>Questions</th>
                  <th>Difficulty</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={item.attemptId}>
                    <td>
                      <strong>Attempt #{history.length - index}</strong>
                    </td>
                    <td>{item.date}</td>
                    <td>{item.skill}</td>
                    <td>
                      <strong className="text-indigo-600">{item.score}%</strong>
                    </td>
                    <td>{item.questionCount}</td>
                    <td>{item.difficulty}</td>
                    <td>{item.performance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
              <BarChart3 size={15} className="text-indigo-500" /> Improvement signal
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-display text-2xl font-semibold text-slate-900">62%</span>
              <ArrowRight size={15} className="text-slate-400" />
              <span className="font-display text-2xl font-semibold text-cyan-600">{score}%</span>
              <span className="text-xs font-bold text-green-600">+{Math.max(0, score - 62)} points</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
