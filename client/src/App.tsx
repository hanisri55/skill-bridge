/** Signal Atlas route map: complete product flow with no dead-end placeholder pages. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import { ForgotPassword, Login, Register } from "./pages/Auth";
import { Assessment, AssessmentResults } from "./pages/Assessment";
import { Analytics, Assistant, CareerReadiness, Dashboard, JobDetail, JobMarket, Jobs, Notifications, Onboarding, Profile, ResumeAnalysis, Settings, SkillGaps, SkillImpact, Skills, Roadmap } from "./pages/WorkspacePages";

function Router() {
  return <Switch>
    <Route path="/" component={Landing} />
    <Route path="/login" component={Login} />
    <Route path="/register" component={Register} />
    <Route path="/forgot-password" component={ForgotPassword} />
    <Route path="/reset-password" component={ForgotPassword} />
    <Route path="/onboarding" component={Onboarding} />
    <Route path="/dashboard" component={Dashboard} />
    <Route path="/profile" component={Profile} />
    <Route path="/resume-analysis" component={ResumeAnalysis} />
    <Route path="/assessment/results" component={AssessmentResults} />
    <Route path="/assessment" component={Assessment} />
    <Route path="/skills" component={Skills} />
    <Route path="/skill-gaps" component={SkillGaps} />
    <Route path="/jobs/:id" component={JobDetail} />
    <Route path="/jobs" component={Jobs} />
    <Route path="/career-readiness" component={CareerReadiness} />
    <Route path="/skill-impact" component={SkillImpact} />
    <Route path="/roadmap" component={Roadmap} />
    <Route path="/analytics" component={Analytics} />
    <Route path="/job-market" component={JobMarket} />
    <Route path="/assistant" component={Assistant} />
    <Route path="/notifications" component={Notifications} />
    <Route path="/settings" component={Settings} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><AuthProvider><TooltipProvider><Toaster /><Router /></TooltipProvider></AuthProvider></ThemeProvider></ErrorBoundary>;
}
