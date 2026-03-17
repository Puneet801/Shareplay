import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, Users, Zap, Shield, MonitorPlay, MessageSquare, Video, Wifi } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};

const features = [
  { icon: MonitorPlay, title: "Sync Playback", desc: "Host controls play, pause, and seek — everyone stays perfectly in sync." },
  { icon: MessageSquare, title: "Live Chat", desc: "React in real-time with text, emoji, and system notifications." },
  { icon: Video, title: "Video Call", desc: "Optional WebRTC audio/video so you can laugh together." },
  { icon: Shield, title: "100% Legal", desc: "No streaming, no capture. Everyone uses their own OTT account." },
  { icon: Wifi, title: "Low Latency", desc: "Sub-second sync with drift correction and heartbeat monitoring." },
  { icon: Users, title: "Room Management", desc: "Create rooms, invite friends, manage who's watching." },
];

const platforms = ["Netflix", "Prime Video", "Disney+ Hotstar", "YouTube", "HBO Max", "Apple TV+"];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Play className="h-4 w-4 text-primary-foreground fill-current" />
            </div>
            <span className="text-lg font-bold tracking-tight">FlickCall</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-card/50 backdrop-blur-sm text-sm text-muted-foreground mb-8">
            <span className="h-2 w-2 rounded-full bg-emerald animate-pulse-glow" />
            Watch parties, reimagined
          </motion.div>

          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.1] text-balance max-w-4xl mx-auto">
            Watch Together.{" "}
            <span className="gradient-text">Stay in Sync.</span>
          </motion.h1>

          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            The legal watch-party platform. Create a room, invite friends, and synchronize playback across Netflix, Prime Video, Disney+ and more — without ever re-streaming content.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup"
              className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full text-base glow-indigo hover:opacity-90 transition-all">
              Create a Room — Free
            </Link>
            <Link to="/join"
              className="px-8 py-4 border border-white/10 bg-card/50 backdrop-blur-sm text-foreground font-medium rounded-full text-base hover:bg-secondary transition-colors">
              Join with Code
            </Link>
          </motion.div>

          {/* Mock Stage */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
            className="mt-20 max-w-4xl mx-auto">
            <div className="aspect-video rounded-3xl border border-white/10 bg-gradient-to-b from-card to-background p-1 shadow-2xl glow-indigo">
              <div className="h-full w-full rounded-[22px] bg-background flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                <div className="relative z-10">
                  <div className="mb-6 h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Play className="text-primary w-10 h-10 fill-current" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">Your Watch Room</h2>
                  <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    Everyone watches on their own device. FlickCall keeps playback perfectly synchronized.
                  </p>
                  <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald" /> Synced
                    </span>
                    <span>24ms latency</span>
                    <span>4 members</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-widest mb-8">Works with your favorite platforms</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {platforms.map((p) => (
              <span key={p} className="text-lg font-semibold text-muted-foreground/60 hover:text-foreground transition-colors cursor-default">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything you need for a perfect watch party</h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">No illegal streaming. No complicated setup. Just synchronized viewing with friends.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="glass-surface p-6 hover:border-white/20 transition-colors group">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="glass-surface p-12 sm:p-16 text-center max-w-3xl mx-auto glow-indigo">
            <Zap className="h-10 w-10 text-primary mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to watch together?</h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-lg mx-auto">
              Create a room in seconds. No downloads required for the basic experience.
            </p>
            <Link to="/signup"
              className="mt-8 inline-block px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full text-base hover:opacity-90 transition-opacity">
              Start Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <Play className="h-3 w-3 text-primary-foreground fill-current" />
            </div>
            <span className="font-semibold text-sm">FlickCall Lite</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 FlickCall. No content is streamed or captured.</p>
        </div>
      </footer>
    </div>
  );
}
