import { Link, useNavigate } from "react-router-dom";
import { Play, ArrowLeft, User, Bell, Shield, Monitor, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export default function SettingsPage() {
  const { user, profile, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.name || "");

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) { navigate("/login"); return null; }

  const handleSaveName = async () => {
    const { error } = await supabase.from("profiles").update({ name }).eq("id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Name updated!");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center gap-4 px-6">
          <Link to="/dashboard" className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Play className="h-4 w-4 text-primary-foreground fill-current" />
            </div>
            <span className="text-lg font-bold">Settings</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-surface p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Profile</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Name</label>
                <div className="flex gap-2">
                  <input value={name} onChange={(e) => setName(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-secondary border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  <button onClick={handleSaveName}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity">Save</button>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Email</label>
                <input defaultValue={user.email || ""} disabled
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-white/10 text-sm text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="glass-surface p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Notifications</h2>
            </div>
            <div className="space-y-3">
              {["Room invites", "Sync alerts", "Chat mentions"].map((item) => (
                <label key={item} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm">{item}</span>
                  <div className="h-6 w-10 bg-primary rounded-full relative">
                    <div className="h-4 w-4 bg-primary-foreground rounded-full absolute top-1 right-1" />
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="glass-surface p-6">
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Browser Extension</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Install the FlickCall companion extension for automatic playback sync detection.</p>
            <button className="px-4 py-2 rounded-xl bg-secondary border border-white/10 text-sm hover:bg-surface-hover transition-colors">
              Download Extension (Coming Soon)
            </button>
          </div>

          <div className="glass-surface p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Privacy & Security</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-2">FlickCall never captures, streams, or stores copyrighted video content. All playback happens locally on each user's device.</p>
            <button onClick={async () => { await signOut(); navigate("/"); }}
              className="mt-4 px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-sm hover:bg-destructive/20 transition-colors">
              Sign Out
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
