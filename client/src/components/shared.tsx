/** Living Skill Flow shared components: calm career paths, evidence signals, and connected growth. */
import { useMemo } from "react";
import { ArrowUpRight, Check, CircleHelp, Info, Minus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const brandMark = "/manus-storage/skillbridge-mark_344e74fb.png";

export function SkillBridgeBackground({ theme = "light", intensity = "subtle", className = "" }: { theme?: "light" | "dark"; intensity?: "rich" | "subtle" | "minimal"; className?: string }) {
  const paths = useMemo(() => [
    "M-8 72 C 15 50, 27 84, 47 55 S 72 28, 108 33",
    "M-8 22 C 17 42, 30 7, 55 29 S 78 79, 108 66",
    "M-4 94 C 25 68, 40 72, 58 54 S 82 37, 106 10",
  ], []);
  return <div aria-hidden="true" className={cn("skill-flow-background pointer-events-none absolute inset-0 overflow-hidden", `flow-${theme}`, `flow-${intensity}`, className)}>
    <div className="flow-grid absolute inset-0" />
    <div className="flow-ambient flow-ambient-one" />
    <div className="flow-ambient flow-ambient-two" />
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {paths.map((path, index) => <path key={path} id={`skill-flow-path-${index}`} className={`flow-path flow-path-${index + 1}`} d={path} />)}
    </svg>
    <div className="flow-nodes absolute inset-0">
      <span className="flow-node flow-node-python" /><span className="flow-node flow-node-ml" /><span className="flow-node flow-node-growth" /><span className="flow-node flow-node-opportunity" />
    </div>
    {intensity !== "minimal" && <><span className="flow-data-dot flow-data-dot-one" /><span className="flow-data-dot flow-data-dot-two" /></>}
    {intensity === "rich" && <span className="flow-data-dot flow-data-dot-three" />}
    <div className="flow-ribbon flow-ribbon-one" /><div className="flow-ribbon flow-ribbon-two" />
  </div>;
}

/** Backward-compatible alias for existing pages; all variants now use Living Skill Flow semantics. */
export function SkillNetworkBackground({ variant = "minimal", className = "" }: { variant?: "rich" | "subtle" | "minimal" | "roadmap"; className?: string }) {
  return <SkillBridgeBackground theme={variant === "roadmap" || variant === "rich" ? "dark" : "light"} intensity={variant === "roadmap" ? "rich" : variant} className={className} />;
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return <div className="brand-lockup flex items-center gap-3"><img src={brandMark} alt="" className={cn("brand-mark", compact ? "h-8 w-8" : "h-9 w-9")} /><span className={cn("brand-wordmark", compact && "text-base")}><span>Skill</span><b>Bridge</b></span></div>;
}

export function SignalBadge({ children, tone = "slate", className = "" }: { children: React.ReactNode; tone?: "cyan" | "indigo" | "amber" | "slate" | "rose" | "green"; className?: string }) {
  return <span className={cn("signal-badge", `signal-${tone}`, className)}><span className="signal-dot" />{children}</span>;
}
export function SectionTitle({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: React.ReactNode }) { return <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div>{eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}<h2 className="font-display text-xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h2>{detail && <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">{detail}</p>}</div>{action}</div>; }
export function PageHeader({ eyebrow, title, detail, action, className = "" }: { eyebrow: string; title: string; detail: string; action?: React.ReactNode; className?: string }) { return <div className={cn("page-header", className)}><div><div className="eyebrow mb-3">{eyebrow}</div><h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-500 dark:text-slate-400">{detail}</p></div>{action && <div className="flex shrink-0 items-center gap-3">{action}</div>}</div>; }
export function ProgressRing({ value, size = 142, stroke = 10, label = "Readiness", accent = "cyan" }: { value: number; size?: number; stroke?: number; label?: string; accent?: "cyan" | "indigo" }) { const radius = (size - stroke) / 2; const circumference = 2 * Math.PI * radius; const dash = circumference - (value / 100) * circumference; return <div className="relative shrink-0" style={{ width: size, height: size }}><svg width={size} height={size} className="-rotate-90"><circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="none" className="text-slate-100 dark:text-slate-800" /><circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dash} className={accent === "cyan" ? "text-cyan-500" : "text-indigo-500"} /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-display text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</span><span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</span></div></div>; }
export function StatCard({ label, value, helper, trend, icon, tone = "indigo" }: { label: string; value: string; helper: string; trend?: string; icon?: React.ReactNode; tone?: "indigo" | "cyan" | "amber" | "slate" }) { return <div className="surface-card stat-card group"><div className={cn("stat-icon", `stat-${tone}`)}>{icon}</div><div className="mt-4 flex items-end justify-between gap-3"><div><div className="eyebrow mb-2">{label}</div><div className="font-display text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</div></div>{trend && <SignalBadge tone="green">{trend}</SignalBadge>}</div><p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{helper}</p></div>; }
export function EmptyState({ title, detail, action }: { title: string; detail: string; action?: React.ReactNode }) { return <div className="empty-state"><div className="empty-icon"><CircleHelp size={18} /></div><h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{title}</h3><p className="mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">{detail}</p>{action && <div className="mt-4">{action}</div>}</div>; }
export function LoadingState({ label = "Loading signal" }: { label?: string }) { return <div className="empty-state"><div className="loading-orbit" /><p className="mt-4 text-sm text-slate-500">{label}…</p></div>; }
export function InfoCallout({ children, tone = "indigo" }: { children: React.ReactNode; tone?: "indigo" | "cyan" | "amber" }) { return <div className={cn("info-callout", `callout-${tone}`)}><Info size={16} className="mt-0.5 shrink-0" /><div className="text-sm leading-6">{children}</div></div>; }
export function SkillBar({ label, value, detail, color = "indigo" }: { label: string; value: number; detail?: string; color?: "indigo" | "cyan" | "amber" }) { return <div><div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium text-slate-700 dark:text-slate-200">{label}</span><span className="font-display text-xs font-semibold text-slate-500">{detail ?? `${value}%`}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={cn("h-full rounded-full transition-all duration-500", color === "cyan" ? "bg-cyan-500" : color === "amber" ? "bg-amber-400" : "bg-indigo-500")} style={{ width: `${value}%` }} /></div></div>; }
export function EvidenceMark({ active, label }: { active: boolean; label: string }) { return <span className={cn("evidence-mark", active ? "evidence-active" : "evidence-inactive")}><span className="evidence-check">{active ? <Check size={11} strokeWidth={3} /> : <Minus size={11} />}</span>{label}</span>; }
export function MatchScore({ value, size = "md" }: { value: number; size?: "sm" | "md" | "lg" }) { return <div className={cn("match-score", `match-${size}`, value >= 80 ? "match-strong" : value >= 70 ? "match-mid" : "match-low")}><span>{value}%</span><small>match</small></div>; }
export function Sparkline({ values, color = "#06B6D4" }: { values: number[]; color?: string }) { const points = useMemo(() => { const max = Math.max(...values); const min = Math.min(...values); return values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${84 - ((value - min) / Math.max(max - min, 1)) * 68}`).join(" "); }, [values]); return <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-12 w-full"><polyline points={points} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></svg>; }
export function ArrowLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) { return <button onClick={onClick} className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200">{children}<ArrowUpRight size={14} /></button>; }
export function DemoTag() { return <span className="demo-tag"><Sparkles size={11} /> DEMO DATA</span>; }
