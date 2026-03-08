

# Devrayog NDA AI — Massive Feature Update Plan

This is an enormous request covering 50+ distinct changes. Due to the sheer scope, this will need to be implemented across multiple batches. Here is the complete plan.

---

## Batch 1: Core Fixes & Dashboard Enhancements

### 1. Exam Countdown Timer (not just days)
- Change exam date to **April 12, 2026, 10:00 AM IST** for Maths and **2:00 PM** for GAT
- Replace "days left" with a live countdown: `DD : HH : MM : SS` updating every second
- Show on Dashboard and Landing page

### 2. Daily AI Motivation on Dashboard
- Call `ai-motivation` edge function on dashboard load with user context
- Display a motivational card that changes daily based on streak, DNA score, progress

### 3. Profile Edit
- Add edit mode to Profile page with form fields for all onboarding data
- Add profile picture upload using a storage bucket (`avatars`)
- Database migration: add `avatar_url` column to `profiles` table
- Create storage bucket with public read access

---

## Batch 2: Settings & Notifications Overhaul

### 4. Extended Settings Page
- Add notification preferences section with toggles for:
  - Daily Study Reminder (with time picker)
  - Mock Test Reminder (weekly)
  - Streak Reminder (before midnight)
  - Current Affairs Update (morning)
  - Community Replies
  - Exam Countdown Alerts (30, 14, 7, 3, 1 day)
  - Morning News Time picker
- Database migration: create `notification_preferences` table

### 5. Admin Broadcast Notifications
- Admin panel section to send broadcast notifications
- Target: All Users / Premium Only / Free Only
- Type: Notification / Announcement / Warning
- Database: insert into `notifications` table for targeted users

---

## Batch 3: Achievements System

### 6. Live Achievements
- Database migration: create `achievements` table (id, key, title, description, icon, category, hidden, criteria_json) and `user_achievements` table (user_id, achievement_id, unlocked_at)
- Define ~20 achievements: first login, first test, 7-day streak, 100 questions, etc.
- Show locked achievements with "what to do" hints
- Hidden achievements shown as "???" with mystery description
- Trigger achievement checks on key actions (test complete, streak update, etc.)

---

## Batch 4: Activity Tracking & DNA Score

### 7. Live Activity Logging
- Create a `useActivityTracker` hook that logs page visits, time spent, and actions
- Insert into `user_activity` on: page navigation, test start/complete, AI chat, bookmark, note creation
- Activity Log page reads and displays this data with filters

### 8. Live DNA Score
- Create a `useDNAScore` hook that recalculates DNA score based on:
  - Test results (40%), streak (15%), topics covered (20%), accuracy trend (15%), consistency (10%)
- Update `profiles.dna_score` after each test, daily login, study activity
- Show animated DNA score on dashboard

### 9. Initial DNA Test on Signup
- After signup, redirect to a 15-question diagnostic test
- Results set initial DNA score and identify weak areas
- Store in `test_results` as type "diagnostic"

---

## Batch 5: AI Tutor Enhancements

### 10. File Attachment in AI Tutor
- Add file upload button (images, PDFs)
- Upload to storage bucket, send URL to AI for analysis
- Support image generation via `google/gemini-3-pro-image-preview`

### 11. Chat History in localStorage
- Save conversation history per session in localStorage
- Show past conversations list in sidebar
- Also persist to `chat_history` table for cross-device

---

## Batch 6: Study Hubs & Admin Content Management

### 12. Admin Topic Management
- In Maths/GAT/English hubs, admin can add/edit topics
- Database migration: create `topics` table (id, subject, title, order, description, created_by)
- Admin UI: add topic form in each hub page

### 13. Admin Question Management for Topics
- In `/study/topic/:topicId`, admin can add MCQ questions
- Database migration: create `topic_questions` table (id, topic_id, question, options, correct, explanation, image_url)
- Students see questions and can practice

### 14. Modern Study Plan UI
- When AI generates plan, render with animated cards, progress indicators, 3D visual elements
- Collapsible day sections with topic chips

