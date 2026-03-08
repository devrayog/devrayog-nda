
-- Leaderboard: Create a public view that exposes only leaderboard-safe fields
CREATE VIEW public.leaderboard_profiles
WITH (security_invoker = off) AS
SELECT 
  user_id,
  full_name,
  username,
  avatar_url,
  dna_score,
  streak,
  total_questions_solved,
  accuracy,
  state,
  service,
  target_exam
FROM public.profiles
WHERE dna_score IS NOT NULL;

-- Allow all authenticated users to read leaderboard view
-- We need a SELECT policy on profiles that the view owner can use
-- Since the view uses security_invoker=off, it runs as the view owner (postgres)
-- So we don't need extra RLS changes for the view itself

-- Community posts table
CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  likes_count integer DEFAULT 0,
  replies_count integer DEFAULT 0,
  is_pinned boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Everyone can read posts
CREATE POLICY "Anyone can view posts"
ON public.community_posts FOR SELECT
TO authenticated
USING (true);

-- Users can create posts
CREATE POLICY "Users can create posts"
ON public.community_posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update own posts
CREATE POLICY "Users can update own posts"
ON public.community_posts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete own posts
CREATE POLICY "Users can delete own posts"
ON public.community_posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Post likes
CREATE TABLE public.post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
ON public.post_likes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can like"
ON public.post_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
ON public.post_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Post replies
CREATE TABLE public.post_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.post_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view replies"
ON public.post_replies FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can reply"
ON public.post_replies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own replies"
ON public.post_replies FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Running logs
CREATE TABLE public.running_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  distance_km numeric NOT NULL DEFAULT 0,
  time_minutes numeric NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.running_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own running logs"
ON public.running_logs FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to update post counts
CREATE OR REPLACE FUNCTION public.update_post_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'post_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE community_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'post_replies' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE community_posts SET replies_count = replies_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE community_posts SET replies_count = GREATEST(replies_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_like_change
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.update_post_counts();

CREATE TRIGGER on_reply_change
AFTER INSERT OR DELETE ON public.post_replies
FOR EACH ROW EXECUTE FUNCTION public.update_post_counts();
