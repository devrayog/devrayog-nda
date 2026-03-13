
-- Vocabulary words table
CREATE TABLE public.vocabulary_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  meaning text NOT NULL,
  usage_example text DEFAULT '',
  synonym text DEFAULT '',
  antonym text DEFAULT '',
  difficulty text DEFAULT 'medium',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.vocabulary_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage vocab" ON public.vocabulary_words FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view vocab" ON public.vocabulary_words FOR SELECT TO authenticated USING (is_active = true);

-- Daily tasks table
CREATE TABLE public.daily_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'study',
  target_value integer DEFAULT 1,
  icon text DEFAULT 'Target',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage daily tasks" ON public.daily_tasks FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view daily tasks" ON public.daily_tasks FOR SELECT TO authenticated USING (is_active = true);

-- OIR questions (admin-added with images)
CREATE TABLE public.oir_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  question_image_url text,
  option_a text NOT NULL,
  option_a_image_url text,
  option_b text NOT NULL,
  option_b_image_url text,
  option_c text NOT NULL,
  option_c_image_url text,
  option_d text NOT NULL,
  option_d_image_url text,
  correct_option text NOT NULL DEFAULT 'a',
  explanation text DEFAULT '',
  explanation_image_url text,
  difficulty text DEFAULT 'medium',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.oir_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage OIR" ON public.oir_questions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view OIR" ON public.oir_questions FOR SELECT TO authenticated USING (is_active = true);

-- Screenout content (admin-editable)
CREATE TABLE public.screenout_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  fix text DEFAULT '',
  type text DEFAULT 'reason',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.screenout_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage screenout" ON public.screenout_content FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view screenout" ON public.screenout_content FOR SELECT TO authenticated USING (is_active = true);

-- Fitness standards (admin-configurable cards + minimums)
CREATE TABLE public.fitness_standards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label text NOT NULL,
  value text NOT NULL,
  icon text DEFAULT '💪',
  description text DEFAULT '',
  category text DEFAULT 'minimum',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.fitness_standards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage fitness" ON public.fitness_standards FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view fitness" ON public.fitness_standards FOR SELECT TO authenticated USING (is_active = true);

-- Medical content (admin-editable sections)
CREATE TABLE public.medical_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  title text NOT NULL,
  body text DEFAULT '',
  type text DEFAULT 'standard',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.medical_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage medical" ON public.medical_content FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view medical" ON public.medical_content FOR SELECT TO authenticated USING (is_active = true);
