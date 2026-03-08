

# Devrayog NDA AI — Complete Platform Build Plan

## Current State
The project is a blank React + Vite + Tailwind app with shadcn/ui components. Lovable Cloud is available with `LOVABLE_API_KEY` for AI. No pages, no backend, no database yet.

## What We Are Building
A full AI-powered NDA exam preparation platform with **deep personalization** — every interaction tracked, every response tailored per student. The AI acts as a personal mentor who knows each student's name, weaknesses, attempt history, study patterns, and behavioral signals.

---

## AI Personalization Architecture

The AI personalization works through **4 data layers** fed into every AI call:

```text
┌─────────────────────────────────────────────┐
│              STUDENT CONTEXT                │
│  (sent with every AI request as system msg) │
├─────────────────────────────────────────────┤
│ Layer 1: IDENTITY                           │
│   name, attempt#, service goal, state,      │
│   weak subjects, study hours, medium        │
├─────────────────────────────────────────────┤
│ Layer 2: REAL-TIME STATE                    │
│   DNA score, streak, last test scores,      │
│   exam countdown, current time of day,      │
│   pages visited, time spent per topic       │
├─────────────────────────────────────────────┤
│ Layer 3: BEHAVIORAL SIGNALS                 │
│   topics skipped, questions wrong pattern,  │
│   video watch speed, session duration,      │
│   login frequency, subjects avoided         │
├─────────────────────────────────────────────┤
│ Layer 4: ADAPTIVE RESPONSE                  │
│   tone (encouraging vs direct based on      │
│   attempt#), language (hi/en), length       │
│   (mobile=short), context-aware per page    │
└─────────────────────────────────────────────┘
```

**How it works technically:**
- Every user action (page visit, test attempt, time on topic, skip, click) is logged to a `user_activity` table
- An edge function `ai-context-builder` aggregates this into a personalization context JSON
- Every AI call (tutor chat, dashboard greeting, study plan, test analysis) includes this context as system prompt
- The AI model (gemini-3-flash-preview via Lovable AI Gateway) uses this context to personalize every response

---

## Pages (All 79+ pages organized by section)

### A. Public Pages (5)
1. **Landing Page** — Hero with 3D globe/shield animation, feature cards, stats, CTA
2. **Login** — Email/password auth
3. **Signup** — 4-step DNA profile setup (from provided HTML)
4. **Forgot Password** + **Reset Password**

### B. Core Dashboard (8)
5. **Dashboard** — Personalized greeting, DNA Score widget, today's AI plan, streak, weak area alerts, exam countdown
6. **Profile** — Edit all onboarding data, view DNA score breakdown
7. **Settings** — Theme toggle (light/dark), Language toggle (Hindi/English), notifications preferences
8. **Notifications** — Smart AI-triggered notifications list
9. **Achievements/Badges** — Gamification page
10. **Leaderboard** — State-wise, batch-wise rankings
11. **Activity Log** — Student's own study history
12. **DNA Score Details** — Full breakdown of readiness score

### C. Study & Content (15)
13. **Study Plan** — AI-generated daily/weekly plan based on weakness + exam date
14. **Maths Hub** — Topic list, AI-recommended order based on weakness
15. **GAT/GK Hub** — History, Geography, Science, Polity topics
16. **English Hub** — Grammar, Vocabulary, Comprehension
17. **Topic Detail** — Content page per topic with AI explanations
18. **Previous Year Papers** — Year-wise and topic-wise analysis
19. **PYQ Analysis** — AI-generated "which topics appear most" charts
20. **Current Affairs Daily** — AI-curated from NDA perspective
21. **Current Affairs Monthly Compilation**
22. **Current Affairs Quiz** — Quick quiz on recent affairs
23. **Notes** — Student's personal notes (create/edit)
24. **Bookmarks** — Saved questions/topics
25. **Revision Planner** — Spaced repetition schedule
26. **Formula Sheet** — Quick reference for Maths formulas
27. **Vocabulary Builder** — Daily word lists

### D. Practice & Tests (12)
28. **Mock Test List** — Full-length NDA mock tests
29. **Mock Test Engine** — Timer, negative marking, question navigation
30. **Test Results** — Score breakdown, AI analysis per question
31. **Test History** — All past tests with trends
32. **Subject-wise Practice** — Maths / GAT / English specific tests
33. **Adaptive Practice** — AI adjusts difficulty based on performance
34. **Daily Challenge** — One challenge per day, streak-linked
35. **Speed Test** — 10 questions, 5 min, test quick thinking
36. **Error Log** — All wrong answers organized by topic
37. **Weak Area Practice** — AI auto-picks questions from weak topics
38. **Question Bank** — Browse all questions by topic/difficulty
39. **Custom Test** — Create your own test by selecting topics

