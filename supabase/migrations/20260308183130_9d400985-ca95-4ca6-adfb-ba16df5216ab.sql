
-- SSB Sets (PPDT photos, TAT photos, WAT word sets, SRT situations, SDT questions)
CREATE TABLE public.ssb_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'ppdt', -- ppdt, tat, wat, srt, sdt
  title text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

-- SSB Set Items (photos, words, situations)
CREATE TABLE public.ssb_set_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id uuid NOT NULL REFERENCES public.ssb_sets(id) ON DELETE CASCADE,
  sort_order integer DEFAULT 0,
  content_text text DEFAULT '',
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Resources (books, videos, downloads)
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'book', -- book, video, download
  title text NOT NULL,
  body text DEFAULT '',
  link text DEFAULT '',
  image_url text,
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

-- FAQs
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Success Stories (admin-managed)
CREATE TABLE public.success_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  branch text DEFAULT '',
  batch text DEFAULT '',
  state text DEFAULT '',
  quote text DEFAULT '',
  tips text[] DEFAULT '{}',
  attempts integer DEFAULT 1,
  highlight text DEFAULT '',
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Chat Messages (realtime 1:1 and global)
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL DEFAULT 'global', -- 'global' or 'dm:{sorted_user_ids}'
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ssb_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ssb_set_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- SSB Sets: admin manage, users view
CREATE POLICY "Admins manage ssb_sets" ON public.ssb_sets FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view active ssb_sets" ON public.ssb_sets FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins manage ssb_set_items" ON public.ssb_set_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view ssb_set_items" ON public.ssb_set_items FOR SELECT TO authenticated USING (true);

-- Resources: admin manage, users view
CREATE POLICY "Admins manage resources" ON public.resources FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view active resources" ON public.resources FOR SELECT TO authenticated USING (is_active = true);

-- FAQs: admin manage, users view
CREATE POLICY "Admins manage faqs" ON public.faqs FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view active faqs" ON public.faqs FOR SELECT TO authenticated USING (is_active = true);

-- Success stories: admin manage, users view
CREATE POLICY "Admins manage success_stories" ON public.success_stories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view active success_stories" ON public.success_stories FOR SELECT TO authenticated USING (is_active = true);

-- Chat messages: users can send/view
CREATE POLICY "Users can send chat messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view chat messages" ON public.chat_messages FOR SELECT TO authenticated USING (true);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
