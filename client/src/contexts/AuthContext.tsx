import React, { createContext, useContext, useEffect, useState } from "react";
import { api, getStoredToken } from "@/lib/api";
import type { User, Profile } from "../../../shared/types";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const p = await api.profile.get();
      setProfile(p);
    } catch {
      // Ignored if offline or unauthenticated
    }
  };

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await api.auth.me();
        setUser(res.user);
        setProfile(res.profile);
      } catch {
        setUser(null);
        // If not logged in, profile can still fetch default profile for preview
        refreshProfile();
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.auth.login(email, password);
    setUser(data.user);
    setProfile(data.profile);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.auth.register(name, email, password);
    setUser(data.user);
    await refreshProfile();
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
