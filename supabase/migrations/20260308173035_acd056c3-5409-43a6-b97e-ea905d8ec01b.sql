
-- Study topics table (admin-managed)
CREATE TABLE public.study_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL DEFAULT 'maths',
  category text DEFAULT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  emoji text DEFAULT '📚',
  weight text DEFAULT 'Medium',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.study_topics ENABLE ROW LEVEL SECURITY;

-- Everyone can read active topics
CREATE POLICY "Anyone can view active topics"
ON public.study_topics FOR SELECT
TO authenticated
USING (is_active = true);

-- Admins can manage topics
CREATE POLICY "Admins can manage topics"
ON public.study_topics FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Topic questions (MCQs managed by admin)
CREATE TABLE public.topic_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES public.study_topics(id) ON DELETE CASCADE NOT NULL,
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

ALTER TABLE public.topic_questions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read active questions
CREATE POLICY "Anyone can view active questions"
ON public.topic_questions FOR SELECT
TO authenticated
USING (is_active = true);

-- Admins can manage questions
CREATE POLICY "Admins can manage questions"
ON public.topic_questions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default topics for Maths
INSERT INTO public.study_topics (subject, name, slug, description, emoji, weight, sort_order) VALUES
('maths', 'Algebra', 'algebra', 'Quadratic Equations, Sequences & Series, Complex Numbers', '📐', 'High', 1),
('maths', 'Trigonometry', 'trigonometry', 'Identities, Heights & Distances, Inverse Trig', '📏', 'High', 2),
('maths', 'Differential Calculus', 'calculus', 'Limits, Derivatives, Applications', '∫', 'Medium', 3),
('maths', 'Integral Calculus', 'integral-calculus', 'Definite & Indefinite Integrals, Area', '∑', 'Medium', 4),
('maths', 'Coordinate Geometry', 'coordinate-geometry', 'Straight Lines, Circles, Conics', '📊', 'High', 5),
('maths', 'Vectors & 3D Geometry', 'vectors', 'Dot Product, Cross Product, Lines & Planes', '🎯', 'Medium', 6),
('maths', 'Matrices & Determinants', 'matrices', 'Operations, Inverse, Cramers Rule', '🔢', 'Medium', 7),
('maths', 'Probability & Statistics', 'probability', 'Conditional Probability, Distributions, Mean/Variance', '🎲', 'High', 8),
('maths', 'Sets & Relations', 'sets', 'Venn Diagrams, Functions, Binary Operations', '🔗', 'Low', 9),
('maths', 'Number System', 'number-system', 'HCF/LCM, Divisibility, Remainders', '🔣', 'Low', 10);

-- Seed English topics
INSERT INTO public.study_topics (subject, name, slug, description, emoji, weight, sort_order) VALUES
('english', 'Grammar Fundamentals', 'grammar-basics', 'Parts of Speech, Tenses, Articles, Prepositions', '📖', 'High', 1),
('english', 'Sentence Correction', 'sentence-correction', 'Error Spotting, Fill in Blanks, Sentence Improvement', '✏️', 'High', 2),
('english', 'Vocabulary', 'vocabulary-topic', 'Synonyms, Antonyms, One Word Substitution, Idioms', '📚', 'High', 3),
('english', 'Reading Comprehension', 'comprehension', 'Passage-based Questions, Inference, Main Idea', '📝', 'Medium', 4),
('english', 'Cloze Test', 'cloze-test', 'Fill in context-based blanks in passages', '🔤', 'Medium', 5),
('english', 'Sentence Ordering', 'ordering', 'Para Jumbles, Sentence Rearrangement', '🔀', 'Medium', 6),
('english', 'Active & Passive Voice', 'active-passive', 'Voice conversion rules and practice', '🔁', 'Low', 7),
('english', 'Direct & Indirect Speech', 'direct-indirect', 'Narration changes and rules', '💬', 'Low', 8);

-- Seed GAT topics
INSERT INTO public.study_topics (subject, category, name, slug, description, emoji, weight, sort_order) VALUES
('gat', 'History', 'Indian History', 'indian-history', 'Ancient, Medieval, Modern India', '🏛️', 'High', 1),
('gat', 'History', 'Freedom Struggle', 'freedom-struggle', '1857 to Independence, Leaders & Movements', '🇮🇳', 'High', 2),
('gat', 'History', 'World History', 'world-history', 'World Wars, Renaissance, Cold War', '🌍', 'Medium', 3),
('gat', 'Geography', 'Indian Geography', 'indian-geography', 'Rivers, Mountains, Climate, States', '🗺️', 'High', 4),
('gat', 'Geography', 'World Geography', 'world-geography', 'Continents, Oceans, International Boundaries', '🌏', 'Medium', 5),
('gat', 'Geography', 'Physical Geography', 'physical-geography', 'Atmosphere, Lithosphere, Hydrosphere', '⛰️', 'Medium', 6),
('gat', 'Science', 'Physics (GAT)', 'physics-gat', 'Mechanics, Light, Sound, Electricity basics', '⚡', 'Medium', 7),
('gat', 'Science', 'Chemistry (GAT)', 'chemistry-gat', 'Elements, Compounds, Everyday Chemistry', '🧪', 'Medium', 8),
('gat', 'Science', 'Biology', 'biology-gat', 'Human Body, Diseases, Plants', '🧬', 'Medium', 9),
('gat', 'Polity & Economy', 'Indian Polity', 'polity', 'Constitution, Parliament, Amendments', '⚖️', 'High', 10),
('gat', 'Polity & Economy', 'Indian Economy', 'economy', 'Budget, GDP, Banking, Policies', '💰', 'Medium', 11),
('gat', 'Polity & Economy', 'Defence & Current Affairs', 'defence', 'Exercises, Weapons, Defence News', '🎖️', 'High', 12);
