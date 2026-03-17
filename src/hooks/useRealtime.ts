import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useChatMessages(roomId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["chat-messages", roomId],
    queryFn: async () => {
      if (!roomId) return [];
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*, profiles(name, avatar_url)")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    enabled: !!roomId,
  });

  // Subscribe to new messages via Realtime
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`chat:${roomId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `room_id=eq.${roomId}`,
      }, () => {
        qc.invalidateQueries({ queryKey: ["chat-messages", roomId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, qc]);

  return query;
}

export function useSendMessage() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ roomId, content, messageType = "user" }: { roomId: string; content: string; messageType?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("chat_messages")
        .insert({ room_id: roomId, sender_id: user.id, content, message_type: messageType });
      if (error) throw error;
    },
  });
}

export function usePlaybackState(roomId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["playback", roomId],
    queryFn: async () => {
      if (!roomId) return null;
      const { data, error } = await supabase
        .from("playback_state")
        .select("*")
        .eq("room_id", roomId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!roomId,
  });

  // Subscribe to playback changes via Realtime
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`playback:${roomId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "playback_state",
        filter: `room_id=eq.${roomId}`,
      }, () => {
        qc.invalidateQueries({ queryKey: ["playback", roomId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, qc]);

  return query;
}

export function useUpdatePlayback() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, ...update }: { roomId: string; playback_time?: number; is_playing?: boolean; duration?: number }) => {
      const { error } = await supabase
        .from("playback_state")
        .update(update)
        .eq("room_id", roomId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["playback", vars.roomId] });
    },
  });
}

export function useRealtimeMembers(roomId: string | undefined) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`members:${roomId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "room_members",
        filter: `room_id=eq.${roomId}`,
      }, () => {
        qc.invalidateQueries({ queryKey: ["room-members", roomId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, qc]);
}
