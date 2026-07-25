
-- Enums
CREATE TYPE public.project_status AS ENUM ('OPEN','FULL','ACTIVE','COMPLETED','CANCELLED');
CREATE TYPE public.app_status AS ENUM ('PENDING','ACCEPTED','REJECTED','EXPIRED');
CREATE TYPE public.task_status AS ENUM ('TODO','IN_PROGRESS','DONE');

-- updated_at trigger fn
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  bio TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  domains TEXT[] NOT NULL DEFAULT '{}',
  last_login_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  team_size_max INTEGER NOT NULL DEFAULT 5,
  status public.project_status NOT NULL DEFAULT 'OPEN',
  deadline TIMESTAMPTZ,
  is_private BOOLEAN NOT NULL DEFAULT false,
  invite_code TEXT UNIQUE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- team_members
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, project_id)
);
GRANT SELECT ON public.team_members TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- helpers (security definer to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_team_member(_project_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.team_members WHERE project_id = _project_id AND user_id = _user_id);
$$;
CREATE OR REPLACE FUNCTION public.is_project_owner(_project_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.projects WHERE id = _project_id AND owner_id = _user_id);
$$;

-- project policies
CREATE POLICY "Public projects readable, private to members" ON public.projects FOR SELECT
  USING (NOT is_private OR public.is_team_member(id, auth.uid()) OR owner_id = auth.uid());
CREATE POLICY "Authenticated can create own projects" ON public.projects FOR INSERT
  TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner can update project" ON public.projects FOR UPDATE
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner can delete project" ON public.projects FOR DELETE
  USING (owner_id = auth.uid());

-- team_members policies
CREATE POLICY "Team rosters are public" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Owner can add team members" ON public.team_members FOR INSERT
  TO authenticated WITH CHECK (public.is_project_owner(project_id, auth.uid()));
CREATE POLICY "Owner or self can remove team members" ON public.team_members FOR DELETE
  USING (public.is_project_owner(project_id, auth.uid()) OR user_id = auth.uid());

-- applications
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status public.app_status NOT NULL DEFAULT 'PENDING',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, project_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applicant or project owner can read" ON public.applications FOR SELECT
  USING (user_id = auth.uid() OR public.is_project_owner(project_id, auth.uid()));
CREATE POLICY "Authenticated can apply" ON public.applications FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Project owner can update status" ON public.applications FOR UPDATE
  USING (public.is_project_owner(project_id, auth.uid()));

-- messages (with attachments)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_type TEXT,
  attachment_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX messages_project_created ON public.messages(project_id, created_at);
GRANT SELECT, INSERT, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can read messages" ON public.messages FOR SELECT
  USING (public.is_team_member(project_id, auth.uid()));
CREATE POLICY "Team members can send messages" ON public.messages FOR INSERT
  TO authenticated WITH CHECK (sender_id = auth.uid() AND public.is_team_member(project_id, auth.uid()));
CREATE POLICY "Sender can delete own messages" ON public.messages FOR DELETE
  USING (sender_id = auth.uid());

-- enable realtime on messages
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- notes
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can read notes" ON public.notes FOR SELECT
  USING (public.is_team_member(project_id, auth.uid()));
CREATE POLICY "Team members can write notes" ON public.notes FOR INSERT
  TO authenticated WITH CHECK (created_by = auth.uid() AND public.is_team_member(project_id, auth.uid()));
CREATE POLICY "Team members can update notes" ON public.notes FOR UPDATE
  USING (public.is_team_member(project_id, auth.uid()));
CREATE POLICY "Team members can delete notes" ON public.notes FOR DELETE
  USING (public.is_team_member(project_id, auth.uid()));
CREATE TRIGGER notes_updated BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'TODO',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can read tasks" ON public.tasks FOR SELECT
  USING (public.is_team_member(project_id, auth.uid()));
CREATE POLICY "Team members can write tasks" ON public.tasks FOR INSERT
  TO authenticated WITH CHECK (public.is_team_member(project_id, auth.uid()));
CREATE POLICY "Team members can update tasks" ON public.tasks FOR UPDATE
  USING (public.is_team_member(project_id, auth.uid()));
CREATE POLICY "Team members can delete tasks" ON public.tasks FOR DELETE
  USING (public.is_team_member(project_id, auth.uid()));

-- notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_created ON public.notifications(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY "Authenticated can create notifications for others" ON public.notifications FOR INSERT
  TO authenticated WITH CHECK (true);

-- application acceptance: auto-create team member + notification
CREATE OR REPLACE FUNCTION public.handle_application_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE proj_title TEXT;
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;
  SELECT title INTO proj_title FROM public.projects WHERE id = NEW.project_id;
  IF NEW.status = 'ACCEPTED' THEN
    INSERT INTO public.team_members (user_id, project_id, role) VALUES (NEW.user_id, NEW.project_id, 'member')
      ON CONFLICT DO NOTHING;
    INSERT INTO public.notifications (user_id, type, message, link)
      VALUES (NEW.user_id, 'application_accepted', 'Your application to ' || proj_title || ' was accepted!', '/team/' || NEW.project_id);
  ELSIF NEW.status = 'REJECTED' THEN
    INSERT INTO public.notifications (user_id, type, message, link)
      VALUES (NEW.user_id, 'application_rejected', 'Your application to ' || proj_title || ' was declined.', '/projects/' || NEW.project_id);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER applications_status_change AFTER UPDATE OF status ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_application_status_change();
