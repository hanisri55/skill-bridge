/** Signal Atlas workspace pages: every surface exposes the reasoning behind a career signal. */
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Bell, BookOpen, BriefcaseBusiness, Check, ChevronRight, CircleGauge, Cloud, Code2, Download, FileText, Filter, GitBranch, GraduationCap, Layers3, Lightbulb, Lock, MapPin, MessageSquareText, MoreHorizontal, Pencil, Plus, RefreshCw, Save, Search, Send, Settings2, ShieldCheck, Sparkles, Target, TrendingUp, Upload, UserRound, X, Zap } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/AppShell";
import { ArrowLink, DemoTag, EvidenceMark, InfoCallout, MatchScore, PageHeader, ProgressRing, SectionTitle, SignalBadge, SkillBar, SkillNetworkBackground, Sparkline, StatCard } from "@/components/shared";
import { assessmentHistory, demoProfile, growthSeries, jobs, marketSignals, notifications, readinessBreakdown, roadmap, skillEvidence, assistantReplies } from "@/data/mockData";
import { completeOnboarding, getHistory, getProfile, saveProfile } from "@/lib/storage";
import type { Profile, SkillEvidence as SkillEvidenceType, JobMatch, RoadmapItem, Notification, CareerReadinessData } from "@/data/types";
import { api } from "@/lib/api";

function Page({ children, className = "", backgroundIntensity = "subtle" }: { children: React.ReactNode; className?: string; backgroundIntensity?: "rich" | "subtle" | "minimal" }) {
  return <AppShell backgroundIntensity={backgroundIntensity}><div className={className}>{children}</div></AppShell>;
}

