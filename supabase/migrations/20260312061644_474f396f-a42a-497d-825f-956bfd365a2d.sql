-- Add image fields to mock_test_questions for photo-based questions
ALTER TABLE public.mock_test_questions ADD COLUMN IF NOT EXISTS question_image_url text DEFAULT null;
ALTER TABLE public.mock_test_questions ADD COLUMN IF NOT EXISTS option_a_image_url text DEFAULT null;
ALTER TABLE public.mock_test_questions ADD COLUMN IF NOT EXISTS option_b_image_url text DEFAULT null;
ALTER TABLE public.mock_test_questions ADD COLUMN IF NOT EXISTS option_c_image_url text DEFAULT null;
ALTER TABLE public.mock_test_questions ADD COLUMN IF NOT EXISTS option_d_image_url text DEFAULT null;
ALTER TABLE public.mock_test_questions ADD COLUMN IF NOT EXISTS explanation_image_url text DEFAULT null;

-- Add image fields to topic_questions
ALTER TABLE public.topic_questions ADD COLUMN IF NOT EXISTS question_image_url text DEFAULT null;
ALTER TABLE public.topic_questions ADD COLUMN IF NOT EXISTS option_a_image_url text DEFAULT null;
ALTER TABLE public.topic_questions ADD COLUMN IF NOT EXISTS option_b_image_url text DEFAULT null;
ALTER TABLE public.topic_questions ADD COLUMN IF NOT EXISTS option_c_image_url text DEFAULT null;
ALTER TABLE public.topic_questions ADD COLUMN IF NOT EXISTS option_d_image_url text DEFAULT null;
ALTER TABLE public.topic_questions ADD COLUMN IF NOT EXISTS explanation_image_url text DEFAULT null;

-- Add image fields to pyq_questions
ALTER TABLE public.pyq_questions ADD COLUMN IF NOT EXISTS question_image_url text DEFAULT null;
ALTER TABLE public.pyq_questions ADD COLUMN IF NOT EXISTS option_a_image_url text DEFAULT null;
ALTER TABLE public.pyq_questions ADD COLUMN IF NOT EXISTS option_b_image_url text DEFAULT null;
ALTER TABLE public.pyq_questions ADD COLUMN IF NOT EXISTS option_c_image_url text DEFAULT null;
ALTER TABLE public.pyq_questions ADD COLUMN IF NOT EXISTS option_d_image_url text DEFAULT null;
ALTER TABLE public.pyq_questions ADD COLUMN IF NOT EXISTS explanation_image_url text DEFAULT null;

-- Add image to question reports
ALTER TABLE public.question_reports ADD COLUMN IF NOT EXISTS image_url text DEFAULT null;

-- Add image to feedback
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS image_url text DEFAULT null;

-- Girls NDA content table
CREATE TABLE IF NOT EXISTS public.girls_nda_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'card',
  title text NOT NULL,
  body text DEFAULT '',
  image_url text DEFAULT null,
  link text DEFAULT '',
  icon text DEFAULT 'Heart',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.girls_nda_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage girls nda content" ON public.girls_nda_content
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active girls nda content" ON public.girls_nda_content
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Storage bucket for question images
INSERT INTO storage.buckets (id, name, public) VALUES ('question-images', 'question-images', true) ON CONFLICT DO NOTHING;

-- RLS for question-images storage
CREATE POLICY "Anyone can view question images" ON storage.objects FOR SELECT USING (bucket_id = 'question-images');
CREATE POLICY "Admins can upload question images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'question-images' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated can upload report images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'question-images');
CREATE POLICY "Admins can delete question images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'question-images' AND has_role(auth.uid(), 'admin'::app_role));