---

## Batch 7: Current Affairs Enhancement

### 15. Admin Current Affairs Management
- Database migration: create `current_affairs` table (id, title, body, image_url, link, category, featured, created_by, created_at)
- Admin can add with title, body, image, link
- Featured items show at top, AI-generated below
- Modern card-based UI with category filters

---

## Batch 8: PYQ & Notes & Bookmarks

### 16. PYQ Split View
- Two tabs: "Previous Year Papers" (admin adds PDFs) and "Previous Year Questions" (admin adds MCQs with images)
- Database migrations: `pyq_papers` table (id, year, title, pdf_url) and `pyq_questions` table (id, year, question, image_url, options, correct, explanation)
- Storage bucket for PYQ PDFs

### 17. Notes File Attachment
- Add file upload capability to notes
- Store file URLs in notes metadata

### 18. Bookmark Button on Questions
- Add bookmark icon on every question (mock tests, topic questions, PYQ)
- Save to `bookmarks` table with question data

---

## Batch 9: Revision, Formulas, Vocabulary

### 19. Live Revision Planner
- Show topics studied vs remaining with AI recommendations
- Modern UI with progress bars and spaced repetition schedule

### 20. Admin Formula Management
- Database: `formulas` table (id, title, content, image_url, category, tags like "short_trick", "important")
- Sort/filter by category
- Admin can add with image

### 21. AI Vocabulary of the Day
- AI generates daily vocabulary word
- Admin can add PDFs, PPTs, images
- Database: `vocabulary` table (id, word, meaning, usage, date) and `vocabulary_resources` table

---

## Batch 10: Mock Tests — NDA Accurate Format

### 22. Fix Test Format to Match NDA
- **GAT**: 50 English + 50 Science (Physics/Bio/Chem) + 50 GK (History/Geo/Eco/Current Affairs) = 150 questions, 2.5 hours, +4/-1.33
- **Maths**: 120 questions, 2.5 hours, +2.5/-0.83 (1/3 negative)
- Admin can add test papers with questions
- AI-generated tests labeled separately
- Add "Mark for Review" and "Bookmark Question" buttons

### 23. Question Bank
- Live working page with admin content + AI generation
- Admin can add: PDFs, links, videos, audios, PPTs, Excel, Docs, Images with title and body
- Database: `question_bank` table

---

## Batch 11: SSB Complete Overhaul

### 24. SSB/OIR — Admin + AI Questions
- Admin can add OIR MCQ sets with optional images
- AI can also generate OIR questions
- Database: `ssb_questions` table (id, type, set_number, question, options, correct, image_url, explanation)

### 25. SSB/PPDT — Timed Photo Practice
- Admin uploads PPDT photos
- Flow: Start → Rules popup → Agree → 30s photo display → 4min modern 3D animation screen → Upload story photo → AI analyzes story + photo → Rating/10
- Database: `ssb_sets` table (id, type, set_number, items as JSONB)

### 26. SSB/TAT — 12 Photos Timed
- Admin adds 12 photos per set
- 30s photo → 4min 3D animation UI → repeat 12 times → back to /ssb/tat
- No AI analysis

### 27. SSB/WAT — 60 Words Timed
- Admin adds 60-word sets
- 15 seconds per word display → back to /ssb/wat
- No AI analysis

### 28. SSB/SRT — 60 Situations Timed
- Admin adds SRT sets of 60 with optional photo + text
- 30 seconds each → back to /ssb/srt

### 29. SSB/SDT — 5 Questions Timed
- Admin adds 5 SDT questions with optional photo
- 3 minutes each → back to /ssb/sdt

### 30. SSB/GD & Interview — Coming Soon
- Show "COMING SOON" with motivation quote
- Auto-redirect to dashboard in 10 seconds

### 31. SSB Personality Tips — Admin Editable
- Admin can add/edit tips with title, body, category
- AI can also provide personalized tips

---

