
-- PYQ questions table (admin-managed)
CREATE TABLE public.pyq_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  paper text NOT NULL DEFAULT 'NDA 1',
  subject text NOT NULL DEFAULT 'maths',
  topic text DEFAULT '',
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option text NOT NULL DEFAULT 'a',
  explanation text DEFAULT '',
  difficulty text DEFAULT 'medium',
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pyq_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view PYQs"
ON public.pyq_questions FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage PYQs"
ON public.pyq_questions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Error log table for spaced repetition tracking
CREATE TABLE public.error_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question text NOT NULL,
  user_answer text NOT NULL,
  correct_answer text NOT NULL,
  explanation text DEFAULT '',
  subject text DEFAULT '',
  topic text DEFAULT '',
  source text DEFAULT 'test',
  review_count integer DEFAULT 0,
  next_review_at timestamptz DEFAULT now(),
  mastered boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own error log"
ON public.error_log FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
