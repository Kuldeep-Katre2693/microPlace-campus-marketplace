import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  Menu, 
  X, 
  PlusCircle, 
  LogOut, 
  ShieldCheck, 
  User as UserIcon,
  GraduationCap
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Browse" },
    { href: "/listings/new", label: "Sell Item" },
    { href: "/verify", label: "ID Verification" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl leading-none">MicroPlace</span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wider">CAMPUS MARKET</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
                  <div className={`w-2 h-2 rounded-full ${user.studentIdVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-xs font-medium">
                    {user.studentIdVerified ? 'Verified Student' : 'Unverified'}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                  <LogOut className="w-5 h-5" />
                </Button>
                <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm ring-2 ring-background shadow-lg">
                  {user.name.charAt(0)}
                </div>
              </div>
            ) : (
              <Link href="/auth">
                <Button className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30">
                  Login / Register
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-16 z-40 bg-background border-t p-4 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg font-medium p-2 rounded-lg ${
                    location === link.href ? "bg-secondary text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Button variant="destructive" className="w-full mt-4" onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}>
                  Logout
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="font-display font-bold text-lg">MicroPlace</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-sm mb-6">
                The official marketplace for Priyadarshini College students. 
                Buy, sell, and trade safely within your campus community.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-secondary/50 px-3 py-1 rounded w-fit">
                <span>Built by</span>
                <span className="text-primary font-bold">Team TA0020</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Marketplace</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-primary">Browse All</Link></li>
                <li><Link href="/listings/new" className="hover:text-primary">Sell Item</Link></li>
                <li><Link href="/categories" className="hover:text-primary">Categories</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Trust & Safety</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/verify" className="hover:text-primary">ID Verification</Link></li>
                <li><Link href="/guidelines" className="hover:text-primary">Meeting Zones</Link></li>
                <li><Link href="/scam-prevention" className="hover:text-primary">Scam Prevention</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© 2024 MicroPlace. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary">Privacy Policy</a>
              <a href="#" className="hover:text-primary">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