## Batch 12: Community & Social

### 32. Real-time Community Chat
- Global chat room using Supabase Realtime
- Database: `community_messages` table with realtime enabled
- 1:1 messaging support
- Group/global chat between all users

### 33. Mentors Section
- Admin manages mentor profiles
- "Book Session" button redirects to WhatsApp `+91 8233801406` with pre-filled text

### 34. Study Partners — Live
- Match users by state/attempt/target exam
- Show compatible partners with "Connect" button

### 35. Success Stories — Admin Managed
- Admin can add success stories with title, body, photo, strategy details

---

## Batch 13: Fitness & Medical (from uploaded HTML references)

### 36. Fitness/Physical Standards
- Detailed physical fitness requirements from `dna-physical.html`
- Running standards, push-ups, pull-ups, BMI tables
- 12-week fitness plan
- Service-specific requirements

### 37. Medical Standards
- From `dna-medical.html`: height/weight tables, eyesight standards, hearing
- Medical eligibility checker tool (gender, age, height, weight, eyesight)
- Service-wise comparison tables

---

## Batch 14: Resources, FAQ, Girls Section

### 38. Resources — Admin Managed
- Books: title, body, link (admin adds)
- Videos: title, body, link
- Downloads: title, body, download link

### 39. FAQ Page
- From `dna-faq.html`: Accordion FAQ with categories (Platform, Premium, NDA Exam, SSB, AI, Account)
- Admin can add/edit FAQs
- Search functionality

### 40. Girls Section — Enhanced
- Pink/rose defense-themed color scheme
- More content: eligibility, physical standards for girls, success stories
- Community space for girl candidates

---

## Batch 15: New Public Pages (from uploaded HTML)

### 41. About Page (from `dna-about.html`)
- Devanshu's story, 3 NDA attempts, SSB experience
- Mission, vision, team section

### 42. Pricing Page (from `dna-pricing.html`)
- Free vs Premium comparison table
- WhatsApp-based payment flow (₹11/month)

### 43. Contact Page (from `dna-contact.html`)
- Contact form → WhatsApp redirect
- Devanshu card, response times

### 44. Blog Page (from `dna-blog.html`)
- NDA tips, SSB advice articles
- Admin can add blog posts

### 45. Success Stories Public Page (from `dna-success.html`)

---

## Batch 16: Navigation & 3D Polish

### 46. Role-based Navigation
- Show admin links only to admin users
- Show all relevant pages in sidebar organized by section
- Add missing links: Activity, DNA Score, Revision, Formulas, Vocabulary, Question Bank, all SSB sub-pages, Fitness sub-pages

### 47. 3D Animations & Defence Photos
- Add more Unsplash defense/NDA photos throughout the app
- Enhance 3D DNA helix and shield globe animations
- Add 3D loading animations for test generation, AI processing
- Modern animated transitions between pages using framer-motion

---

## Database Migrations Required

Multiple migrations needed for new tables:
- `notification_preferences`
- `achievements`, `user_achievements`
- `topics`, `topic_questions`
- `current_affairs`
- `pyq_papers`, `pyq_questions`
- `formulas`, `vocabulary`, `vocabulary_resources`
- `question_bank`, `question_bank_resources`
- `ssb_questions`, `ssb_sets`
- `community_messages`
- `mentors`
- `success_stories`
- `blog_posts`
- `faqs`
- Add `avatar_url` to `profiles`

Storage buckets: `avatars`, `pyq-papers`, `ssb-photos`, `resources`, `notes-files`, `question-bank-files`

All tables need RLS policies. Admin-managed tables need `has_role(auth.uid(), 'admin')` policies for INSERT/UPDATE/DELETE, and authenticated SELECT for students.

---

## Implementation Order

Given the massive scope, I recommend implementing in this exact batch order. Each batch produces working features. The most impactful changes come first (countdown timer, profile edit, settings, achievements, AI enhancements).

**This is approximately 45+ distinct features requiring 15-20 implementation rounds.**

