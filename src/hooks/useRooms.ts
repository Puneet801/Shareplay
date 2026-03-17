import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

function detectPlatform(url: string): string {
  if (url.includes("netflix")) return "Netflix";
  if (url.includes("primevideo") || url.includes("amazon")) return "Prime Video";
  if (url.includes("disney") || url.includes("hotstar")) return "Disney+ Hotstar";
  if (url.includes("youtube")) return "YouTube";
  if (url.includes("hbo")) return "HBO Max";
  if (url.includes("apple")) return "Apple TV+";
  return "Other";
}

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 6);
}

export function useRooms() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["rooms", user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Get rooms where user is a member
      const { data: memberRooms } = await supabase
        .from("room_members")
        .select("room_id")
        .eq("user_id", user.id);
      
      const roomIds = memberRooms?.map((m) => m.room_id) || [];
      if (roomIds.length === 0) return [];

      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .in("id", roomIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useRoom(roomId: string | undefined) {
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      if (!roomId) return null;
      // Try by ID first, then by slug
      let { data, error } = await supabase.from("rooms").select("*").eq("id", roomId).maybeSingle();
      if (!data) {
        ({ data, error } = await supabase.from("rooms").select("*").eq("slug", roomId).maybeSingle());
      }
      if (error) throw error;
      return data;
    },
    enabled: !!roomId,
  });
}

export function useRoomMembers(roomId: string | undefined) {
  return useQuery({
    queryKey: ["room-members", roomId],
    queryFn: async () => {
      if (!roomId) return [];
      const { data, error } = await supabase
        .from("room_members")
        .select("*, profiles(name, avatar_url)")
        .eq("room_id", roomId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!roomId,
  });
}

export function useCreateRoom() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, ottUrl }: { title: string; ottUrl?: string }) => {
      if (!user) throw new Error("Not authenticated");
      
      const slug = generateSlug(title);
      const platform = ottUrl ? detectPlatform(ottUrl) : null;

      // Create room
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .insert({ title, slug, ott_url: ottUrl || null, ott_platform: platform, host_id: user.id })
        .select()
        .single();
      if (roomError) throw roomError;

      // Add host as member
      const { error: memberError } = await supabase
        .from("room_members")
        .insert({ room_id: room.id, user_id: user.id, is_host: true, is_ready: true });
      if (memberError) throw memberError;

      // Create playback state
      const { error: pbError } = await supabase
        .from("playback_state")
        .insert({ room_id: room.id });
      if (pbError) throw pbError;

      return room;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Room created!");
    },
    onError: (err) => toast.error("Failed to create room: " + err.message),
  });
}

export function useJoinRoom() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (roomIdOrSlug: string) => {
      if (!user) throw new Error("Not authenticated");

      // Find room by ID or slug
      let { data: room } = await supabase.from("rooms").select("id").eq("id", roomIdOrSlug).maybeSingle();
      if (!room) {
        ({ data: room } = await supabase.from("rooms").select("id").eq("slug", roomIdOrSlug).maybeSingle());
      }
      if (!room) throw new Error("Room not found");

      // Join as member
      const { error } = await supabase
        .from("room_members")
        .insert({ room_id: room.id, user_id: user.id })
        .select()
        .single();

      // Ignore duplicate key error (already a member)
      if (error && !error.message.includes("duplicate")) throw error;
      return room;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useLeaveRoom() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("room_members")
        .delete()
        .eq("room_id", roomId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rooms"] });
      toast.info("Left room");
    },
  });
}
