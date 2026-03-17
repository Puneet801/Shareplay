CREATE POLICY "Authenticated users can view public rooms for joining"
  ON public.rooms
  FOR SELECT
  TO authenticated
  USING (
    is_private = false
    OR public.is_room_member(id, auth.uid())
    OR host_id = auth.uid()
  );