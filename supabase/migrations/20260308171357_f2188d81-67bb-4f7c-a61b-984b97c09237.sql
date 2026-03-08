
-- Achievements definition table
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'trophy',
  category text NOT NULL DEFAULT 'general',
  hidden boolean NOT NULL DEFAULT false,
  criteria_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read achievements
CREATE POLICY "Authenticated users can view achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage achievements
CREATE POLICY "Admins can manage achievements"
  ON public.achievements FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- User achievements (unlocked)
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Seed achievements
INSERT INTO public.achievements (key, title, description, icon, category, hidden, criteria_json) VALUES
  ('first_login', 'First Steps', 'Log in for the first time', 'log-in', 'general', false, '{"type":"login","count":1}'),
  ('profile_complete', 'Identity Established', 'Complete your profile with all details', 'user-check', 'general', false, '{"type":"profile_complete"}'),
  ('first_test', 'Trial by Fire', 'Complete your first mock test', 'file-text', 'tests', false, '{"type":"test_complete","count":1}'),
  ('five_tests', 'Battle Hardened', 'Complete 5 mock tests', 'shield', 'tests', false, '{"type":"test_complete","count":5}'),
  ('ten_tests', 'Veteran Warrior', 'Complete 10 mock tests', 'swords', 'tests', false, '{"type":"test_complete","count":10}'),
  ('streak_3', 'Consistent Cadet', 'Maintain a 3-day streak', 'flame', 'streaks', false, '{"type":"streak","count":3}'),
  ('streak_7', 'Week Warrior', 'Maintain a 7-day streak', 'flame', 'streaks', false, '{"type":"streak","count":7}'),
  ('streak_30', 'Iron Discipline', 'Maintain a 30-day streak', 'flame', 'streaks', false, '{"type":"streak","count":30}'),
  ('streak_100', 'Unstoppable Force', 'Maintain a 100-day streak', 'flame', 'streaks', true, '{"type":"streak","count":100}'),
  ('questions_50', 'Question Crusher', 'Solve 50 questions', 'target', 'practice', false, '{"type":"questions_solved","count":50}'),
  ('questions_200', 'Knowledge Seeker', 'Solve 200 questions', 'brain', 'practice', false, '{"type":"questions_solved","count":200}'),
  ('questions_500', 'Scholar Elite', 'Solve 500 questions', 'graduation-cap', 'practice', false, '{"type":"questions_solved","count":500}'),
  ('questions_1000', 'Grandmaster', 'Solve 1000 questions', 'crown', 'practice', true, '{"type":"questions_solved","count":1000}'),
  ('accuracy_80', 'Sharpshooter', 'Achieve 80% accuracy in a test', 'crosshair', 'tests', false, '{"type":"accuracy","threshold":80}'),
  ('accuracy_95', 'Sniper Elite', 'Achieve 95% accuracy in a test', 'crosshair', 'tests', true, '{"type":"accuracy","threshold":95}'),
  ('first_note', 'Note Taker', 'Create your first note', 'sticky-note', 'general', false, '{"type":"note_created","count":1}'),
  ('first_bookmark', 'Bookworm', 'Bookmark your first question', 'bookmark', 'general', false, '{"type":"bookmark_created","count":1}'),
  ('ai_chat_10', 'AI Apprentice', 'Have 10 conversations with AI Tutor', 'message-square', 'ai', false, '{"type":"ai_chat","count":10}'),
  ('dna_score_70', 'Rising Star', 'Reach a DNA Score of 70', 'star', 'dna', false, '{"type":"dna_score","threshold":70}'),
  ('dna_score_90', 'Legend', 'Reach a DNA Score of 90', 'medal', 'dna', true, '{"type":"dna_score","threshold":90}');
