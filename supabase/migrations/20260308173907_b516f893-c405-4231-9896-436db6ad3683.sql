
-- Fix security definer view issue
DROP VIEW IF EXISTS public.leaderboard_profiles;

CREATE VIEW public.leaderboard_profiles
WITH (security_invoker = on) AS
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

-- Add policy so authenticated users can read all profiles for leaderboard
CREATE POLICY "Authenticated users can view profiles for leaderboard"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Drop the old restrictive select policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
