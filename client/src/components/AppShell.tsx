/** Signal Atlas application shell: persistent intelligence rail with a calm, responsive working canvas. */
import { useState } from "react";
import { Bell, BrainCircuit, BriefcaseBusiness, ChevronDown, CircleGauge, FileText, Gauge, GitBranch, LayoutDashboard, Menu, Network, PanelLeftClose, Settings, Sparkles, Target, TrendingUp, UserRound, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { BrandMark, DemoTag, SkillBridgeBackground } from "@/components/shared";
import { getProfile } from "@/lib/storage";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Workspace" },
  { href: "/profile", label: "Profile", icon: UserRound, group: "Workspace" },
  { href: "/resume-analysis", label: "Resume analysis", icon: FileText, group: "Workspace" },
  { href: "/assessment", label: "Assessments", icon: BrainCircuit, group: "Intelligence" },
  { href: "/skills", label: "Skills portfolio", icon: Network, group: "Intelligence" },
  { href: "/skill-gaps", label: "Skill gaps", icon: Target, group: "Intelligence" },
  { href: "/career-readiness", label: "Career readiness", icon: CircleGauge, group: "Intelligence" },
  { href: "/skill-impact", label: "Skill impact", icon: TrendingUp, group: "Intelligence" },
  { href: "/jobs", label: "Job explorer", icon: BriefcaseBusiness, group: "Opportunities" },
  { href: "/roadmap", label: "Learning roadmap", icon: GitBranch, group: "Opportunities" },
  { href: "/analytics", label: "Analytics", icon: Gauge, group: "Opportunities" },
  { href: "/job-market", label: "Job market", icon: Sparkles, group: "Opportunities" },
  { href: "/assistant", label: "AI assistant", icon: BrainCircuit, group: "Support" },
  { href: "/notifications", label: "Notifications", icon: Bell, group: "Support", badge: 2 },
  { href: "/settings", label: "Settings", icon: Settings, group: "Support" },
];

export function AppShell({ children, backgroundIntensity = "subtle" }: { children: React.ReactNode; backgroundIntensity?: "rich" | "subtle" | "minimal" }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const profile = getProfile();
  const groups = Array.from(new Set(navigation.map((item) => item.group)));
  const isActive = (href: string) => href === "/dashboard" ? location === href : location.startsWith(href);
  return <div className="app-shell min-h-screen bg-slate-50 dark:bg-[#0B1220]"><SkillBridgeBackground theme="dark" intensity={backgroundIntensity} />
    <aside className={cn("app-sidebar", open && "sidebar-open")}>
      <div className="sidebar-top"><Link href="/dashboard" onClick={() => setOpen(false)}><BrandMark /></Link><button aria-label="Close navigation" className="icon-button sidebar-close" onClick={() => setOpen(false)}><X size={18} /></button></div>
      <div className="workspace-switcher"><span className="workspace-avatar">AM</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-900 dark:text-white">Aarav's workspace</span><span className="block text-[11px] text-slate-400">Early career path</span></span><ChevronDown size={14} className="text-slate-400" /></div>
      <nav className="sidebar-nav" aria-label="Primary navigation">{groups.map((group) => <div key={group} className="nav-group"><div className="nav-group-label">{group}</div>{navigation.filter((item) => item.group === group).map(({ href, label, icon: Icon, badge }) => <Link key={href} href={href} onClick={() => setOpen(false)} className={cn("nav-item", isActive(href) && "nav-item-active")}><Icon size={17} strokeWidth={isActive(href) ? 2.2 : 1.8} /><span>{label}</span>{badge && <span className="nav-badge">{badge}</span>}</Link>)}</div>)}</nav>
      <div className="sidebar-footer"><div className="sidebar-rail-card"><div className="flex items-center gap-2"><span className="rail-pulse" /><span className="text-xs font-semibold text-slate-800 dark:text-white">Intelligence loop</span></div><p className="mt-2 text-[11px] leading-5 text-slate-500">6 of 9 signals verified</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full w-[68%] rounded-full bg-cyan-500" /></div></div><DemoTag /></div>
    </aside>
    {open && <button aria-label="Close navigation overlay" className="sidebar-overlay" onClick={() => setOpen(false)} />}
    <main className="app-main"><header className="app-header"><button aria-label="Open navigation" className="icon-button mobile-menu" onClick={() => setOpen(true)}><Menu size={20} /></button><div className="header-context"><span className="hidden text-xs font-medium text-slate-400 sm:inline">SkillBridge AI</span><span className="header-separator hidden sm:inline">/</span><span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">{navigation.find((item) => isActive(item.href))?.label ?? "Workspace"}</span></div><div className="header-actions"><button className="header-search hidden md:flex" aria-label="Search"><span className="search-key">⌘ K</span><span className="text-slate-400">Search intelligence</span></button><Link href="/notifications" className="icon-button header-notification" aria-label="Notifications"><Bell size={17} /><span className="notification-dot" /></Link><Link href="/profile" className="header-profile"><span className="profile-avatar">AM</span><span className="hidden text-left lg:block"><span className="block text-xs font-semibold text-slate-800 dark:text-white">{profile.name}</span><span className="block text-[11px] text-slate-400">Candidate profile</span></span><ChevronDown size={14} className="hidden text-slate-400 lg:block" /></Link></div></header><div className="page-canvas">{children}</div></main>
    <nav className="mobile-nav" aria-label="Mobile navigation">{navigation.slice(0, 5).map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={cn("mobile-nav-item", isActive(href) && "mobile-nav-active")}><Icon size={18} /><span>{label === "Dashboard" ? "Home" : label.split(" ")[0]}</span></Link>)}</nav>
  </div>;
}

export function PublicHeader() { return <header className="public-header"><Link href="/"><BrandMark /></Link><div className="flex items-center gap-3"><Link href="/login" className="text-sm font-semibold text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">Sign in</Link><Link href="/register" className="button-primary button-small">Create account</Link></div></header>; }

export function AuthLayout({ children, eyebrow = "Career intelligence, clarified" }: { children: React.ReactNode; eyebrow?: string }) { return <div className="auth-layout"><SkillBridgeBackground theme="dark" intensity="minimal" /><PublicHeader /><main className="auth-content"><div className="auth-intro"><span className="eyebrow text-cyan-600">{eyebrow}</span><h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Your next opportunity starts with a clearer signal.</h1><p className="mt-5 max-w-md text-sm leading-7 text-slate-300">SkillBridge AI connects what you claim, what you can prove, and what to learn next.</p></div>{children}</main><footer className="auth-footer">© 2026 SkillBridge AI · Demo workspace</footer></div>; }


