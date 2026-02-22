import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Mock user for Hackathon
const MOCK_USER: User = {
  id: 1,
  clerkId: "user_mock_123",
  name: "Aditya Sharma",
  email: "aditya.s@priyadarshini.edu",
  studentId: "2024CS001",
  studentIdVerified: false, // Initially false to show verification flow
  trustScore: 85,
  totalTransactions: 12,
  rating: "4.8",
  createdAt: new Date(),
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
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
    // Simulate checking session
    const storedUser = localStorage.getItem("microplace_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!email.endsWith("@priyadarshini.edu")) {
      toast({
        title: "Access Denied",
        description: "Only @priyadarshini.edu emails are allowed.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    const newUser = { ...MOCK_USER, email };
    setUser(newUser);
    localStorage.setItem("microplace_user", JSON.stringify(newUser));
    setIsLoading(false);
    toast({
      title: "Welcome back!",
      description: `Logged in as ${newUser.name}`,
    });
    setLocation("/");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("microplace_user");
    setLocation("/auth");
    toast({
      title: "Logged out",
      description: "See you soon!",
    });
  };

  const verifyStudentId = () => {
    if (user) {
      const updatedUser = { ...user, studentIdVerified: true, trustScore: 95 };
      setUser(updatedUser);
      localStorage.setItem("microplace_user", JSON.stringify(updatedUser));
      toast({
        title: "ID Verified!",
        description: "Your trust score has increased to 95.",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, verifyStudentId }}>
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
