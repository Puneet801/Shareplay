import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Play, ArrowRight, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useJoinRoom } from "@/hooks/useRooms";

export default function Join() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const joinRoom = useJoinRoom();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    if (!user) { navigate("/login"); return; }
    try {
      const room = await joinRoom.mutateAsync(code.trim());
      navigate(`/room/${room.id}`);
    } catch {
      // Error handled by mutation
    }
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
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-center">Join a Watch Room</h1>
          <p className="text-muted-foreground text-sm text-center mb-8">Enter the room code shared by your host</p>

          <form onSubmit={handleJoin} className="space-y-4">
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
              placeholder="Enter room code (e.g., movie-night-42)"
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 text-sm text-center font-mono tracking-wider placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <button type="submit" disabled={joinRoom.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              Join Room <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Want to host? <Link to="/dashboard" className="text-primary hover:underline">Create a room</Link>
        </p>
      </motion.div>
    </div>
  );
}
