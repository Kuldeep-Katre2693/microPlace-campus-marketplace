import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GraduationCap, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const { login, isLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      await login(email);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-primary p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center" />
        <div className="relative z-10 max-w-lg text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display font-bold text-5xl mb-6">Priyadarshini College</h1>
          <p className="text-xl opacity-90 leading-relaxed">
            Welcome to MicroPlace. The safe, student-only marketplace for buying and selling gear on campus.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-2xl shadow-primary/5">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-display font-bold">Student Login</CardTitle>
              <CardDescription>
                Enter your college email to access the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="student@priyadarshini.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    * Must use a valid .edu domain
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <>
                      Continue <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t p-6">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our Terms of Service and Campus Code of Conduct.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
