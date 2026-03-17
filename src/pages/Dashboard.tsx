import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Play,
  Plus,
  LogOut,
  Settings,
  Copy,
  Users,
  Clock,
  ArrowRight,
  MonitorPlay,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useRooms, useCreateRoom, useJoinRoom } from "@/hooks/useRooms";
import { toast } from "sonner";

const supportedPlatforms = [
  { name: "Netflix", color: "bg-red-500/10 text-red-400" },
  { name: "Prime Video", color: "bg-blue-500/10 text-blue-400" },
  { name: "Disney+ Hotstar", color: "bg-indigo-500/10 text-indigo-400" },
  { name: "YouTube", color: "bg-red-600/10 text-red-500" },
  { name: "HBO Max", color: "bg-purple-500/10 text-purple-400" },
  { name: "Apple TV+", color: "bg-gray-500/10 text-gray-400" },
];

export default function Dashboard() {
  const { user, profile, signOut, isLoading: authLoading } = useAuth();
  const { data: rooms, isLoading: roomsLoading } = useRooms();
  const createRoom = useCreateRoom();
  const joinRoom = useJoinRoom();
  const navigate = useNavigate();

  const [joinCode, setJoinCode] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const displayName = profile?.name || user.email?.split("@")[0] || "User";

  const handleCreateRoom = async () => {
    if (!newTitle.trim()) return;

    const room = await createRoom.mutateAsync({
      title: newTitle.trim(),
      ottUrl: newUrl.trim() || undefined,
    });

    setShowCreate(false);
    setNewTitle("");
    setNewUrl("");
    navigate(`/room/${room.id}`);
  };

  const handleJoinFromDashboard = async () => {
    if (!joinCode.trim()) return;

    try {
      const room = await joinRoom.mutateAsync(joinCode.trim());
      setJoinCode("");
      navigate(`/room/${room.id}`);
    } catch {
      // Error toast already handled inside mutation
    }
  };

  const onboardingSteps = [
    { label: "Create your account", done: true },
    { label: "Create or join a room", done: (rooms?.length || 0) > 0 },
    { label: "Install browser extension", done: false },
    { label: "Watch with friends!", done: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Play className="h-4 w-4 text-primary-foreground fill-current" />
            </div>
            <span className="text-lg font-bold">FlickCall</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/settings"
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Link>

            <button
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <LogOut className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-1">Hey, {displayName} 👋</h1>
            <p className="text-muted-foreground">Ready for a watch party?</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            <button
              onClick={() => setShowCreate(true)}
              className="glass-surface p-6 text-left hover:border-primary/30 transition-colors group"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Create Room</h3>
              <p className="text-sm text-muted-foreground">Host a new watch party</p>
            </button>

            <div className="glass-surface p-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Users className="h-5 w-5 text-primary" />
              </div>

              <h3 className="font-semibold mb-3">Join Room</h3>

              <div className="flex gap-2">
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void handleJoinFromDashboard();
                    }
                  }}
                  placeholder="Enter room code"
                  className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />

                <button
                  onClick={handleJoinFromDashboard}
                  disabled={joinRoom.isPending || !joinCode.trim()}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {joinRoom.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {showCreate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-surface p-6 mb-10"
            >
              <h3 className="font-semibold text-lg mb-4">Create a Watch Room</h3>

              <div className="space-y-3">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Room name (e.g., Friday Movie Night)"
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />

                <input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="OTT URL (optional, e.g., netflix.com/title/...)"
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleCreateRoom}
                    disabled={createRoom.isPending}
                    className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                  >
                    {createRoom.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Create Room
                  </button>

                  <button
                    onClick={() => setShowCreate(false)}
                    className="px-6 py-3 rounded-xl border border-white/10 text-sm hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Recent Rooms</h2>

            {roomsLoading ? (
              <div className="glass-surface-subtle p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              </div>
            ) : !rooms?.length ? (
              <div className="glass-surface-subtle p-12 text-center">
                <MonitorPlay className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No rooms yet. Create one to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {rooms.map((room) => (
                  <Link
                    key={room.id}
                    to={`/room/${room.id}`}
                    className="glass-surface-sm p-4 flex items-center justify-between hover:border-white/20 transition-colors block"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Play className="h-4 w-4 text-primary fill-current" />
                      </div>

                      <div>
                        <h3 className="font-medium text-sm">{room.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          {room.ott_platform && <span>{room.ott_platform}</span>}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(room.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          navigator.clipboard.writeText(room.slug);
                          toast.success("Code copied!");
                        }}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      </button>

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          room.is_active
                            ? "bg-emerald/10 text-emerald"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {room.is_active ? "Active" : "Ended"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-surface-subtle p-6">
              <h3 className="font-semibold mb-4">Getting Started</h3>
              <div className="space-y-3">
                {onboardingSteps.map((step) => (
                  <div key={step.label} className="flex items-center gap-3">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        step.done
                          ? "bg-emerald/20 text-emerald"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span
                      className={
                        step.done ? "text-foreground" : "text-muted-foreground"
                      }
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-surface-subtle p-6">
              <h3 className="font-semibold mb-4">Supported Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {supportedPlatforms.map((platform) => (
                  <span
                    key={platform.name}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${platform.color}`}
                  >
                    {platform.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}