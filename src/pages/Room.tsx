import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Play, Pause, SkipForward, Copy, LogOut, Send, Smile, Users, Wifi, WifiOff, Mic, MicOff, VideoIcon, VideoOff, Phone, PhoneOff, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useRoom, useRoomMembers, useJoinRoom } from "@/hooks/useRooms";
import { useChatMessages, useSendMessage, usePlaybackState, useUpdatePlayback, useRealtimeMembers } from "@/hooks/useRealtime";
import { toast } from "sonner";
import type { SyncStatus } from "@/types";

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}` : `${m}:${s.toString().padStart(2, "0")}`;
}

function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const config = {
    perfect: { label: "Perfect Sync", icon: CheckCircle2, cls: "text-emerald bg-emerald/10" },
    good: { label: "In Sync", icon: Wifi, cls: "text-emerald bg-emerald/10" },
    drifting: { label: "Drifting", icon: AlertCircle, cls: "text-amber bg-amber/10" },
    disconnected: { label: "Disconnected", icon: WifiOff, cls: "text-destructive bg-destructive/10" },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.cls}`}>
      <c.icon className="h-3 w-3" /> {c.label}
    </span>
  );
}

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { data: room, isLoading: roomLoading } = useRoom(roomId);
  const { data: members } = useRoomMembers(room?.id);
  const { data: chatMessages } = useChatMessages(room?.id);
  const { data: playback } = usePlaybackState(room?.id);
  const sendMessage = useSendMessage();
  const updatePlayback = useUpdatePlayback();
  const joinRoom = useJoinRoom();
  useRealtimeMembers(room?.id);

  const [chatInput, setChatInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isHost = room?.host_id === user?.id;
  const isMember = members?.some((m) => m.user_id === user?.id);
  const syncStatus: SyncStatus = "perfect";
  const currentPlaybackTime = playback?.playback_time || 0;
  const duration = playback?.duration || 7200;
  const isPlaying = playback?.is_playing || false;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Auto-join room if not a member
  useEffect(() => {
    if (user && room && !isMember && !hasJoined && !joinRoom.isPending) {
      setHasJoined(true);
      joinRoom.mutate(room.id);
    }
  }, [user, room, isMember, hasJoined, joinRoom]);

  if (authLoading || roomLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) { navigate("/login"); return null; }

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Room not found</h2>
          <p className="text-muted-foreground mb-4">This room doesn't exist or you don't have access.</p>
          <Link to="/dashboard" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if (!chatInput.trim() || !room) return;
    sendMessage.mutate({ roomId: room.id, content: chatInput });
    setChatInput("");
  };

  const handlePlay = () => {
    if (!room) return;
    updatePlayback.mutate({ roomId: room.id, is_playing: !isPlaying });
    sendMessage.mutate({ roomId: room.id, content: isPlaying ? "Host paused playback" : "Host resumed playback", messageType: "system" });
    toast.success(isPlaying ? "Paused" : "Playing");
  };

  const handleSeek = (offset: number) => {
    if (!room) return;
    updatePlayback.mutate({ roomId: room.id, playback_time: Math.max(0, currentPlaybackTime + offset) });
    toast.info(`Seeked ${offset > 0 ? "+" : ""}${offset}s`);
  };

  const handleResync = () => {
    if (!room) return;
    sendMessage.mutate({ roomId: room.id, content: "Host triggered resync for all members", messageType: "system" });
    toast.success("All members re-synced");
  };

  const emojis = ["😂", "🔥", "❤️", "👏", "😮", "🎬", "🍿", "💀"];

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-white/5 bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 mr-2">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
              <Play className="h-3.5 w-3.5 text-primary-foreground fill-current" />
            </div>
          </Link>
          <div>
            <h1 className="text-sm font-semibold leading-tight">{room.title}</h1>
            <p className="text-xs text-muted-foreground">{room.ott_platform || "No platform set"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SyncStatusBadge status={syncStatus} />
          <button onClick={() => { navigator.clipboard.writeText(room.slug); toast.success("Invite code copied!"); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs hover:bg-secondary transition-colors">
            <Copy className="h-3 w-3" /> Invite
          </button>
          <button onClick={() => navigate("/dashboard")}
            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
            <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Stage */}
        <section className="relative flex flex-1 flex-col items-center justify-center p-6 lg:p-8">
          <div className="max-w-2xl w-full space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="aspect-video rounded-3xl border border-white/10 bg-gradient-to-b from-card to-background p-1 shadow-2xl">
              <div className="h-full w-full rounded-[22px] bg-background flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                <div className="relative z-10">
                  <div className="mb-4 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    {isPlaying ? (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map((i) => (
                          <motion.div key={i} className="w-1 bg-primary rounded-full"
                            animate={{ height: [8, 20, 8] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
                        ))}
                      </div>
                    ) : (
                      <Play className="text-primary w-8 h-8 fill-current" />
                    )}
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    {isPlaying ? "Watching Together" : "Ready to Watch"}
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm max-w-sm mx-auto">
                    {room.ott_url ? "Content is playing on each member's device" : "Set a title URL to get started"}
                  </p>
                  {room.ott_url && (
                    <a href={room.ott_url} target="_blank" rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-sm hover:bg-surface-hover transition-colors">
                      <ExternalLink className="h-3.5 w-3.5" /> Open on {room.ott_platform}
                    </a>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-3 gap-3">
              <div className="glass-surface-sm p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Sync</p>
                <p className="text-sm font-semibold text-emerald">Perfect</p>
              </div>
              <div className="glass-surface-sm p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Latency</p>
                <p className="text-sm font-semibold">24ms</p>
              </div>
              <div className="glass-surface-sm p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Members</p>
                <p className="text-sm font-semibold">{members?.length || 0} joined</p>
              </div>
            </div>

            {inCall && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex gap-3 justify-center">
                {members?.slice(0, 4).map((m) => {
                  const memberProfile = m.profiles as unknown as { name: string; avatar_url: string | null } | null;
                  return (
                    <div key={m.id} className="glass-surface-sm w-20 h-20 flex flex-col items-center justify-center">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary mb-1">
                        {(memberProfile?.name || "?").charAt(0)}
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[70px]">{(memberProfile?.name || "User").split(" ")[0]}</span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </section>

        {/* Chat Sidebar */}
        <aside className="w-80 border-l border-white/5 bg-card/30 backdrop-blur-md flex flex-col shrink-0 hidden lg:flex">
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Members</h3>
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {members?.map((m) => {
                const memberProfile = m.profiles as unknown as { name: string; avatar_url: string | null } | null;
                return (
                  <div key={m.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary">
                        {(memberProfile?.name || "?").charAt(0)}
                      </div>
                      <span className="text-sm">{memberProfile?.name || "User"}</span>
                      {m.is_host && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">Host</span>}
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {(!chatMessages || chatMessages.length === 0) && (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">No messages yet. Say hello! 👋</p>
              </div>
            )}
            <AnimatePresence>
              {chatMessages?.map((msg) => {
                const senderProfile = msg.profiles as unknown as { name: string; avatar_url: string | null } | null;
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={msg.message_type === "system" ? "text-center" : ""}>
                    {msg.message_type === "system" ? (
                      <span className="text-xs text-muted-foreground italic">{msg.content}</span>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-xs font-medium text-primary">{senderProfile?.name || "User"}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-white/5">
            {showEmoji && (
              <div className="flex gap-1 mb-2 flex-wrap">
                {emojis.map((e) => (
                  <button key={e} onClick={() => setChatInput((p) => p + e)} className="text-lg hover:scale-125 transition-transform p-1">{e}</button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 rounded-lg hover:bg-secondary transition-colors shrink-0">
                <Smile className="h-4 w-4 text-muted-foreground" />
              </button>
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
              <button onClick={handleSend} className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity shrink-0">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Controls */}
      <footer className="h-16 border-t border-white/5 bg-card/50 backdrop-blur-xl px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-muted-foreground">
            {formatTime(currentPlaybackTime)} / {formatTime(duration)}
          </span>
          <div className="w-48 h-1.5 bg-secondary rounded-full overflow-hidden hidden sm:block">
            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(currentPlaybackTime / duration) * 100}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isHost && (
            <>
              <button onClick={() => handleSeek(-10)} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Back 10s">
                <SkipForward className="h-4 w-4 text-muted-foreground rotate-180" />
              </button>
              <button onClick={handlePlay}
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
              </button>
              <button onClick={() => handleSeek(10)} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Forward 10s">
                <SkipForward className="h-4 w-4 text-muted-foreground" />
              </button>
              <button onClick={handleResync} className="ml-2 px-3 py-1.5 rounded-lg border border-white/10 text-xs hover:bg-secondary transition-colors flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3" /> Resync All
              </button>
            </>
          )}
          {!isHost && (
            <span className="text-xs text-muted-foreground">Host controls playback</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {inCall ? (
            <>
              <button onClick={() => setMicOn(!micOn)} className={`p-2 rounded-lg transition-colors ${micOn ? "hover:bg-secondary" : "bg-destructive/10"}`}>
                {micOn ? <Mic className="h-4 w-4 text-muted-foreground" /> : <MicOff className="h-4 w-4 text-destructive" />}
              </button>
              <button onClick={() => setCamOn(!camOn)} className={`p-2 rounded-lg transition-colors ${camOn ? "hover:bg-secondary" : "bg-destructive/10"}`}>
                {camOn ? <VideoIcon className="h-4 w-4 text-muted-foreground" /> : <VideoOff className="h-4 w-4 text-destructive" />}
              </button>
              <button onClick={() => setInCall(false)} className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors">
                <PhoneOff className="h-4 w-4 text-destructive" />
              </button>
            </>
          ) : (
            <button onClick={() => { setInCall(true); toast.success("Joined voice call"); }}
              className="px-3 py-1.5 rounded-lg border border-white/10 text-xs hover:bg-secondary transition-colors flex items-center gap-1.5">
              <Phone className="h-3 w-3" /> Join Call
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