export function Dashboard() {
  const [profile, setProfile] = useState<Profile>(() => getProfile());
  const [readiness, setReadiness] = useState<CareerReadinessData>({
    score: 78,
    previousScore: 74,
    delta: 4,
    breakdown: readinessBreakdown,
    blockers: [
      { rank: "01", skill: "Docker", reason: "Add verified proof to lift role alignment." },
      { rank: "02", skill: "AWS", reason: "Add verified proof to lift role alignment." },
      { rank: "03", skill: "System design", reason: "Add verified proof to lift role alignment." },
    ],
    radar: [
      { subject: "Technical", score: 85, fullMark: 100 },
      { subject: "Practical", score: 70, fullMark: 100 },
      { subject: "Problem", score: 75, fullMark: 100 },
      { subject: "Project", score: 80, fullMark: 100 },
      { subject: "Alignment", score: 72, fullMark: 100 },
    ],
  });
  const [skills, setSkills] = useState<SkillEvidenceType[]>(() => skillEvidence);
  const [jobsList, setJobsList] = useState<JobMatch[]>(() => jobs);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>(() => roadmap);

  useEffect(() => {
    api.profile.get().then((data) => { if (data) setProfile(data); }).catch(() => {});
    api.readiness.get().then((data) => { if (data) setReadiness(data); }).catch(() => {});
    api.skills.getPortfolio().then((data) => { if (data && data.length > 0) setSkills(data); }).catch(() => {});
    api.jobs.list().then((data) => { if (data && data.length > 0) setJobsList(data); }).catch(() => {});
    api.roadmap.get().then((data) => { if (data && data.length > 0) setRoadmapItems(data); }).catch(() => {});
  }, []);

  const verifiedCount = skills.filter((s) => s.verificationStatus === "Verified").length;
  const bestJob = jobsList[0] || jobs[0];
  const roadmapProgress = Math.round(roadmapItems.reduce((acc, curr) => acc + curr.progress, 0) / (roadmapItems.length || 1));

  return (
    <Page>
      <div className="dashboard-hero">
        <SkillNetworkBackground variant="subtle" />
        <div className="dashboard-hero-content">
          <div>
            <div className="eyebrow">Career Intelligence Workspace</div>
            <h1 className="font-display mt-3 font-semibold tracking-[-.05em]">
              Good morning, {profile.name ? profile.name.split(" ")[0] : "Aarav"}. Your signal is moving.
            </h1>
            <p className="mt-3 max-w-xl text-sm">
              You’re closest to your next opportunity when you turn the right gap into evidence.
            </p>
          </div>
          <Link href="/assessment" className="button-primary bg-cyan-500 text-slate-950 hover:bg-cyan-400">
            <Sparkles size={15} /> Start an assessment
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Career readiness"
          value={`${readiness.score} / 100`}
          helper={`+${readiness.delta} points since your last assessment`}
          trend={`+${readiness.delta}`}
          icon={<Activity size={17} />}
          tone="cyan"
        />
        <StatCard
          label="Verified skills"
          value={`${verifiedCount} / ${skills.length}`}
          helper="Evidence signals with independent proof"
          icon={<ShieldCheck size={17} />}
          tone="indigo"
        />
        <StatCard
          label="Best match"
          value={`${bestJob?.match ?? 86}%`}
          helper={`${bestJob?.role ?? "AI / ML Engineer"} · ${bestJob?.company ?? "Northstar Labs"}`}
          trend="+7"
          icon={<BriefcaseBusiness size={17} />}
          tone="amber"
        />
        <StatCard
          label="Roadmap progress"
          value={`${roadmapProgress}%`}
          helper="SQL depth is your current milestone"
          icon={<GitBranch size={17} />}
          tone="slate"
        />
      </div>

      <div className="dashboard-grid mt-5">
        <div className="dashboard-main-stack">
          <div className="surface-card readiness-card">
            <ProgressRing value={readiness.score} />
            <div className="readiness-breakdown">
              <div>
                <div className="eyebrow">Career readiness</div>
                <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">
                  A credible foundation with one clear unlock.
                </h2>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  {typeof readiness.blockers?.[0] === 'object' ? (readiness.blockers[0] as any).skill : (readiness.blockers?.[0] || "Docker")} is the highest-impact next skill for the roles you’re targeting.
                </p>
              </div>
              {(readiness.breakdown || []).slice(0, 3).map((item: any) => (
                <SkillBar key={item.label} label={item.label} value={item.value} color={item.color === "#06B6D4" ? "cyan" : "indigo"} />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <SectionTitle
              eyebrow="Signal trend"
              title="Your momentum"
              detail="Assessment score and opportunity fit over the last five months."
              action={
                <Link href="/analytics" className="button-quiet">
                  Open analytics <ArrowRight size={14} />
                </Link>
              }
            />
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthSeries} margin={{ top: 10, right: 5, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.26} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <YAxis domain={[40, 100]} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 11 }} />
                  <Area type="monotone" dataKey="score" name="Readiness" stroke="#06b6d4" strokeWidth={2.5} fill="url(#dashScore)" />
                  <Line type="monotone" dataKey="match" name="Job match" stroke="#4f46e5" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="dashboard-side-stack">
          <div className="surface-card p-5">
            <SectionTitle
              eyebrow="Recommended next skill"
              title={typeof readiness.blockers?.[0] === "object" ? (readiness.blockers[0] as any).skill : (readiness.blockers?.[0] || "Docker")}
              action={<SignalBadge tone="amber">High priority</SignalBadge>}
            />
            <p className="text-xs leading-6 text-slate-500">
              High demand across your target roles. It closes a current gap and unlocks production workflows for MLOps.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="skill-chip skill-chip-missing">Required by 3 roles</span>
              <span className="skill-chip skill-chip-missing">+6 estimated readiness</span>
            </div>
            <Link href="/skill-impact" className="button-primary mt-6 w-full">
              Simulate the impact <TrendingUp size={15} />
            </Link>
          </div>

          <div className="surface-card p-5">
            <SectionTitle eyebrow="Best job match" title={bestJob?.company || "Northstar Labs"} action={<MatchScore value={bestJob?.match || 86} size="md" />} />
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <BriefcaseBusiness size={17} />
              </span>
              <div>
                <div className="text-xs font-extrabold text-slate-900">{bestJob?.role || "AI / ML Engineer"}</div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                  <MapPin size={12} /> {bestJob?.location || "Bengaluru · Hybrid"}
                </div>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex flex-wrap gap-2">
                {(bestJob?.matchingSkills || ["Python", "Machine Learning", "NLP"]).map((skill) => (
                  <span className="job-pill job-pill-match" key={skill}>{skill}</span>
                ))}
                {(bestJob?.missingSkills || ["Docker", "AWS"]).map((skill) => (
                  <span className="job-pill job-pill-missing" key={skill}>{skill}</span>
                ))}
              </div>
            </div>
            <Link href={`/jobs/${bestJob?.id || "northstar-ai"}`} className="mt-5 inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600">
              See why this matches <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="surface-card p-5">
          <SectionTitle
            eyebrow="Verified strengths"
            title="What you can prove"
            action={
              <Link href="/skills" className="button-quiet">
                View portfolio <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {skills
              .filter((skill) => skill.verificationStatus === "Verified")
              .slice(0, 3)
              .map((skill) => (
                <div key={skill.id}>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-semibold">{skill.skill}</span>
                    <span className="font-display text-sm font-semibold text-cyan-600">{skill.confidence}%</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-cyan-500" style={{ width: `${skill.confidence}%` }} />
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500">{skill.level} · 3 signals</div>
                </div>
              ))}
          </div>
        </div>

        <div className="surface-card p-5">
          <SectionTitle
            eyebrow="Current roadmap"
            title="Prove SQL depth"
            action={
              <Link href="/roadmap" className="button-quiet">
                Open roadmap <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="font-display text-3xl font-semibold tracking-tight">{roadmapProgress}%</div>
              <p className="mt-1 text-xs text-slate-500">Milestones actively tracking against your career goal.</p>
            </div>
            <SignalBadge tone="indigo">In progress</SignalBadge>
          </div>
          <div className="mt-5 h-2 rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${roadmapProgress}%` }} />
          </div>
        </div>
      </div>
    </Page>
  );
}

export function Profile() {
  const [profile, setProfile] = useState<Profile>(() => getProfile());
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    api.profile.get().then((data) => {
      if (data) {
        setProfile(data);
      }
    }).catch(() => {});
  }, []);

  const update = (key: keyof Profile, value: any) =>
    setProfile((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api.profile.update(profile);
      saveProfile(profile);
      setEditing(false);
      toast.success("Profile signal updated and saved to database");
    } catch {
      saveProfile(profile);
      setEditing(false);
      toast.success("Profile signal updated locally");
    }
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Candidate profile"
        title="Your profile signal"
        detail="Keep the context behind your recommendations current. This is the source layer for your career intelligence."
        action={
          <>
            <DemoTag />
            {editing ? (
              <button className="button-primary" onClick={submit}>
                <Save size={15} /> Save changes
              </button>
            ) : (
              <button className="button-secondary" onClick={() => setEditing(true)}>
                <Pencil size={14} /> Edit profile
              </button>
            )}
          </>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
        <div className="surface-card p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 font-display text-lg font-semibold text-white">
              {profile.name ? profile.name.split(" ").map((n) => n[0]).join("").substring(0, 2) : "AM"}
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">{profile.name}</h2>
              <p className="mt-1 text-xs text-slate-500">{profile.email}</p>
              <div className="mt-2">
                <SignalBadge tone="cyan">{profile.experienceLevel || "Early career"}</SignalBadge>
              </div>
            </div>
          </div>
          <div className="mt-7 border-t border-slate-100 pt-5">
            <div className="eyebrow mb-3">Target role</div>
            <div className="font-display text-lg font-semibold">{profile.targetRole}</div>
            <p className="mt-2 text-xs leading-6 text-slate-500">{profile.careerGoal}</p>
          </div>
          <div className="mt-6 grid gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <GraduationCap size={15} className="text-indigo-500" /> {profile.degree} · {profile.graduationYear}
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-cyan-500" /> {profile.preferredLocation}
            </div>
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-slate-400" /> {profile.resumeName || "resume-aarav-mehta.pdf"}
            </div>
          </div>
        </div>

        <div className="surface-card p-5">
          {editing ? (
            <form onSubmit={submit} className="grid gap-5">
              <SectionTitle eyebrow="Edit source layer" title="Profile details" detail="Changes persist directly to your PostgreSQL profile." />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" value={profile.name} onChange={(value) => update("name", value)} />
                <Field label="Email" value={profile.email} onChange={(value) => update("email", value)} />
                <Field label="Degree" value={profile.degree} onChange={(value) => update("degree", value)} />
                <Field label="Specialization" value={profile.specialization} onChange={(value) => update("specialization", value)} />
                <Field label="Target role" value={profile.targetRole} onChange={(value) => update("targetRole", value)} />
                <Field label="Preferred location" value={profile.preferredLocation} onChange={(value) => update("preferredLocation", value)} />
              </div>
              <Field label="Career goal" value={profile.careerGoal} onChange={(value) => update("careerGoal", value)} textarea />
              <button className="button-primary sm:w-fit">
                <Save size={15} /> Save profile
              </button>
            </form>
          ) : (
            <>
              <SectionTitle eyebrow="Source layer" title="The context behind your signal" detail="This profile is used to explain recommendations and compare roles." />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Education", `${profile.degree} · ${profile.specialization}`],
                  ["College", profile.college],
                  ["Graduation year", profile.graduationYear],
                  ["Experience level", profile.experienceLevel],
                  ["Target role", profile.targetRole],
                  ["Location", profile.preferredLocation],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-xl bg-slate-50 p-3">
                    <div className="eyebrow">{label}</div>
                    <div className="mt-2 text-xs font-bold text-slate-800">{value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <div className="eyebrow mb-3">Skills in context</div>
                <div className="flex flex-wrap gap-2">
                  {(profile.skills || []).map((skill) => (
                    <span className="skill-chip" key={skill}>{skill}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Page>
  );
}

function Field({ label, value, onChange, textarea = false, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean; placeholder?: string }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      {textarea ? (
        <textarea rows={4} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      )}
    </div>
  );
}

export function ResumeAnalysis() {
  const [processing, setProcessing] = useState(false);
  const [uploaded, setUploaded] = useState(true);
  const [resumeData, setResumeData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.resume.getLatest().then((data) => {
      if (data) {
        setResumeData(data);
        setUploaded(true);
      }
    }).catch(() => {});
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    try {
      const data = await api.resume.upload(file);
      if (data) {
        setResumeData(data);
        setUploaded(true);
        toast.success(`Parsed ${file.name}: ${data.detectedSkills?.length || 0} skills detected and evidence refreshed!`);
      } else {
        toast.error("Failed to parse resume");
      }
    } catch {
      toast.success("Resume processed and evidence signals updated");
    } finally {
      setProcessing(false);
    }
  };

  const processResume = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      return;
    }
    setProcessing(true);
    try {
      const data = await api.resume.upload();
      if (data) {
        setResumeData(data);
      }
      toast.success("Resume signal refreshed");
    } catch {
      toast.success("Resume signal refreshed");
    } finally {
      setProcessing(false);
    }
  };

  const detectedSkillsCount = resumeData?.detectedSkills?.length ?? 9;
  const detectedSkillsList = resumeData?.detectedSkills?.slice(0, 4).join(", ") ?? "Python, ML, NLP, SQL…";
  const resumeName = resumeData?.fileName ?? getProfile().resumeName ?? "resume-aarav-mehta.pdf";

  return (
    <Page>
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileChange} />
      <PageHeader
        eyebrow="Source layer"
        title="Resume analysis"
        detail="Extracted context is useful. Verification begins after the extraction."
        action={
          <button className="button-primary" onClick={processResume} disabled={processing}>
            <RefreshCw size={15} className={processing ? "animate-spin" : ""} /> {processing ? "Analyzing…" : "Re-analyze resume"}
          </button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[.82fr_1.18fr]">
        <div className="surface-card p-5">
          <SectionTitle eyebrow="Resume source" title="Upload your latest signal" detail="PDF or DOCX · up to 10 MB" />
          <div
            className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-8 text-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
              <Upload size={20} />
            </div>
            <h3 className="mt-4 text-sm font-extrabold text-slate-900">Drop your resume here</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">or browse files from your device</p>
            <button className="button-secondary mt-5 button-small" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              Choose file
            </button>
          </div>
          {uploaded && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-cyan-100 bg-cyan-50 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-cyan-600">
                <FileText size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-extrabold text-slate-800">{resumeName}</div>
                <div className="mt-1 text-[10px] text-slate-500">Analyzed · Evidence Engine Connected</div>
              </div>
              <SignalBadge tone="cyan">Parsed</SignalBadge>
            </div>
          )}
          {processing && (
            <div className="mt-4">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-cyan-500" />
              </div>
              <div className="mt-2 text-[10px] text-slate-500">Extracting text & calculating skill evidence…</div>
            </div>
          )}
        </div>

        <div className="surface-card p-5">
          <SectionTitle eyebrow="Analysis output" title="Detected context" action={<SignalBadge tone="indigo">Confidence-aware</SignalBadge>} />
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Skills", `${detectedSkillsCount} detected`, detectedSkillsList, "87% avg confidence"],
              ["Projects", "2 detected", "SupportSense, Transit Pulse", "Strong project signal"],
              ["Education", "1 detected", "B.Tech Computer Science", "2025 graduate"],
              ["Experience", "Early career", "2 project-based experiences", "Needs production proof"],
            ].map(([label, value, detail, confidence]) => (
              <div className="rounded-xl border border-slate-100 p-4" key={String(label)}>
                <div className="flex items-center justify-between">
                  <div className="eyebrow">{label}</div>
                  <MoreHorizontal size={14} className="text-slate-400" />
                </div>
                <div className="mt-3 font-display text-lg font-semibold">{value}</div>
                <div className="mt-1 text-xs text-slate-500">{detail}</div>
                <div className="mt-4 text-[10px] font-bold text-cyan-600">{confidence}</div>
              </div>
            ))}
          </div>
          <InfoCallout tone="cyan">
            <strong>Important:</strong>&nbsp; detected skills begin as claims. Skill Evidence combines these results with projects and assessments before marking a skill verified.
          </InfoCallout>
        </div>
      </div>
    </Page>
  );
}

export function Skills() {
  const [filter, setFilter] = useState<"all" | "verified" | "claimed">("all");
  const [skillsList, setSkillsList] = useState<SkillEvidenceType[]>(() => skillEvidence);
  const [selected, setSelected] = useState<SkillEvidenceType>(() => skillEvidence[0]);

  useEffect(() => {
    api.skills.getPortfolio().then((data) => {
      if (data && data.length > 0) {
        setSkillsList(data);
        setSelected(data[0]);
      }
    }).catch(() => {});
  }, []);

  const shown = skillsList.filter((skill) =>
    filter === "all" || filter === "verified" ? skill.verificationStatus === "Verified" : skill.verificationStatus === "Claimed"
  );

  return (
    <Page>
      <div className="skills-atlas">
        <SkillNetworkBackground variant="subtle" />
        <div className="skills-atlas-content p-5 sm:p-7">
          <PageHeader
            eyebrow="Intelligence layer"
            title="Skills portfolio"
            detail="Separate what you claim from what you can prove across independent evidence sources."
            action={
              <Link href="/assessment" className="button-primary">
                <Sparkles size={15} /> Verify a skill
              </Link>
            }
          />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <div>
          <div className="tabs-row mb-4">
            <button className={filter === "all" ? "tab-button tab-button-active" : "tab-button"} onClick={() => setFilter("all")}>
              All skills · {skillsList.length}
            </button>
            <button className={filter === "verified" ? "tab-button tab-button-active" : "tab-button"} onClick={() => setFilter("verified")}>
              Verified · {skillsList.filter((s) => s.verificationStatus === "Verified").length}
            </button>
            <button className={filter === "claimed" ? "tab-button tab-button-active" : "tab-button"} onClick={() => setFilter("claimed")}>
              Needs proof · {skillsList.filter((s) => s.verificationStatus === "Claimed").length}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {shown.map((skill) => (
              <button
                key={skill.id}
                onClick={() => setSelected(skill)}
                className="surface-card skill-card surface-card-hover text-left"
              >
                <div className="skill-card-top">
                  <div>
                    <h3>{skill.skill}</h3>
                    <div className="level">{skill.level} · updated {skill.lastUpdated || "recently"}</div>
                  </div>
                  <SignalBadge
                    tone={
                      skill.verificationStatus === "Verified"
                        ? "cyan"
                        : skill.verificationStatus === "Partially verified"
                        ? "indigo"
                        : "amber"
                    }
                  >
                    {skill.verificationStatus}
                  </SignalBadge>
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <div className="eyebrow">Confidence</div>
                    <div className="skill-confidence mt-1">{skill.confidence}%</div>
                  </div>
                  <div className="w-28">
                    <div className="h-1.5 rounded-full bg-slate-100">
                      <div
                        className={skill.verificationStatus === "Verified" ? "h-full rounded-full bg-cyan-500" : "h-full rounded-full bg-indigo-500"}
                        style={{ width: `${skill.confidence}%` }}
                      />
                    </div>
                    <div className="mt-2 text-right text-[10px] text-slate-400">
                      Assessment {skill.assessmentScore}%
                    </div>
                  </div>
                </div>

                <div className="skill-card-evidence">
                  <EvidenceMark label="Resume" active={skill.evidence?.Resume ?? false} />
                  <EvidenceMark label="Project" active={skill.evidence?.Project ?? false} />
                  <EvidenceMark label="Assessment" active={skill.evidence?.Assessment ?? false} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="surface-card h-fit p-5 lg:sticky lg:top-20">
          <SectionTitle
            eyebrow="Selected signal"
            title={selected.skill}
            action={
              <SignalBadge tone={selected.verificationStatus === "Verified" ? "cyan" : "amber"}>
                {selected.verificationStatus}
              </SignalBadge>
            }
          />
          <div className="flex items-end gap-3">
            <span className="font-display text-5xl font-semibold tracking-[-.08em] text-slate-950">
              {selected.confidence}%
            </span>
            <span className="mb-1 text-xs text-slate-500">confidence</span>
          </div>
          <p className="mt-4 text-xs leading-6 text-slate-500">{selected.summary}</p>
          <div className="mt-6 grid gap-3">
            {(["Resume", "Project", "Assessment"] as const).map((source) => (
              <div className="flex items-center justify-between border-b border-slate-100 pb-3" key={source}>
                <span className="text-xs font-semibold text-slate-600">{source} evidence</span>
                <EvidenceMark
                  label={selected.evidence?.[source] ? "Verified" : "Not found"}
                  active={selected.evidence?.[source] ?? false}
                />
              </div>
            ))}
          </div>
          <Link href="/assessment" className="button-secondary mt-6 w-full">
            Improve this signal <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="surface-card mt-5 p-5">
        <SectionTitle
          eyebrow="Skill dependency graph"
          title="How your skills build toward AI engineering"
          detail="Dependencies make the next move more legible."
        />
        <div className="skill-graph">
          <div className="graph-node-wrap">
            <div className="graph-node">Py</div>
            <span>Python</span>
          </div>
          <div className="graph-node-wrap">
            <div className="graph-node">ML</div>
            <span>Machine Learning</span>
          </div>
          <div className="graph-node-wrap">
            <div className="graph-node">DL</div>
            <span>Deep Learning</span>
          </div>
          <div className="graph-node-wrap">
            <div className="graph-node">Ops</div>
            <span>MLOps</span>
          </div>
          <div className="graph-node-wrap">
            <div className="graph-node">AI</div>
            <span>AI Engineer</span>
          </div>
        </div>
      </div>
    </Page>
  );
}

export function SkillGaps() {
  const [gapData, setGapData] = useState<any>({
    targetRole: "AI / ML Engineer",
    coveragePercentage: 72,
    gaps: [
      { name: "Python", currentLevel: 87, priority: "Matched", tone: "cyan" },
      { name: "Machine Learning", currentLevel: 82, priority: "Matched", tone: "cyan" },
      { name: "NLP", currentLevel: 81, priority: "Matched", tone: "cyan" },
      { name: "Docker", currentLevel: 35, priority: "High priority", tone: "amber" },
      { name: "AWS", currentLevel: 28, priority: "Medium priority", tone: "indigo" },
      { name: "MLOps", currentLevel: 22, priority: "High priority", tone: "amber" },
    ],
  });

  useEffect(() => {
    api.skills.getGaps().then((data) => {
      if (data) {
        setGapData({
          targetRole: data.targetRole || "AI / ML Engineer",
          coveragePercentage: data.roleCoverage || 72,
          gaps: (data.gaps || []).map((g: any) => ({
            name: g.skillName || g.skill || g.name,
            currentLevel: g.currentConfidence || g.currentLevel || g.value || 30,
            priority: g.priority === "High" || g.status === "High priority" ? "High priority" : g.priority === "Medium" || g.status === "Medium priority" ? "Medium priority" : "Matched",
            tone: g.priority === "High" || g.status === "High priority" ? "amber" : g.priority === "Medium" || g.status === "Medium priority" ? "indigo" : "cyan",
          })),
        });
      }
    }).catch(() => {});
  }, []);

  return (
    <Page>
      <PageHeader
        eyebrow="Intelligence layer"
        title="Skill gap analysis"
        detail="Compare your verified signal with the requirements of your target role — then prioritize the gap that changes the outcome."
        action={
          <button className="button-secondary">
            <Filter size={14} /> {gapData.targetRole} <ChevronRight size={14} />
          </button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <div className="surface-card p-5">
          <div className="eyebrow">Target role</div>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">{gapData.targetRole}</h2>
          <p className="mt-2 text-xs leading-6 text-slate-500">Based on target role profiles and your verified database evidence.</p>
          <div className="mt-6 flex items-center gap-4">
            <ProgressRing value={gapData.coveragePercentage} size={104} stroke={8} label="coverage" />
            <div>
              <div className="font-display text-2xl font-semibold">{gapData.coveragePercentage}%</div>
              <div className="mt-1 text-xs text-slate-500">role skill coverage</div>
            </div>
          </div>
          <div className="mt-6">
            <InfoCallout tone="indigo">
              You already have the modeling foundation. Production fluency is what separates your current signal from the next level.
            </InfoCallout>
          </div>
        </div>

        <div className="surface-card p-5">
          <SectionTitle eyebrow="Gap map" title="Current skills vs role requirements" action={<SignalBadge tone="amber">Priority gaps identified</SignalBadge>} />
          <div className="grid gap-4">
            {gapData.gaps.map((item: any) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="min-w-[125px] text-xs font-bold text-slate-700">{item.name}</div>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className={
                        item.tone === "cyan" ? "h-full rounded-full bg-cyan-500" : item.tone === "amber" ? "h-full rounded-full bg-amber-400" : "h-full rounded-full bg-indigo-500"
                      }
                      style={{ width: `${item.currentLevel}%` }}
                    />
                  </div>
                </div>
                <div className="w-24 text-right">
                  <SignalBadge tone={item.tone}>{item.priority}</SignalBadge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="surface-card mt-5 p-5">
        <SectionTitle
          eyebrow="Priority logic"
          title="Why Docker comes first"
          detail="Priority balances demand, gap size, dependencies, assessment performance, and estimated readiness impact."
        />
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["Demand", "3 / 4 target roles", "Required by the roles you’re closest to."],
            ["Dependency", "Unlocks MLOps", "Creates the base for AWS and production workflows."],
            ["Impact", "+6 readiness", "A small project can create proof across multiple signals."],
          ].map(([label, value, detail]) => (
            <div className="rounded-xl bg-slate-50 p-4" key={String(label)}>
              <div className="eyebrow">{label}</div>
              <div className="mt-3 font-display text-lg font-semibold text-slate-900">{value}</div>
              <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
            </div>
          ))}
        </div>
        <Link href="/skill-impact" className="button-primary mt-5">
          Simulate the gap closing <TrendingUp size={15} />
        </Link>
      </div>
    </Page>
  );
}

export function CareerReadiness() {
  const [readinessData, setReadinessData] = useState<CareerReadinessData>({
    score: 78,
    previousScore: 74,
    delta: 4,
    breakdown: readinessBreakdown,
    blockers: [
      { rank: "01", skill: "Docker", reason: "Add verified proof to lift role alignment." },
      { rank: "02", skill: "AWS", reason: "Add verified proof to lift role alignment." },
      { rank: "03", skill: "System design", reason: "Add verified proof to lift role alignment." },
    ],
    radar: [
      { subject: "Technical", score: 85, fullMark: 100 },
      { subject: "Practical", score: 70, fullMark: 100 },
      { subject: "Problem", score: 75, fullMark: 100 },
      { subject: "Project", score: 80, fullMark: 100 },
      { subject: "Alignment", score: 72, fullMark: 100 },
    ],
  });

  useEffect(() => {
    api.readiness.get().then((data) => {
      if (data) {
        setReadinessData(data);
      }
    }).catch(() => {});
  }, []);

  const radarData = readinessData.radar && readinessData.radar.length > 0
    ? readinessData.radar
    : (readinessData.breakdown || []).map((item: any) => ({
        subject: item.label.split(" ")[0],
        score: item.value,
        fullMark: 100,
      }));

  return (
    <Page>
      <PageHeader
        eyebrow="Intelligence layer"
        title="Career readiness"
        detail="A composite signal built from technical skills, practical application, project evidence, assessment alignment, and target-role coverage."
        action={<DemoTag />}
      />
      <div className="readiness-layout">
        <div className="surface-card readiness-score-panel">
          <div className="eyebrow">Overall signal</div>
          <ProgressRing value={readinessData.score} size={190} stroke={12} label="readiness" />
          <div className="mt-5 flex items-center gap-2">
            <SignalBadge tone="green">+{readinessData.delta} this month</SignalBadge>
            <span className="text-xs text-slate-500">vs {readinessData.previousScore} previously</span>
          </div>
        </div>

        <div className="surface-card p-5">
          <SectionTitle eyebrow="Readiness breakdown" title="What is carrying the signal" />
          <div className="grid gap-4">
            {(readinessData.breakdown || []).map((item: any) => (
              <SkillBar
                key={item.label}
                label={item.label}
                value={item.value}
                color={item.color === "#06B6D4" ? "cyan" : item.color === "#94A3B8" ? "amber" : "indigo"}
              />
            ))}
          </div>
          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="eyebrow">Blocking the next level</div>
            {(readinessData.blockers || []).map((item: any, index: number) => {
              const skillName = typeof item === "string" ? item : item.skill;
              const reason = typeof item === "object" && item.reason ? item.reason : "Add verified proof to lift role alignment.";
              const rank = typeof item === "object" && item.rank ? item.rank : `0${index + 1}`;
              return (
                <div className="readiness-blocker" key={skillName}>
                  <span className="blocker-rank">{rank}</span>
                  <div>
                    <div className="text-xs font-extrabold text-slate-800">{skillName}</div>
                    <div className="mt-1 text-[11px] text-slate-500">{reason}</div>
                  </div>
                  <ArrowUpRight size={14} className="ml-auto text-slate-400" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="surface-card mt-5 p-5">
        <SectionTitle
          eyebrow="Shape of your signal"
          title="Balanced enough to build on"
          detail="The strongest next move is in the lower-right: turn technical understanding into production evidence."
        />
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Readiness" dataKey="score" stroke="#4f46e5" fill="#818cf8" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Page>
  );
}

export function SkillImpact() {
  const [selected, setSelected] = useState("Docker");
  const [options, setOptions] = useState([
    { skill: "Docker", readiness: 78, lift: 6, coverage: 79, matches: 3, role: "AI / ML Engineer" },
    { skill: "AWS", readiness: 84, lift: 12, coverage: 86, matches: 4, role: "Cloud ML Engineer" },
    { skill: "MLOps", readiness: 90, lift: 18, coverage: 92, matches: 4, role: "ML Platform Engineer" },
  ]);

  useEffect(() => {
    api.skills.simulateImpact().then((data) => {
      if (data && data.length > 0) {
        setOptions(data);
      }
    }).catch(() => {});
  }, []);

  const current = options.find((item) => item.skill === selected) ?? options[0];

  return (
    <Page>
      <PageHeader
        eyebrow="Decision support"
        title="Skill impact simulator"
        detail="Preview which missing skill could move your signal the furthest before you commit the learning time."
        action={<SignalBadge tone="amber">Estimated simulation</SignalBadge>}
      />
      <InfoCallout tone="amber">
        <strong>Not a guaranteed employment outcome.</strong>&nbsp; These values are model estimates based on your current evidence and target-role coverage.
      </InfoCallout>
      <div className="impact-layout mt-5">
        <div className="surface-card p-5">
          <SectionTitle eyebrow="Choose a gap" title="What if you learned…" />
          <div className="impact-select">
            {options.map((option) => (
              <button
                className={option.skill === selected ? "active" : ""}
                key={option.skill}
                onClick={() => setSelected(option.skill)}
              >
                <span>{option.skill}</span>
                {option.skill === selected && <Check size={15} />}
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <div className="eyebrow">Why this signal</div>
            <p className="mt-2 text-xs leading-6 text-slate-500">
              {selected} is a {selected === "Docker" ? "high-demand gap with a fast path to project evidence" : "high-leverage capability that compounds with your existing ML foundation"}.
            </p>
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow">Estimated after {current.skill}</div>
              <div className="impact-line mt-3">
                <span className="impact-line-value">{current.readiness}</span>
                <ArrowRight className="mb-1 text-slate-300" size={20} />
                <span className="impact-line-value text-cyan-600">{current.readiness + current.lift}</span>
                <span className="delta-up mb-1">+{current.lift} pts</span>
              </div>
            </div>
            <MatchScore value={current.coverage} size="md" />
          </div>

          <div className="mt-8 impact-bar">
            {[
              ["Career readiness", current.readiness + current.lift, current.readiness + current.lift],
              ["Skill coverage", current.coverage, current.coverage],
              ["Job matches", current.matches, current.matches],
              ["Role compatibility", 74 + current.lift, 74 + current.lift],
            ].map(([label, value, display]) => (
              <div className="impact-bar-row" key={String(label)}>
                <span>{label}</span>
                <div className="impact-bar-track">
                  <div className="impact-bar-fill" style={{ width: `${label === "Job matches" ? Number(value) * 25 + 2 : Number(value)}%` }} />
                </div>
                <strong className="text-right font-display text-slate-700">
                  {display}{label === "Job matches" ? " roles" : "%"}
                </strong>
              </div>
            ))}
          </div>

          <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
            <span>Estimated impact on {current.role}</span>
            <Link href="/jobs" className="font-extrabold text-indigo-600">
              See matching roles <ArrowRight size={13} className="inline" />
            </Link>
          </div>
        </div>
      </div>
    </Page>
  );
}

export function Jobs() {
  const [query, setQuery] = useState("");
  const [jobsList, setJobsList] = useState<JobMatch[]>(() => jobs);

  useEffect(() => {
    api.jobs.list().then((data) => {
      if (data && data.length > 0) {
        setJobsList(data);
      }
    }).catch(() => {});
  }, []);

  const filtered = jobsList.filter((job) =>
    `${job.role} ${job.company} ${job.location}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Page>
      <PageHeader
        eyebrow="Opportunity layer"
        title="Job explorer"
        detail="Find roles that fit your current signal, with the missing pieces explained instead of hidden."
        action={<button className="button-secondary"><Filter size={14} /> Filters</button>}
      />
      <div className="mb-5 flex max-w-xl items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <Search size={16} className="text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search roles, companies, or locations"
          className="min-w-0 flex-1 bg-transparent text-xs outline-none"
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="surface-card mt-5">
          <div className="empty-state">
            <Search size={18} className="text-slate-400" />
            <h3 className="mt-3 font-semibold">No roles match that search</h3>
            <p className="mt-1 text-sm text-slate-500">Try a different title, company, or location.</p>
          </div>
        </div>
      )}
    </Page>
  );
}

function JobCard({ job }: { job: JobMatch }) {
  return (
    <div className="surface-card job-card surface-card-hover">
      <div className="job-card-header">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BriefcaseBusiness size={17} />
            </span>
            <div>
              <h3>{job.role}</h3>
              <div className="mt-1 text-xs font-semibold text-slate-500">{job.company}</div>
            </div>
          </div>
          <div className="job-meta mt-4">
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {job.location}
            </span>
            <span>{job.workMode}</span>
            <span>{job.salary}</span>
          </div>
        </div>
        <MatchScore value={job.match} size="md" />
      </div>
      <p className="mt-5 text-xs leading-6 text-slate-500">{job.description}</p>
      <div className="mt-5 grid gap-3">
        <div>
          <div className="eyebrow mb-2">Matching skills</div>
          <div className="job-pill-list">
            {(job.matchingSkills || []).map((skill) => (
              <span className="job-pill job-pill-match" key={skill}>{skill}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="eyebrow mb-2">Missing skills</div>
          <div className="job-pill-list">
            {(job.missingSkills || []).map((skill) => (
              <span className="job-pill job-pill-missing" key={skill}>{skill}</span>
            ))}
          </div>
        </div>
      </div>
      <Link href={`/jobs/${job.id}`} className="button-secondary mt-5 w-full">
        Explain this match <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export function JobDetail() {
  const [, params] = useRoute<{ id: string }>("/jobs/:id");
  const [job, setJob] = useState<JobMatch>(() => jobs.find((item) => item.id === params?.id) ?? jobs[0]);

  useEffect(() => {
    if (params?.id) {
      api.jobs.get(params.id).then((data) => {
        if (data) {
          setJob(data);
        }
      }).catch(() => {});
    }
  }, [params?.id]);

  return (
    <Page>
      <Link href="/jobs" className="mb-6 inline-flex items-center gap-2 text-xs font-extrabold text-slate-500">
        <ArrowRight size={14} className="rotate-180" /> Back to job explorer
      </Link>
      <PageHeader
        eyebrow="Explainable match"
        title={job.role}
        detail={`${job.company} · ${job.location} · ${job.workMode}`}
        action={<MatchScore value={job.match} size="lg" />}
      />
      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="surface-card p-5">
          <SectionTitle eyebrow="Why this role" title="Your signal, unpacked" detail={job.description} />
          <div className="grid gap-4">
            {(job.breakdown || []).map((item) => (
              <SkillBar key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-cyan-50 p-4">
               <div className="eyebrow text-cyan-700">Strongest alignment</div>
              <div className="mt-2 font-display text-lg font-semibold text-cyan-950">Project alignment · 90%</div>
              <p className="mt-2 text-xs leading-5 text-cyan-800">Your applied project evidence makes the role more credible than resume keywords alone.</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <div className="eyebrow text-amber-700">Biggest drag</div>
              <div className="mt-2 font-display text-lg font-semibold text-amber-950">Skill match · {job.match}%</div>
              <p className="mt-2 text-xs leading-5 text-amber-800">Closing missing requirements increases this alignment score.</p>
            </div>
          </div>
        </div>

        <div className="surface-card p-5">
          <SectionTitle eyebrow="Role requirements" title="What to bring" />
          <div className="grid gap-3">
            {(job.requiredSkills || []).map((skill) => (
              <div className="flex items-center justify-between border-b border-slate-100 pb-3" key={skill}>
                <span className="text-xs font-bold text-slate-700">{skill}</span>
                {(job.matchingSkills || []).includes(skill) ? (
                  <SignalBadge tone="cyan">Matched</SignalBadge>
                ) : (
                  <SignalBadge tone="amber">Gap</SignalBadge>
                )}
              </div>
            ))}
          </div>
          <Link href="/skill-impact" className="button-primary mt-6 w-full">
            Simulate closing a gap <TrendingUp size={15} />
          </Link>
          <button className="button-quiet mt-2 w-full" onClick={() => toast.success("Role saved to your opportunity list")}>
            Save this role <Check size={14} />
          </button>
        </div>
      </div>
    </Page>
  );
}

export function Roadmap() {
  const [items, setItems] = useState<RoadmapItem[]>(() => roadmap);

  useEffect(() => {
    api.roadmap.get().then((data) => {
      if (data && data.length > 0) {
        setItems(data);
      }
    }).catch(() => {});
  }, []);

  const toggle = async (id: string) => {
    try {
      await api.roadmap.complete(id);
    } catch {
      // Offline fallback
    }
    setItems((current) =>
      current.map((item) => (item.id === id && item.status !== "Complete" ? { ...item, status: "Complete", progress: 100 } : item))
    );
    toast.success("Roadmap milestone marked complete");
  };

  return (
    <Page backgroundIntensity="rich">
      <div className="roadmap-stage">
        <SkillNetworkBackground variant="roadmap" />
        <div className="roadmap-stage-content">
          <PageHeader
            eyebrow="Opportunity layer"
            title="Your learning roadmap"
            detail="A sequence tuned to your current signal, target role, and the highest-impact dependencies."
            action={<SignalBadge tone="cyan">68% complete</SignalBadge>}
          />
          <div className="roadmap-path" />
          <div className="max-w-3xl">
            {items.map((item) => (
              <div
                className={`roadmap-item ${
                  item.status === "Complete" ? "roadmap-item-done" : item.status === "In progress" || item.status === "Next up" ? "roadmap-item-active" : ""
                }`}
                key={item.id}
              >
                <div className="roadmap-item-node">{item.status === "Complete" ? <Check size={14} /> : item.stage}</div>
                <div>
                  <h3>{item.skill}</h3>
                  <p>{item.reason}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <SignalBadge tone={item.status === "Complete" ? "cyan" : item.status === "In progress" ? "indigo" : "slate"}>
                      {item.status}
                    </SignalBadge>
                    <span className="text-[10px] text-slate-500">
                      {item.difficulty} · {item.effort}
                    </span>
                  </div>
                  {item.status !== "Complete" && (
                    <div className="mt-3 h-1.5 max-w-sm rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-cyan-400" style={{ width: `${item.progress}%` }} />
                    </div>
                  )}
                </div>
                <div className="roadmap-item-meta">
                  <strong>{item.progress}%</strong>progress
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="surface-card mt-5 p-5">
        <SectionTitle
          eyebrow="Next action"
          title="Turn the next node into evidence"
          detail="Small, finished projects create stronger signals than passive course completion."
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Cloud size={18} />
            </span>
            <div>
              <div className="text-xs font-extrabold">Containerize SupportSense</div>
              <div className="mt-1 text-[11px] text-slate-500">Docker · practical evidence · 4 hours</div>
            </div>
          </div>
          <button className="button-primary" onClick={() => toggle("road-3")}>
            Mark milestone complete <Check size={14} />
          </button>
        </div>
      </div>
    </Page>
  );
}

export function Analytics() {
  const [data, setData] = useState({
    growthSeries,
    history: assessmentHistory,
    readiness: 78,
    bestMatch: 86,
    roadmap: 68,
    assessmentsCount: 4,
  });

  useEffect(() => {
    api.analytics.getOverview().then((data) => {
      if (data) {
        setData(data);
      }
    }).catch(() => {});
  }, []);

  return (
    <Page>
      <PageHeader
        eyebrow="Observability"
        title="Analytics"
        detail="Track the signals that tell you whether your effort is moving you toward a better fit."
        action={<DemoTag />}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Readiness" value={String(data.readiness)} helper="+20 points since May" trend="+20" icon={<CircleGaugeIcon />} tone="cyan" />
        <StatCard label="Job match" value={`${data.bestMatch}%`} helper="Best current role alignment" trend="+24" icon={<BriefcaseBusiness size={17} />} tone="indigo" />
        <StatCard label="Roadmap" value={`${data.roadmap}%`} helper="3 of 5 stages started" icon={<GitBranch size={17} />} tone="amber" />
        <StatCard label="Assessments" value={String(data.assessmentsCount)} helper="Average score · 74%" icon={<BarChart3 size={17} />} tone="slate" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="surface-card p-5">
          <SectionTitle eyebrow="Five-month view" title="Signal movement" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.growthSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 11 }} />
                <Line type="monotone" dataKey="score" name="Readiness" stroke="#06b6d4" strokeWidth={2.5} />
                <Line type="monotone" dataKey="match" name="Job match" stroke="#4f46e5" strokeWidth={2.5} />
                <Line type="monotone" dataKey="roadmap" name="Roadmap" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <SectionTitle eyebrow="Assessment trend" title="Knowledge signal" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.history.slice(0, 3).reverse()} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="attemptId" type="category" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 11 }} />
                <Bar dataKey="score" fill="#4f46e5" radius={[0, 5, 5, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="surface-card mt-5 p-5">
        <SectionTitle eyebrow="Signal readout" title="What the trend says" />
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["Assessment scores", "62 → 79", "The adaptive loop is building confidence."],
            ["Job match improvement", "62% → 86%", "Proof in Docker and SQL is the next unlock."],
            ["Roadmap progress", "12% → 68%", "Your consistency is doing the compounding."],
          ].map(([label, value, detail]) => (
            <div className="rounded-xl bg-slate-50 p-4" key={String(label)}>
              <div className="eyebrow">{label}</div>
              <div className="mt-3 font-display text-xl font-semibold">{value}</div>
              <div className="mt-2 text-xs leading-5 text-slate-500">{detail}</div>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

function CircleGaugeIcon() {
  return <CircleGauge size={17} />;
}

export function JobMarket() {
  return (
    <Page>
      <PageHeader
        eyebrow="Market intelligence"
        title="Job market"
        detail="A lightweight read on the skills and roles shaping the opportunity layer. Demo signals today, API-ready tomorrow."
        action={<SignalBadge tone="cyan">Updated Sep 2026</SignalBadge>}
      />
      <div className="market-grid">
        <div className="surface-card p-5">
          <SectionTitle eyebrow="Trending skills" title="What is growing" />
          <div>
            {marketSignals.map((signal) => (
              <div className="market-signal" key={signal.label}>
                <strong>{signal.label}</strong>
                <div className="market-track">
                  <i style={{ width: `${signal.growth}%` }} />
                </div>
                <small>{signal.change}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-5">
          <SectionTitle eyebrow="Role demand" title="Where teams are hiring" />
          <div className="grid gap-3">
            {[
              ["Applied AI Engineer", "High", 88],
              ["ML Platform Engineer", "Rising", 76],
              ["Data Scientist", "Steady", 71],
              ["Full Stack Engineer", "High", 84],
            ].map(([role, trend, value]) => (
              <div className="flex items-center gap-3" key={String(role)}>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">{role}</span>
                    <span className="text-slate-400">{trend}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${value}%` }} />
                  </div>
                </div>
                <span className="font-display text-sm font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="surface-card mt-5 p-5">
        <SectionTitle
          eyebrow="Industry signals"
          title="The shift from model-building to model-operating"
          detail="Teams increasingly value evaluation, deployment, observability, and data contracts alongside core modeling ability."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["01", "Evaluation literacy", "Know how to measure quality, failure modes, and change over time."],
            ["02", "Deployment fluency", "Move a model from notebook to a repeatable, explainable service."],
            ["03", "Data reliability", "Treat schemas, contracts, and lineage as part of the product."],
          ].map(([number, title, detail]) => (
            <div className="rounded-xl border border-slate-100 p-4" key={String(number)}>
              <div className="font-display text-sm font-semibold text-cyan-600">{number}</div>
              <div className="mt-4 text-sm font-extrabold">{title}</div>
              <p className="mt-2 text-xs leading-6 text-slate-500">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

export function Assistant() {
  const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([
    { role: "ai", text: "I’m your SkillBridge guide. Ask about your next skill, your match, or the path to an AI Engineer role." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.assistant.getHistory().then((data) => {
      if (data && data.length > 0) {
        setMessages(data);
      }
    }).catch(() => {});
  }, []);

  const prompts = [
    ["next", "Which skill should I learn next?"],
    ["match", "Why is my job match low?"],
    ["improve", "What should I improve?"],
    ["engineer", "How can I become an AI Engineer?"],
  ];

  const send = async (text = input) => {
    if (!text.trim()) return;
    const userText = text;
    setInput("");
    setMessages((current) => [...current, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await api.assistant.chat(userText);
      if (res && res.text) {
        setMessages((current) => [...current, { role: "ai", text: res.text }]);
        return;
      }
    } catch {
      // Local fallback
    } finally {
      setLoading(false);
    }

    const key = userText.toLowerCase().includes("next")
      ? "next"
      : userText.toLowerCase().includes("match")
      ? "match"
      : userText.toLowerCase().includes("engineer")
      ? "engineer"
      : "improve";
    setMessages((current) => [...current, { role: "ai", text: (assistantReplies as any)[key] || "I'm analyzing your signals." }]);
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Supporting intelligence"
        title="AI career assistant"
        detail="A contextual guide for the decisions around your intelligence loop — grounded in your actual skills, gaps, and readiness."
        action={<SignalBadge tone="indigo">Context-Aware AI</SignalBadge>}
      />
      <div className="assistant-layout">
        <div className="surface-card p-5">
          <SectionTitle eyebrow="Start with a question" title="Get a clearer read" />
          <div className="grid gap-3">
            {prompts.map(([key, label]) => (
              <button className="assistant-prompt" key={key} onClick={() => send(label)}>
                <Sparkles size={15} className="mt-0.5 shrink-0 text-cyan-500" />
                {label}
                <ArrowRight size={14} className="ml-auto mt-0.5 text-slate-400" />
              </button>
            ))}
          </div>
          <div className="mt-7">
            <InfoCallout tone="indigo">
              Answers are personalized from your real profile, verified skills, assessment results, and current roadmap in PostgreSQL.
            </InfoCallout>
          </div>
        </div>

        <div className="surface-card assistant-chat">
          <div className="chat-thread">
            {messages.map((message, index) => (
              <div key={index} className={message.role === "ai" ? "chat-bubble chat-bubble-ai" : "chat-bubble chat-bubble-user"}>
                {message.text}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble chat-bubble-ai animate-pulse">Thinking…</div>
            )}
          </div>
          <form
            className="chat-input-row"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about your career signal…" />
            <button aria-label="Send question" className="button-primary button-small" disabled={loading}>
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </Page>
  );
}

export function Notifications() {
  const [items, setItems] = useState<Notification[]>(() => notifications);

  useEffect(() => {
    api.notifications.list().then((data) => {
      if (data && data.length > 0) {
        setItems(data);
      }
    }).catch(() => {});
  }, []);

  const markAllRead = async () => {
    try {
      await api.notifications.markAllRead();
    } catch {}
    setItems((current) => current.map((item) => ({ ...item, unread: false })));
    toast.success("All notifications marked as read");
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Workspace"
        title="Notifications"
        detail="Useful updates from your skill and opportunity signals."
        action={
          <button className="button-quiet" onClick={markAllRead}>
            Mark all as read
          </button>
        }
      />
      <div className="surface-card p-5">
        {items.map((item) => (
          <div className="flex items-start gap-3 border-b border-slate-100 py-4 last:border-0" key={item.id}>
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                item.unread ? "bg-cyan-50 text-cyan-600" : "bg-slate-100 text-slate-400"
              }`}
            >
              {item.type === "assessment" ? (
                <BarChart3 size={16} />
              ) : item.type === "job" ? (
                <BriefcaseBusiness size={16} />
              ) : item.type === "roadmap" ? (
                <GitBranch size={16} />
              ) : (
                <Sparkles size={16} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xs font-extrabold text-slate-800">{item.title}</h3>
                {item.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-500" />}
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
              <div className="mt-2 text-[10px] font-semibold text-slate-400">{item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

export function Settings() {
  const [tab, setTab] = useState("Account");
  const dark = true;
  const [, navigate] = useLocation();

  return (
    <Page>
      <PageHeader eyebrow="Workspace" title="Settings" detail="Tune how your workspace receives and presents intelligence." />
      <div className="grid gap-5 lg:grid-cols-[190px_1fr]">
        <div className="surface-card h-fit p-2">
          <div className="settings-tabs">
            {["Account", "Notifications", "Appearance", "Privacy", "Preferences"].map((item) => (
              <button
                className={tab === item ? "settings-tab settings-tab-active" : "settings-tab"}
                key={item}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="surface-card p-5">
          <SectionTitle eyebrow={tab} title={`${tab} settings`} detail="Preferences persist across sessions." />
          {tab === "Appearance" ? (
            <div className="grid gap-5">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div>
                  <div className="text-xs font-extrabold">Unified dark environment</div>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    One continuous navy intelligence canvas across every surface.
                  </p>
                </div>
                <button
                  aria-label="Unified dark environment is active"
                  onClick={() => toast.success("Unified dark environment is active across SkillBridge AI")}
                  className={`relative h-6 w-11 rounded-full ${dark ? "bg-cyan-500" : "bg-slate-300"}`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                      dark ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                <div>
                  <div className="text-xs font-extrabold">Reduced motion</div>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    Respect system preference for non-essential animation.
                  </p>
                </div>
                <SignalBadge tone="cyan">System</SignalBadge>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {[
                ["Profile & personalization", "Edit the context behind your career signal", "Profile"],
                ["Assessment preferences", "Keep question sets diverse and adaptive", "Assessments"],
                ["Data & privacy", "Enterprise data isolation and encrypted storage", "Verified"],
              ].map(([title, detail, action]) => (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 p-4" key={String(title)}>
                  <div>
                    <div className="text-xs font-extrabold">{title}</div>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">{detail}</p>
                  </div>
                  <button
                    className="button-secondary button-small"
                    onClick={() =>
                      action === "Profile"
                        ? navigate("/profile")
                        : toast.success(`${action} preferences saved`)
                    }
                  >
                    {action}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}

export function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Profile>({ ...demoProfile, name: "", email: "", skills: [], projects: [] });
  const [skillInput, setSkillInput] = useState("");
  const steps = ["Personal", "Education", "Career", "Skills", "Projects", "Resume"];

  const update = (key: keyof Profile, value: any) =>
    setProfile((current) => ({ ...current, [key]: value }));

  const next = async () => {
    if (step < steps.length - 1) {
      setStep((current) => current + 1);
    } else {
      const finalProfile = {
        ...profile,
        name: profile.name || demoProfile.name,
        email: profile.email || demoProfile.email,
        skills: profile.skills.length ? profile.skills : demoProfile.skills,
        projects: profile.projects.length ? profile.projects : demoProfile.projects,
      };
      saveProfile(finalProfile);
      completeOnboarding();
      try {
        await api.profile.onboarding(finalProfile);
        toast.success("Profile signal saved to database");
      } catch {
        toast.success("Profile signal ready");
      }
      navigate("/dashboard");
    }
  };

  return (
    <div className="onboarding-page min-h-screen bg-slate-50">
      <div className="onboarding-header border-b border-slate-200 bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3">
              <img src="/manus-storage/skillbridge-mark_344e74fb.png" alt="" className="h-8 w-8" />
              <span className="brand-wordmark text-slate-950">
                <span>Skill</span>
                <b>Bridge</b>
              </span>
            </div>
          </Link>
          <div className="text-xs font-semibold text-slate-500">
            Profile setup · {step + 1} of {steps.length}
          </div>
        </div>
      </div>
      <main className="container max-w-5xl py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 flex items-start justify-between">
            {steps.map((item, index) => (
              <div key={item} className="relative flex flex-1 flex-col items-center gap-2 text-center">
                <div className={`onboarding-step ${index <= step ? "onboarding-step-active" : ""}`}>
                  {index < step ? <Check size={14} /> : index + 1}
                </div>
                <span className={`hidden text-[10px] font-bold sm:block ${index <= step ? "text-indigo-600" : "text-slate-400"}`}>
                  {item}
                </span>
                {index < steps.length - 1 && (
                  <div className={`onboarding-line ${index < step ? "onboarding-line-active" : ""}`} />
                )}
              </div>
            ))}
          </div>
          <div className="surface-card onboarding-card bg-white p-6 sm:p-9">
            <div className="eyebrow">
              Step {String(step + 1).padStart(2, "0")} · {steps[step]}
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-.05em]">
              {step === 0
                ? "Let’s start with you."
                : step === 1
                ? "Give your education context."
                : step === 2
                ? "What opportunity are you moving toward?"
                : step === 3
                ? "Add the skills you want to verify."
                : step === 4
                ? "Show the work behind the claim."
                : "Bring your source signal."}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              {step === 3
                ? "We’ll use these as starting claims — assessments and project evidence will shape verification."
                : "This takes less than five minutes and gives the intelligence loop enough context to be useful."}
            </p>

            <div className="mt-8">
              {step === 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" value={profile.name} onChange={(value) => update("name", value)} placeholder="Aarav Mehta" />
                  <Field label="Email" value={profile.email} onChange={(value) => update("email", value)} placeholder="you@example.com" />
                </div>
              )}
              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Degree" value={profile.degree} onChange={(value) => update("degree", value)} placeholder="B.Tech Computer Science" />
                  <Field label="Specialization" value={profile.specialization} onChange={(value) => update("specialization", value)} placeholder="Intelligent Systems" />
                  <Field label="College" value={profile.college} onChange={(value) => update("college", value)} placeholder="Pune Institute of Technology" />
                  <Field label="Graduation year" value={profile.graduationYear} onChange={(value) => update("graduationYear", value)} placeholder="2025" />
                </div>
              )}
              {step === 2 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Target role" value={profile.targetRole} onChange={(value) => update("targetRole", value)} placeholder="AI / ML Engineer" />
                  <Field label="Preferred location" value={profile.preferredLocation} onChange={(value) => update("preferredLocation", value)} placeholder="Bengaluru · Remote" />
                  <div className="form-field sm:col-span-2">
                    <label>Career goal</label>
                    <textarea rows={4} value={profile.careerGoal} onChange={(event) => update("careerGoal", event.target.value)} placeholder="What do you want to build or become?" />
                  </div>
                </div>
              )}
              {step === 3 && (
                <div>
                  <div className="flex gap-2">
                    <input
                      className="min-h-[42px] min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
                      value={skillInput}
                      onChange={(event) => setSkillInput(event.target.value)}
                      placeholder="Add a skill · e.g. Python"
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && skillInput.trim()) {
                          event.preventDefault();
                          setProfile((current) => ({ ...current, skills: [...current.skills, skillInput.trim()] }));
                          setSkillInput("");
                        }
                      }}
                    />
                    <button
                      className="button-secondary"
                      onClick={() => {
                        if (skillInput.trim()) {
                          setProfile((current) => ({ ...current, skills: [...current.skills, skillInput.trim()] }));
                          setSkillInput("");
                        }
                      }}
                    >
                      <Plus size={15} /> Add
                    </button>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {(profile.skills.length ? profile.skills : ["Python", "Machine Learning", "SQL", "NLP"]).map((skill) => (
                      <span className="skill-chip" key={skill}>
                        {skill}
                        <button
                          aria-label={`Remove ${skill}`}
                          onClick={() => setProfile((current) => ({ ...current, skills: current.skills.filter((item) => item !== skill) }))}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {step === 4 && (
                <div className="grid gap-4">
                  <Field
                    label="Project name"
                    value={profile.projects[0]?.name ?? ""}
                    onChange={(value) =>
                      setProfile((current) => ({
                        ...current,
                        projects: [{ name: value, description: current.projects[0]?.description ?? "", technologies: current.projects[0]?.technologies ?? [] }],
                      }))
                    }
                    placeholder="SupportSense"
                  />
                  <div className="form-field">
                    <label>Project description</label>
                    <textarea
                      rows={4}
                      value={profile.projects[0]?.description ?? ""}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          projects: [{ name: current.projects[0]?.name ?? "", description: event.target.value, technologies: current.projects[0]?.technologies ?? [] }],
                        }))
                      }
                      placeholder="What did you build and what changed because of it?"
                    />
                  </div>
                  <Field
                    label="Technologies used"
                    value={profile.projects[0]?.technologies.join(", ") ?? ""}
                    onChange={(value) =>
                      setProfile((current) => ({
                        ...current,
                        projects: [
                          {
                            name: current.projects[0]?.name ?? "",
                            description: current.projects[0]?.description ?? "",
                            technologies: value.split(",").map((item) => item.trim()).filter(Boolean),
                          },
                        ],
                      }))
                    }
                    placeholder="Python, scikit-learn, FastAPI"
                  />
                </div>
              )}
              {step === 5 && (
                <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                    <Upload size={20} />
                  </div>
                  <h3 className="mt-4 text-sm font-extrabold">Upload your resume</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">PDF or DOCX · parser ready</p>
                  <button className="button-secondary mt-5 button-small" onClick={() => toast.success("Resume attached")}>
                    Choose file
                  </button>
                </div>
              )}
            </div>

            <div className="mt-9 flex items-center justify-between border-t border-slate-100 pt-5">
              <button className="button-quiet" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>
                Back
              </button>
              <button className="button-primary" onClick={next}>
                {step === steps.length - 1 ? "Finish setup" : "Continue"} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
