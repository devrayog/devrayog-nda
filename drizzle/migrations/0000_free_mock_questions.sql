CREATE TABLE public.free_mock_questions (
  id uuid primary key default gen_random_uuid(),
  subject text not null check (subject in ('maths','gat','english')),
  question_text text not null,
  options jsonb not null,
  correct_index int not null check (correct_index >= 0),
  explanation text not null default '',
  difficulty text not null default 'medium' check (difficulty in ('easy','medium','hard')),
  created_at timestamptz not null default now()
);

GRANT SELECT ON public.free_mock_questions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.free_mock_questions TO authenticated;
GRANT ALL ON public.free_mock_questions TO service_role;

ALTER TABLE public.free_mock_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read free mock questions"
  ON public.free_mock_questions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage free mock questions"
  ON public.free_mock_questions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.free_mock_questions (subject, question_text, options, correct_index, explanation, difficulty) VALUES
('maths', 'If the roots of x² - 5x + 6 = 0 are α and β, then α + β equals:', '["3","5","6","-5"]', 1, 'For x² - bx + c = 0, sum of roots = b. Here b = 5.', 'easy'),
('maths', 'The value of sin 30° + cos 60° is:', '["0","0.5","1","1.5"]', 2, 'sin 30° = 0.5 and cos 60° = 0.5, so the sum is 1.', 'easy'),
('maths', 'A train 150 m long crosses a pole in 15 seconds. Its speed is:', '["36 km/h","40 km/h","45 km/h","54 km/h"]', 0, 'Speed = 150/15 = 10 m/s = 10 × 18/5 = 36 km/h.', 'easy'),
('maths', 'The sum of the first 20 terms of the AP 3, 7, 11, ... is:', '["780","800","820","840"]', 2, 'S20 = 20/2 × [2(3) + 19(4)] = 10 × 82 = 820.', 'medium'),
('maths', 'If log₁₀ 2 = 0.3010, then log₁₀ 8 equals:', '["0.6020","0.9030","1.2040","2.4080"]', 1, '8 = 2³, so log 8 = 3 × 0.3010 = 0.9030.', 'easy'),
('maths', 'Two dice are thrown. The probability of getting a sum of 7 is:', '["1/6","1/8","1/9","5/36"]', 0, 'There are 6 favourable outcomes out of 36, so 6/36 = 1/6.', 'medium'),
('maths', 'If A is a 3×3 matrix with |A| = 4, then |2A| equals:', '["8","16","32","64"]', 2, '|kA| = kⁿ|A| for an n×n matrix. Here 2³ × 4 = 32.', 'medium'),
('maths', 'A number increased by 20% and then decreased by 20% gives 960. The original number is:', '["960","1000","1050","1100"]', 1, 'x × 1.2 × 0.8 = 0.96x = 960, so x = 1000.', 'medium'),
('maths', 'The area of a circle whose circumference is 44 cm is (use π = 22/7):', '["154 cm²","144 cm²","168 cm²","132 cm²"]', 0, '2πr = 44 → r = 7. Area = 22/7 × 49 = 154 cm².', 'easy'),
('maths', 'The modulus of the complex number 3 + 4i is:', '["5","7","12","25"]', 0, '|3 + 4i| = √(9 + 16) = √25 = 5.', 'easy'),
('gat', 'The SI unit of electric current is:', '["Volt","Ohm","Ampere","Watt"]', 2, 'Ampere (A) is the SI unit of electric current; volt is for potential difference.', 'easy'),
('gat', 'Which gas is most abundant in the Earth\u2019s atmosphere?', '["Oxygen","Nitrogen","Carbon dioxide","Argon"]', 1, 'Nitrogen makes up about 78% of the atmosphere.', 'easy'),
('gat', 'The Battle of Plassey was fought in the year:', '["1757","1764","1857","1526"]', 0, 'Robert Clive defeated Siraj-ud-Daulah at Plassey in 1757, beginning Company rule in Bengal.', 'medium'),
('gat', 'Fundamental Duties were added to the Indian Constitution by which amendment?', '["42nd","44th","52nd","73rd"]', 0, 'The 42nd Amendment (1976) added Part IV-A with Fundamental Duties.', 'medium'),
('gat', 'The headquarters of the Indian Air Force\u2019s Western Air Command is at:', '["Jodhpur","Delhi","Gandhinagar","Shillong"]', 1, 'Western Air Command, the largest IAF command, is headquartered in Delhi.', 'hard'),
('gat', 'The chemical name of baking soda is:', '["Sodium carbonate","Sodium bicarbonate","Calcium carbonate","Sodium hydroxide"]', 1, 'Baking soda is sodium bicarbonate, NaHCO₃.', 'easy'),
('gat', 'The Tropic of Cancer does NOT pass through which Indian state?', '["Rajasthan","Jharkhand","Chhattisgarh","Kerala"]', 3, 'The Tropic of Cancer crosses Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, WB, Tripura and Mizoram — not Kerala.', 'medium'),
('gat', 'INS Vikrant, India\u2019s first indigenous aircraft carrier, was commissioned in:', '["2013","2016","2022","2024"]', 2, 'INS Vikrant was commissioned on 2 September 2022 at Kochi.', 'medium'),
('gat', 'Which vitamin is produced in the human body on exposure to sunlight?', '["Vitamin A","Vitamin B12","Vitamin C","Vitamin D"]', 3, 'The skin synthesises vitamin D when exposed to UV-B rays in sunlight.', 'easy'),
('gat', 'The NDA is located at Khadakwasla near which city?', '["Mumbai","Pune","Nashik","Nagpur"]', 1, 'The National Defence Academy is at Khadakwasla, about 17 km from Pune.', 'easy'),
('english', 'Choose the word most nearly opposite in meaning to FRUGAL:', '["Thrifty","Extravagant","Careful","Miserly"]', 1, 'Frugal means sparing with money; extravagant is its opposite.', 'easy'),
('english', 'Choose the correctly spelt word:', '["Comemorate","Commemorate","Commerorate","Commommorate"]', 1, 'Commemorate is the correct spelling.', 'easy'),
('english', 'Fill in the blank: He has been working here ___ 2019.', '["for","since","from","at"]', 1, 'Since is used with a point in time (2019); for is used with a duration.', 'easy'),
('english', 'Choose the synonym of VALIANT:', '["Timid","Brave","Lazy","Rude"]', 1, 'Valiant means possessing courage; brave is the synonym.', 'easy'),
('english', 'Identify the part with an error: (a) One of my friend / (b) is going / (c) to Delhi / (d) tomorrow.', '["a","b","c","d"]', 0, 'One of takes a plural noun: One of my friends.', 'medium'),
('english', '"To beat about the bush" means:', '["To attack directly","To talk aimlessly around a point","To search a forest","To work hard"]', 1, 'The idiom means to avoid coming to the point by talking around it.', 'medium'),
('english', 'One word for "a person who speaks two languages":', '["Linguist","Bilingual","Interpreter","Polyglot"]', 1, 'Bilingual describes someone fluent in two languages; a polyglot knows many.', 'medium'),
('english', 'Change to passive voice: "The soldier saluted the officer."', '["The officer was saluted by the soldier.","The officer is saluted by the soldier.","The officer has saluted the soldier.","The officer saluted by the soldier."]', 0, 'Simple past active becomes was/were + past participle: was saluted.', 'medium'),
('english', 'Fill in the blank: The cadet was praised ___ his courage.', '["for","with","on","about"]', 0, 'We praise someone for a quality or act.', 'easy'),
('english', 'Choose the antonym of ASCEND:', '["Rise","Mount","Descend","Climb"]', 2, 'Ascend means to go up; descend means to go down.', 'easy');