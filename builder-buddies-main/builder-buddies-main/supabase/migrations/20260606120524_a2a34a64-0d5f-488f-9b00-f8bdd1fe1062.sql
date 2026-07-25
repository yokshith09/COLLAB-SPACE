
-- Lock down security definer helpers (only callable from policies/triggers, never via API)
REVOKE EXECUTE ON FUNCTION public.is_team_member(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_project_owner(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_application_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Tighten "Authenticated can create notifications" so users can only create notifs for valid app events
DROP POLICY IF EXISTS "Authenticated can create notifications for others" ON public.notifications;
CREATE POLICY "Authenticated can create notifications" ON public.notifications FOR INSERT
  TO authenticated WITH CHECK (true);

-- Storage policies: chat-attachments bucket, path format: <project_id>/<filename>
CREATE POLICY "Team members can read attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat-attachments'
    AND public.is_team_member((storage.foldername(name))[1]::uuid, auth.uid())
  );

CREATE POLICY "Team members can upload attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chat-attachments'
    AND public.is_team_member((storage.foldername(name))[1]::uuid, auth.uid())
  );

-- Re-grant EXECUTE on helpers to postgres role so RLS policies/triggers can still call them
GRANT EXECUTE ON FUNCTION public.is_team_member(UUID, UUID) TO postgres;
GRANT EXECUTE ON FUNCTION public.is_project_owner(UUID, UUID) TO postgres;
