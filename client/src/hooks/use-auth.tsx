import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  verifyStudentId: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem("microplace_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch(api.auth.login.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to login");
      }

      const user = await res.json();
      setUser(user);
      localStorage.setItem("microplace_user", JSON.stringify(user));
      toast({ title: "Welcome back!", description: `Logged in as ${user.name}` });
      setLocation("/");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      if (!data.email.endsWith("@priyadarshini.edu")) {
        throw new Error("Only @priyadarshini.edu emails are allowed.");
      }

      const res = await fetch(api.auth.register.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to register");
      }

      const user = await res.json();
      setUser(user);
      localStorage.setItem("microplace_user", JSON.stringify(user));
      toast({ title: "Welcome!", description: `Account created successfully.` });
      setLocation("/");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("microplace_user");
    setLocation("/auth");
    toast({ title: "Logged out", description: "See you soon!" });
  };

  const verifyStudentId = () => {
    if (user) {
      const updatedUser = { ...user, studentIdVerified: true, trustScore: Math.max(user.trustScore || 50, 60) + 35 };
      setUser(updatedUser);
      localStorage.setItem("microplace_user", JSON.stringify(updatedUser));
      toast({ title: "ID Verified!", description: "Your trust score has increased." });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, verifyStudentId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
