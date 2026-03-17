
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  ott_url TEXT,
  ott_platform TEXT,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Room members table
CREATE TABLE public.room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_ready BOOLEAN NOT NULL DEFAULT false,
  is_host BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'user' CHECK (message_type IN ('user', 'system')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Playback state table (one per room)
CREATE TABLE public.playback_state (
  room_id UUID PRIMARY KEY REFERENCES public.rooms(id) ON DELETE CASCADE,
  playback_time FLOAT NOT NULL DEFAULT 0,
  is_playing BOOLEAN NOT NULL DEFAULT false,
  duration FLOAT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.playback_state ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_rooms_slug ON public.rooms(slug);
CREATE INDEX idx_rooms_host ON public.rooms(host_id);
CREATE INDEX idx_room_members_room ON public.room_members(room_id);
CREATE INDEX idx_room_members_user ON public.room_members(user_id);
CREATE INDEX idx_chat_messages_room ON public.chat_messages(room_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(room_id, created_at);

-- Helper function: check room membership (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_room_member(_room_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.room_members
    WHERE room_id = _room_id AND user_id = _user_id
  )
$$;

-- Helper function: check if user is room host
CREATE OR REPLACE FUNCTION public.is_room_host(_room_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.room_members
    WHERE room_id = _room_id AND user_id = _user_id AND is_host = true
  )
$$;

-- Trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_playback_updated_at BEFORE UPDATE ON public.playback_state FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===== RLS POLICIES =====

-- Profiles
CREATE POLICY "Anyone authenticated can read profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Rooms
CREATE POLICY "Room members can view rooms"
  ON public.rooms FOR SELECT TO authenticated
  USING (public.is_room_member(id, auth.uid()) OR host_id = auth.uid());
CREATE POLICY "Authenticated users can create rooms"
  ON public.rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Host can update room"
  ON public.rooms FOR UPDATE TO authenticated USING (public.is_room_host(id, auth.uid()));
CREATE POLICY "Host can delete room"
  ON public.rooms FOR DELETE TO authenticated USING (public.is_room_host(id, auth.uid()));

-- Room members
CREATE POLICY "Room members can view members"
  ON public.room_members FOR SELECT TO authenticated
  USING (public.is_room_member(room_id, auth.uid()));
CREATE POLICY "Authenticated users can join rooms"
  ON public.room_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can leave or host can remove"
  ON public.room_members FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_room_host(room_id, auth.uid()));

-- Chat messages
CREATE POLICY "Room members can read messages"
  ON public.chat_messages FOR SELECT TO authenticated
  USING (public.is_room_member(room_id, auth.uid()));
CREATE POLICY "Room members can send messages"
  ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND public.is_room_member(room_id, auth.uid()));

-- Playback state
CREATE POLICY "Room members can view playback"
  ON public.playback_state FOR SELECT TO authenticated
  USING (public.is_room_member(room_id, auth.uid()));
CREATE POLICY "Host can update playback"
  ON public.playback_state FOR UPDATE TO authenticated
  USING (public.is_room_host(room_id, auth.uid()));
CREATE POLICY "Host can insert playback state"
  ON public.playback_state FOR INSERT TO authenticated
  WITH CHECK (public.is_room_host(room_id, auth.uid()));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.playback_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
