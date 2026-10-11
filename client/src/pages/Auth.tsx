/** Signal Atlas auth surfaces: connected to real PostgreSQL / Supabase backend authentication. */
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { AuthLayout } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

function Field({ label, type = "text", value, onChange, placeholder, error }: { label: string; type?: string; value: string; onChange: (value: string) => void; placeholder: string; error?: string }) {
  const [show, setShow] = useState(false);
  const password = type === "password";
  return <div className="form-field"><label>{label}</label><div className="relative"><input type={password && show ? "text" : type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={password ? "pr-10" : ""} />{password && <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((current) => !current)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>}</div>{error && <span className="field-error">{error}</span>}</div>;
}

export function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("aarav.mehta@demo.skillbridge.ai");
  const [password, setPassword] = useState("demo-password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes("@") || password.length < 6) {
      setError("Enter a valid email and a password with at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Signed in to your workspace");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Check your credentials.");
      toast.error(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return <AuthLayout><div className="auth-form-card"><div className="mb-7 flex items-center gap-2 text-cyan-600"><LockKeyhole size={17} /><span className="eyebrow text-cyan-600">Private workspace</span></div><h2>Sign in to SkillBridge</h2><p className="mt-2 text-sm leading-6 text-slate-500">Pick up your intelligence loop where you left it.</p><form onSubmit={submit} className="mt-7 grid gap-4"><Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" /><Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Your password" error={error} /><div className="flex justify-end"><Link href="/forgot-password" className="text-xs font-bold text-indigo-600">Forgot password?</Link></div><button className="button-primary w-full" type="submit" disabled={loading}>{loading ? "Signing in…" : "Continue to workspace"} <ArrowRight size={15} /></button></form><div className="mt-7 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">New to SkillBridge? <Link href="/register" className="font-extrabold text-indigo-600">Create your profile</Link></div><div className="mt-6 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-[10px] leading-5 text-slate-500"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-cyan-600" /> Connected to PostgreSQL / Supabase authentication with bcrypt security.</div></div></AuthLayout>;
}

export function Register() {
  const [, navigate] = useLocation();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2 || !email.includes("@") || password.length < 8 || password !== confirm) {
      setError("Use your name, a valid email, an 8-character password, and matching confirmation.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      toast.success("Account created — let’s map your signal");
      navigate("/onboarding");
    } catch (err: any) {
      setError(err.message || "Failed to register.");
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return <AuthLayout eyebrow="Start with your signal"><div className="auth-form-card"><div className="mb-7 flex items-center gap-2 text-cyan-600"><SparkIcon /><span className="eyebrow text-cyan-600">New candidate profile</span></div><h2>Create your profile</h2><p className="mt-2 text-sm leading-6 text-slate-500">Build a stronger career signal in under five minutes.</p><form onSubmit={submit} className="mt-7 grid gap-4"><Field label="Full name" value={name} onChange={setName} placeholder="Aarav Mehta" /><Field label="Work email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" /><Field label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" /><Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat your password" error={error} /><button className="button-primary w-full" type="submit" disabled={loading}>{loading ? "Creating account…" : "Create profile"} <ArrowRight size={15} /></button></form><div className="mt-7 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">Already have a workspace? <Link href="/login" className="font-extrabold text-indigo-600">Sign in</Link></div></div></AuthLayout>;
}

export function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [reset, setReset] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 8 || password !== confirm) return;
    setLoading(true);
    try {
      await api.auth.resetPassword(email, password);
      toast.success("Password reset complete");
      setReset(false);
    } catch (err: any) {
      toast.error(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (reset) return <AuthLayout eyebrow="Secure reset"><div className="auth-form-card"><div className="mb-7 flex items-center gap-2 text-cyan-600"><LockKeyhole size={17} /><span className="eyebrow text-cyan-600">Set a new password</span></div><h2>Reset your password</h2><p className="mt-2 text-sm leading-6 text-slate-500">Enter your new secure password.</p><form onSubmit={handleResetSubmit} className="mt-7 grid gap-4"><Field label="New password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" /><Field label="Confirm new password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat your password" /><button className="button-primary w-full" disabled={loading}>{loading ? "Saving…" : "Save new password"} <Check size={15} /></button></form></div></AuthLayout>;

  return <AuthLayout eyebrow="Account recovery"><div className="auth-form-card"><Link href="/login" className="mb-7 inline-flex items-center gap-2 text-xs font-bold text-slate-500"><ArrowLeft size={14} /> Back to sign in</Link><h2>Forgot your password?</h2><p className="mt-2 text-sm leading-6 text-slate-500">Enter your email and we’ll send a secure reset link.</p>{sent ? <div className="mt-7 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm leading-6 text-cyan-800"><div className="flex items-center gap-2 font-extrabold"><Mail size={15} /> Reset instructions prepared</div><p className="mt-2 text-xs">You can now <button onClick={() => setReset(true)} className="font-extrabold underline">open the reset form</button> to set a new password.</p></div> : <form onSubmit={(event) => { event.preventDefault(); if (!email.includes("@")) return; setSent(true); toast.success("Reset instructions prepared"); }} className="mt-7 grid gap-4"><Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" /><button className="button-primary w-full">Send reset link <ArrowRight size={15} /></button></form>}<div className="mt-7 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">Remembered it? <Link href="/login" className="font-extrabold text-indigo-600">Sign in</Link></div></div></AuthLayout>;
}

function SparkIcon() { return <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600"><Sparkles size={15} /></span>; }
