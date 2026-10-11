/** Signal Atlas persistence adapter: local-only now, intentionally shaped like a replaceable repository later. */
import { assessmentHistory as seedHistory, demoProfile } from "@/data/mockData";
import type { AssessmentAttempt, AssessmentHistoryItem, Profile } from "@/data/types";

const keys = {
  profile: "skillbridge.profile",
  attempts: "skillbridge.attempts",
  history: "skillbridge.history",
  onboarding: "skillbridge.onboarding.complete",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getProfile(): Profile { return read(keys.profile, demoProfile); }
export function saveProfile(profile: Profile): void { write(keys.profile, profile); }

export function getAttempts(): AssessmentAttempt[] { return read<AssessmentAttempt[]>(keys.attempts, []); }
export function saveAttempts(attempts: AssessmentAttempt[]): void { write(keys.attempts, attempts); }
export function getActiveAttempt(): AssessmentAttempt | undefined { return getAttempts().find((attempt) => attempt.status === "active"); }
export function saveAttempt(attempt: AssessmentAttempt): void {
  const attempts = getAttempts().filter((item) => item.attemptId !== attempt.attemptId);
  saveAttempts([attempt, ...attempts]);
}

export function getHistory(): AssessmentHistoryItem[] {
  return read<AssessmentHistoryItem[]>(keys.history, seedHistory);
}
export function saveHistory(history: AssessmentHistoryItem[]): void { write(keys.history, history); }
export function isOnboardingComplete(): boolean { return read(keys.onboarding, true); }
export function completeOnboarding(): void { write(keys.onboarding, true); }

export function resetDemoState(): void {
  Object.values(keys).forEach((key) => localStorage.removeItem(key));
}
