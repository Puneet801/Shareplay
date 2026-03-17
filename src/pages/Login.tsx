import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { signInWithEmail, signInWithPassword, signInWithGoogle, user } = useAuth();

  // Redirect if already logged in
  if (user) { navigate("/dashboard", { replace: true }); return null; }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    const { error } = await signInWithPassword(email, password);
    if (error) { toast.error(error.message); return; }
    navigate("/dashboard");
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const { error } = await signInWithEmail(email);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    toast.success("Magic link sent! Check your email.");
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
          <h1 className="text-2xl font-bold mb-2 text-center">Welcome back</h1>
          <p className="text-muted-foreground text-sm text-center mb-8">Sign in to your account</p>

          {sent ? (
            <div className="text-center py-4">
              <div className="h-12 w-12 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-emerald" />
              </div>
              <p className="font-medium">Check your email!</p>
              <p className="text-sm text-muted-foreground mt-1">We sent a magic link to {email}</p>
            </div>
          ) : (
            <>
              <button onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-secondary hover:bg-surface-hover transition-colors text-sm font-medium mb-6">
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                <div className="relative flex justify-center"><span className="px-3 bg-card text-muted-foreground text-xs">or continue with email</span></div>
              </div>

              {/* Toggle */}
              <div className="flex gap-2 mb-4">
                <button onClick={() => setMode("password")}
                  className={`flex-1 text-xs py-2 rounded-lg transition-colors ${mode === "password" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  Password
                </button>
                <button onClick={() => setMode("magic")}
                  className={`flex-1 text-xs py-2 rounded-lg transition-colors ${mode === "magic" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  Magic Link
                </button>
              </div>

              <form onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink} className="space-y-4">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                {mode === "password" && (
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                )}
                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
                  {mode === "password" ? "Sign In" : "Send Magic Link"} <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
