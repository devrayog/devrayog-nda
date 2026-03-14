
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;
ALTER TABLE public.study_topics ADD COLUMN IF NOT EXISTS image_url text DEFAULT NULL;