### E. SSB Preparation (12)
40. **SSB Overview** — What is SSB, stages explained
41. **OIR Practice** — Officer Intelligence Rating tests
42. **PPDT Practice** — Picture Perception + Discussion Test
43. **TAT Practice** — Thematic Apperception Test
44. **WAT Practice** — Word Association Test
45. **SRT Practice** — Situation Reaction Test
46. **SDT Practice** — Self Description Test
47. **Mock GD** — AI-simulated Group Discussion
48. **Mock Interview** — AI conducts SSB-style interview
49. **Personality Tips** — Body language, communication
50. **Screen-out Analysis** — Why people get screened out (founder's experience)
51. **SSB Study Plan** — Dedicated SSB prep schedule

### F. AI Features (6)
52. **AI Tutor Chat** — Full streaming conversational AI, personalized per student
53. **AI Doubt Solver** — Ask specific questions, get step-by-step solutions
54. **AI Test Analyzer** — Deep analysis after each test
55. **AI Study Plan Generator** — Regenerate/customize plan
56. **AI Motivation** — Daily personalized motivation based on streak/score
57. **AI Weak Area Detector** — Auto-identifies patterns from test data

### G. Community (6)
58. **Community Feed** — Questions, discussions filtered by batch
59. **Ask a Question** — Post doubts for peers
60. **Mentor Connect** — Connect with NDA-cleared mentors
61. **Study Partner** — Find accountability partners by state/attempt
62. **Success Stories** — Verified NDA success journeys
63. **Batch Groups** — NDA 1 2026, NDA 2 2026 batch communities

### H. Fitness & Medical (4)
64. **Fitness Plan** — Service-specific (Army/Navy/Air Force)
65. **Running Tracker** — Log daily runs
66. **Medical Standards** — Height/weight/eyesight requirements
67. **Fitness Test Simulator** — What scores you need

### I. Girls NDA Section (3)
68. **Girls NDA Info** — Specific guidance for girl candidates
69. **Girls Community** — Dedicated community space
70. **Girls Success Stories** — Female NDA selections

### J. Resources (4)
71. **Recommended Books** — AI-curated reading list
72. **Video Lectures** — Embedded video content
73. **Downloads** — PDFs, formula sheets, quick references
74. **FAQ** — Common NDA questions

### K. Admin Panel (6)
75. **Admin Dashboard** — User stats, active users, popular features
76. **User Management** — View/ban/unban users
77. **Content Management** — Add/edit questions, topics, current affairs
78. **Feedback & Reports** — View user feedback and bug reports
79. **Admin Settings** — API key configuration, footer link, admin password
80. **Analytics** — Usage charts, test completion rates

---

## Technical Architecture

### Frontend
- **React + TypeScript + Tailwind + shadcn/ui** (existing stack)
- **3D Visuals**: `@react-three/fiber@^8.18` + `@react-three/drei@^9.122.0` + `three@^0.160` for 3D shield/globe on landing, 3D DNA helix on dashboard
- **i18n**: Context-based Hindi/English switching (no library, custom context with translation objects)
- **Theme**: `next-themes` (already installed) for dark/light mode
- **Charts**: `recharts` (already installed) for progress, analytics
- **Markdown**: `react-markdown` for AI chat rendering
- **State**: React Context for user profile, language, theme; React Query for server state

### Backend (Lovable Cloud / Supabase)
**Database Tables:**
- `profiles` — name, username, state, gender, attempt, target_exam, service, medium, challenge, study_hours, dna_score
- `user_roles` — admin role system (security definer pattern)
- `user_activity` — page_visited, action_type, duration, timestamp (behavioral tracking)
- `test_results` — test_id, subject, score, questions_data, ai_analysis
- `chat_history` — conversation_id, messages, context
- `study_plans` — daily/weekly AI-generated plans
- `notifications` — AI-triggered smart notifications
- `feedback` — user feedback submissions
- `daily_challenges` — daily challenge data
- `bookmarks` — saved items
- `notes` — personal notes
- `streaks` — login/study streaks
- `admin_settings` — API keys, config

**Edge Functions:**
- `ai-chat` — Streaming AI tutor with full personalization context
- `ai-study-plan` — Generate personalized study plans
- `ai-test-analysis` — Analyze test results with AI
- `ai-context-builder` — Build personalization context from user data
- `ai-current-affairs` — AI-curated current affairs
- `ai-motivation` — Daily personalized motivation

### AI Integration
- **Model**: `google/gemini-3-flash-preview` via Lovable AI Gateway
- **Auth**: `LOVABLE_API_KEY` (already available)
- **Streaming**: SSE token-by-token for chat
- **Non-streaming**: `supabase.functions.invoke()` for study plans, analysis
- **Context injection**: Every AI call includes the full personalization context built from the student's profile + activity data

### Images
- NDA campus, army officers, cadets from Unsplash (free, no API needed)
- User-uploaded logo used in navbar and favicon

---

## Implementation Order

Since the user wants everything at once, we will build in rapid succession:

**Batch 1**: Theme system, i18n system, layout (navbar + sidebar), landing page with 3D, auth pages (login + 4-step signup)

**Batch 2**: Database setup (all tables + RLS + triggers), profile page, settings, dashboard with AI greeting

**Batch 3**: AI edge functions (chat, study plan, test analysis, context builder), AI tutor chat page

**Batch 4**: Study hubs (Maths/GAT/English), topic detail, practice test engine, test results

**Batch 5**: SSB section (all 12 pages), daily challenge, adaptive practice

**Batch 6**: Community, fitness, girls section, resources, notifications

**Batch 7**: Admin panel (all 6 pages), feedback system, leaderboard

**Batch 8**: 3D visuals (DNA helix, shield), animations, polish

---

## Key Design Decisions
- **No mock data anywhere** — all content is AI-generated or user-created at runtime
- **3D animations** on landing (shield/globe), dashboard (DNA helix), and loading states
- **Military color theme** matching logo: navy (#0B1628), gold (#C9A84C), green (#00C853), cyan (#00BCD4)
- **Real army/NDA photos** from Unsplash replacing all emojis
- **Footer**: "Devrayog AI" linked to https://v0-devrayog.vercel.app
- **Admin API key field**: Placeholder in admin settings for future custom AI API key

This is a massive build. I will start with Batch 1 and move through all batches systematically. Each batch will produce fully working pages.

