import type {
  User,
  Profile,
  SkillEvidence,
  JobMatch,
  RoadmapItem,
  Notification,
  CareerReadinessData,
  SkillGapAnalysis,
  ImpactOption,
  AssessmentAttempt,
  AssessmentHistoryItem,
} from "../../../shared/types";

const TOKEN_KEY = "skillbridge.jwt_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const token = getStoredToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
    credentials: "include",
  });

  const json = await res.json().catch(() => ({ success: false, error: "Network response was not JSON" }));
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Request failed with status ${res.status}`);
  }
  return json.data as T;
}

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const data = await request<{ user: User; profile: Profile; token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (data.token) setStoredToken(data.token);
      return data;
    },
    register: async (name: string, email: string, password: string) => {
      const data = await request<{ user: User; token: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      if (data.token) setStoredToken(data.token);
      return data;
    },
    logout: async () => {
      setStoredToken(null);
      return request<{ message: string }>("/api/auth/logout", { method: "POST" });
    },
    me: async () => {
      return request<{ user: User; profile: Profile | null }>("/api/auth/me");
    },
    resetPassword: async (email: string, password: string) => {
      return request<{ message: string }>("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    },
  },

  profile: {
    get: () => request<Profile>("/api/profile"),
    update: (updates: Partial<Profile>) =>
      request<{ message: string }>("/api/profile", {
        method: "PUT",
        body: JSON.stringify(updates),
      }),
    onboarding: (data: any) =>
      request<{ message: string }>("/api/profile/onboarding", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  resume: {
    upload: (file?: File) => {
      const formData = new FormData();
      if (file) formData.append("resume", file);
      return request<any>("/api/resume/upload", {
        method: "POST",
        body: formData,
      });
    },
    getLatest: () => request<any>("/api/resume/latest"),
  },

  skills: {
    getPortfolio: () => request<SkillEvidence[]>("/api/skills/portfolio"),
    getGaps: () => request<SkillGapAnalysis>("/api/skills/gaps"),
    simulateImpact: () => request<ImpactOption[]>("/api/skills/simulate-impact", { method: "POST" }),
  },

  assessments: {
    getSkills: () => request<{ id: string; name: string; questionCount: number; lastScore: number | null }[]>("/api/assessments/skills"),
    start: (skill: string) =>
      request<AssessmentAttempt>("/api/assessments/start", {
        method: "POST",
        body: JSON.stringify({ skill }),
      }),
    getActive: () => request<any>("/api/assessments/active"),
    answer: (attemptId: string, questionId: string, answer: string) =>
      request<{ isCorrect: boolean; difficultyState: number }>("/api/assessments/answer", {
        method: "POST",
        body: JSON.stringify({ attemptId, questionId, answer }),
      }),
    finish: (attemptId: string) =>
      request<{ score: number; skill: string }>("/api/assessments/finish", {
        method: "POST",
        body: JSON.stringify({ attemptId }),
      }),
    getHistory: () => request<AssessmentHistoryItem[]>("/api/assessments/history"),
  },

  readiness: {
    get: () => request<CareerReadinessData>("/api/readiness"),
  },

  jobs: {
    list: () => request<JobMatch[]>("/api/jobs"),
    get: (id: string) => request<JobMatch>(`/api/jobs/${id}`),
    save: (id: string) => request<{ message: string }>(`/api/jobs/${id}/save`, { method: "POST" }),
  },

  roadmap: {
    get: () => request<RoadmapItem[]>("/api/roadmap"),
    complete: (id: string) => request<{ message: string }>(`/api/roadmap/${id}/complete`, { method: "POST" }),
  },

  analytics: {
    getOverview: () => request<any>("/api/analytics/overview"),
  },

  notifications: {
    list: () => request<Notification[]>("/api/notifications"),
    markAllRead: () => request<{ message: string }>("/api/notifications/read-all", { method: "PATCH" }),
  },

  assistant: {
    chat: (message: string) =>
      request<{ role: "ai"; text: string }>("/api/assistant/chat", {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
    getHistory: () => request<{ role: "user" | "ai"; text: string }[]>("/api/assistant/history"),
  },
};
