import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithGoogle, user } = useAuth();

  if (user) { navigate("/dashboard", { replace: true }); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Email and password are required"); return; }
    const { error } = await signUpWithEmail(email, password, name || email.split("@")[0]);
    if (error) { toast.error(error.message); return; }
    toast.success("Account created! Check your email to confirm, or sign in.");
    navigate("/login");
  };

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md relative">
        <Link to="/" className="flex items-center gap-2 mb-10 justify-center">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Play className="h-4 w-4 text-primary-foreground fill-current" />
          </div>
          <span className="text-lg font-bold">FlickCall</span>
        </Link>

        <div className="glass-surface p-8">
          <h1 className="text-2xl font-bold mb-2 text-center">Create your account</h1>
          <p className="text-muted-foreground text-sm text-center mb-8">Start hosting watch parties in seconds</p>

          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-secondary hover:bg-surface-hover transition-colors text-sm font-medium mb-6">
            <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center"><span className="px-3 bg-card text-muted-foreground text-xs">or sign up with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com"
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 characters)"
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <button type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
              Create Account <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
