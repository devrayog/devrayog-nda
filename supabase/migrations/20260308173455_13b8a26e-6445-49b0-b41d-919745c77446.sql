
CREATE TABLE public.current_affairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text DEFAULT '',
  image_url text DEFAULT NULL,
  link text DEFAULT NULL,
  category text NOT NULL DEFAULT 'national',
  is_featured boolean DEFAULT false,
  published_at date NOT NULL DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT NULL
);

ALTER TABLE public.current_affairs ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read active items
CREATE POLICY "Authenticated users can view current affairs"
ON public.current_affairs FOR SELECT
TO authenticated
USING (is_active = true);

-- Admins can manage
CREATE POLICY "Admins can manage current affairs"
ON public.current_affairs FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
