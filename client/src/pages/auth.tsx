import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Loader2, GraduationCap, UploadCloud } from "lucide-react";

export default function AuthPage() {
  const { login, register, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [studentIdImage, setStudentIdImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudentIdImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login({ email, password });
    } else {
      await register({ name, email, password, studentIdImage });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
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

      <div className="flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-2xl shadow-primary/5">
            <CardHeader className="text-center pb-8">
              <CardTitle className="font-display text-2xl mb-2">MicroPlace Campus</CardTitle>
              <CardDescription className="text-base">
                {isLogin ? "Sign in to your account" : "Create a new student account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        placeholder="Aditya Sharma" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentIdImage">Student ID Card</Label>
                      <div className="relative">
                        <Input 
                          id="studentIdImage" 
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          required
                        />
                        <Label 
                          htmlFor="studentIdImage"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors border-muted-foreground/25"
                        >
                          {studentIdImage ? (
                            <img src={studentIdImage} alt="ID Preview" className="h-full w-full object-contain p-2" />
                          ) : (
                            <>
                              <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                              <span className="text-sm text-muted-foreground">Upload Student ID</span>
                            </>
                          )}
                        </Label>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="student@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full h-11 text-lg mt-6" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (isLogin ? "Sign In" : "Create Account")}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t p-4 bg-muted/10">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button" 
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-medium text-primary hover:underline"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
