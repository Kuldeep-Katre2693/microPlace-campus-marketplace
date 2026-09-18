import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useLocation } from "wouter";
import { PublicUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";

interface AuthContextType {
  user: PublicUser | null;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; studentIdImage?: string | null }) => Promise<void>;
  logout: () => Promise<void>;
  verifyStudentId: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const refetchUser = useCallback(async () => {
    try {
      const res = await fetch(api.auth.me.path, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const userData: PublicUser = await res.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch current user session:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  const login = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await fetch(api.auth.login.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to login" }));
        throw new Error(error.message || "Invalid credentials");
      }

      const loggedInUser: PublicUser = await res.json();
      setUser(loggedInUser);
      toast({ title: "Welcome back!", description: `Logged in as ${loggedInUser.name}` });
      setLocation("/");
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message || "Invalid credentials", variant: "destructive" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; studentIdImage?: string | null }) => {
    setIsLoading(true);
    try {
      const res = await fetch(api.auth.register.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to register" }));
        throw new Error(error.message || "Registration failed");
      }

      const registeredUser: PublicUser = await res.json();
      setUser(registeredUser);
      toast({ title: "Welcome!", description: "Account created successfully." });
      setLocation("/");
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message || "Please check your inputs", variant: "destructive" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(api.auth.logout.path, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setLocation("/auth");
      toast({ title: "Logged out", description: "See you soon!" });
    }
  };

  const verifyStudentId = async () => {
    try {
      const res = await fetch(api.auth.verifyId.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Verification failed" }));
        throw new Error(err.message || "Verification failed");
      }

      setUser((prev) => (prev ? { ...prev, studentIdVerified: true, trustScore: 95 } : null));
      toast({ title: "ID Verified!", description: "Your student badge and trust score have been updated." });
    } catch (error: any) {
      toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, verifyStudentId, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
