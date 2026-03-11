import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen, Brain, Shield, BarChart3, Target, Users, Dumbbell, Download, MessageSquare,
  Trophy, Zap, Calendar, FileText, Star, HelpCircle, ArrowRight, Sparkles, Lightbulb,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";

const sections = [
  {
    title: "🏠 Dashboard — Your Command Center",
    icon: BarChart3,
    content: `When you log in, you land on the **Dashboard**. Think of it like the cockpit of a fighter jet — everything you need is right here.

**What you'll see:**
- **DNA Score** — Your overall preparation score (0-100%). The AI calculates this based on your test results, study time, accuracy, and streaks. Higher = better prepared.
- **Study Streak** — How many consecutive days you've studied. Keep it going — consistency wins!
- **Quick Stats** — Total questions solved, accuracy %, study time.
- **Daily Challenge** — A fresh set of questions every day. Complete it to boost your streak.
- **Exam Countdown** — Shows exactly how many days are left until your target NDA exam.
- **AI Motivation** — An AI-generated motivational quote just for you, updated daily.

**Tip for beginners:** Don't worry if your DNA Score is low initially. It's designed to go up as you study more!`,
  },
  {
    title: "🤖 AI Tutor — Your Personal Teacher",
    icon: Brain,
    content: `The **AI Tutor** is like having a personal teacher available 24/7. You can ask it ANYTHING about NDA preparation.

**What you can do:**
- Ask doubts about any topic — "Explain trigonometry identities" or "What is the difference between Army and Navy?"
- Get explanations in Hindi or English
- Upload images of questions — the AI will read and solve them
- Ask for study tips, exam strategies, or motivation

**How to use it:**
1. Go to **AI Tutor** from the sidebar
2. Type your question in the chat box
3. Press Send or hit Enter
4. The AI will respond with a detailed answer
5. You can continue the conversation — it remembers context!

**Pro tip:** The more specific your question, the better the answer. Instead of "explain maths," try "explain how to solve quadratic equations using the discriminant method."`,
  },
  {
    title: "📚 Study Sections — Maths, GAT, English",
    icon: BookOpen,
    content: `The Platform covers all three sections of the NDA exam:

**Maths Hub** (/study/maths)
- All NDA Maths topics: Algebra, Trigonometry, Calculus, Geometry, Statistics, etc.
- Each topic has theory notes + practice MCQs
- Difficulty levels: Easy → Medium → Hard

**GAT Hub** (/study/gat) — General Ability Test
- Physics, Chemistry, Biology
- History, Geography, Political Science
- Economics, General Science, Current Affairs

**English Hub** (/study/english)
- Grammar, Vocabulary, Comprehension
- Spotting errors, sentence correction
- Vocabulary Builder with daily words

**How to study a topic:**
1. Go to the subject hub (e.g., Maths Hub)
2. Click on any topic (e.g., "Trigonometry")
3. Read the theory/notes section
4. Practice MCQs at the bottom
5. Your results automatically update your DNA Score

**Vocabulary Builder:** Go to /vocabulary — learn 10 new words daily with meanings, examples, and a quiz!

**Formula Sheet:** Go to /formulas — all important Maths & Physics formulas in one page for quick revision.`,
  },
  {
    title: "📝 Tests & Mock Tests",
    icon: Target,
    content: `Testing yourself is the most important part of preparation!

**Mock Tests** (/tests)
- Full-length NDA mock tests with timer
- Subject-wise tests (Maths only, GAT only, English only)
- Real exam-like interface with negative marking
- After completing: detailed analysis with AI insights

**Daily Challenge** (/daily-challenge)
- 10 mixed questions every day
- Takes just 10-15 minutes
- Keeps your streak alive

**Question Bank** (/question-bank)
- Browse ALL available questions
- Filter by subject, topic, difficulty
- Great for targeted practice

**Previous Year Questions (PYQ)** (/pyq)
- Real questions from past NDA exams
- Filter by year and paper
- Understand exam patterns

**Error Log** (/error-log)
- Every question you got wrong is saved here
- The AI creates a review schedule for you
- Revisit mistakes until you master them

**How Mock Tests Work:**
1. Go to Tests → Select a test
2. Click "Start Test" — timer begins
3. Answer questions (you can skip and come back)
4. Click "Submit" when done
5. See your score, accuracy, and AI analysis
6. Wrong answers go to your Error Log automatically`,
  },
  {
    title: "🎖️ SSB Interview Preparation",
    icon: Shield,
    content: `SSB (Services Selection Board) interview is the second stage after clearing the NDA written exam.

**SSB Overview** (/ssb) — Understanding the 5-day SSB process

**Practice sections:**
- **OIR Practice** (/ssb/oir) — Officer Intelligence Rating tests
- **PPDT Practice** (/ssb/ppdt) — Picture Perception & Discussion Test. You see an image and write a story.
- **TAT Practice** (/ssb/tat) — Thematic Apperception Test. Write stories based on pictures.
- **WAT Practice** (/ssb/wat) — Word Association Test. Quick word responses.
- **SRT Practice** (/ssb/srt) — Situation Reaction Test. How you'd react in situations.
- **SDT Practice** (/ssb/sdt) — Self Description Test.

**Personality Tips** (/ssb/personality) — AI tips on building Officer Like Qualities (OLQs)

**Screen-out Analysis** (/ssb/screenout) — Understand why candidates get screened out and how to avoid it

**Note:** Some SSB sections are marked "Coming Soon" — they are under development.`,
  },
  {
    title: "🏋️ Physical Fitness",
    icon: Dumbbell,
    content: `Physical fitness is mandatory for NDA selection.

**Fitness Plan** (/fitness)
- AI-generated workout plans based on your current fitness level
- Covers running, push-ups, sit-ups, chin-ups, and more
- Progressive difficulty — starts easy, gets harder

**Running Tracker** (/fitness/running)
- Log your daily runs (distance & time)
- Track your 2.4km run time improvement
- See your running history in charts

**Medical Standards** (/fitness/medical)
- Complete NDA medical requirements
- Height & weight standards for each branch
- Vision requirements and common disqualifications

**Tip:** Start running NOW. Don't wait until after the written exam. Many candidates clear the written but fail in physical fitness.`,
  },
  {
    title: "📰 Current Affairs",
    icon: Zap,
    content: `Current Affairs is a crucial part of GAT (General Ability Test).

**Current Affairs Page** (/current-affairs)
- Daily updates on national, international, defence, sports, economy, and science news
- Articles are curated and added by our admin team using AI
- Filter by category
- Bookmark important articles for revision

**How to use:**
1. Visit the Current Affairs page daily
2. Read at least 5-10 articles
3. Bookmark important ones
4. The AI may include related questions in your tests`,
  },
  {
    title: "📒 Notes & Bookmarks",
    icon: FileText,
    content: `**Notes** (/notes)
- Create your own study notes
- Organize by subject
- Add tags for easy searching
- Rich text editor

**Bookmarks** (/bookmarks)
- Bookmark any question, article, or resource
- Quick access to everything you've saved
- Great for last-minute revision

**How to bookmark:**
- Look for the bookmark icon (🔖) on questions, articles, and resources
- Click it to save
- Access all bookmarks from the Bookmarks page`,
  },
  {
    title: "👥 Community & Chat",
    icon: Users,
    content: `Connect with fellow NDA aspirants!

**Community** (/community)
- Post questions, share tips, and discuss topics
- Like and reply to posts
- Categories: General, Study Help, Motivation, SSB Prep

**Realtime Chat** (/community/chat)
- Live chat with other aspirants
- Different channels for different topics
- Great for group study sessions

**Mentor Connect** (/mentors) — Connect with ex-NDA cadets and mentors

**Study Partner** (/study-partner) — Find study partners based on target exam and state

**Success Stories** (/success-stories) — Read stories of candidates who cleared NDA

**Community Rules:**
- Be respectful and helpful
- No spam or self-promotion
- No sharing of copyrighted exam papers
- Report inappropriate content`,
  },
  {
    title: "🏆 Achievements & Leaderboard",
    icon: Trophy,
    content: `**Achievements** (/achievements)
- Unlock badges by completing milestones
- Examples: "Solved 100 questions," "7-day streak," "First mock test"
- Some achievements are hidden — discover them by exploring!

**Leaderboard** (/leaderboard)
- See how you rank against other aspirants
- Ranked by DNA Score
- Filter by state or target exam
- Top performers get featured

**DNA Score** (/dna-score)
- Detailed breakdown of your preparation score
- Factors: Test scores, Accuracy, Consistency, Topics covered, Study time
- AI recommendations on how to improve each factor`,
  },
  {
    title: "📥 Resources & Downloads",
    icon: Download,
    content: `**Resources** (/resources)
- Curated study materials, guides, and tips

**Recommended Books** (/resources/books)
- Best books for NDA preparation
- Books for Maths, English, GK, and SSB

**Video Lectures** (/resources/videos)
- Curated video resources for visual learners

**Downloads** (/resources/downloads)
- Downloadable PDFs, formula sheets, and study materials

**FAQ** (/faq)
- Frequently asked questions about NDA exam, eligibility, syllabus, and more`,
  },
  {
    title: "⚙️ Settings & Profile",
    icon: HelpCircle,
    content: `**Profile** (/profile)
- View and update your personal information
- Change avatar
- See your stats and achievements

**Settings** (/settings)
- **Theme:** Switch between Dark and Light mode
- **Language:** Switch between English and Hindi
- **Notifications:** Control what alerts you receive
  - Daily study reminder
  - Mock test reminders
  - Current affairs updates
  - Streak reminders
  - Exam countdown alerts
  - Community reply notifications

**Tip:** Set your study reminder time to match your daily study schedule!`,
  },
  {
    title: "👩 Girls NDA Section",
    icon: Star,
    content: `**Girls NDA** (/girls)
- Special section for female NDA aspirants
- Information about girls' eligibility for NDA (started from 2022)
- Specific tips and resources
- Community of female aspirants

If you marked "I am a girl candidate" during signup, you'll see additional personalized content throughout the Platform.`,
  },
  {
    title: "💎 Premium Features",
    icon: Sparkles,
    content: `**Premium** (/premium)
- Starts at just ₹11/month
- Unlimited AI Tutor conversations
- All mock tests unlocked
- Priority support
- Advanced analytics and insights
- Ad-free experience

**Free users still get:**
- Access to all study materials
- Daily challenges
- Community access
- Basic AI features
- Error log and bookmarks`,
  },
];

export default function Guide() {
  const [dbSections, setDbSections] = useState<{ title: string; icon: any; content: string }[] | null>(null);

  useEffect(() => {
    supabase.from("guide_sections").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setDbSections(data.map((s: any) => ({
            title: s.title,
            icon: BookOpen, // fallback icon
            content: s.content,
          })));
        }
      });
  }, []);

  const activeSections = dbSections && dbSections.length > 0 ? dbSections : sections;
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] text-primary tracking-widest mb-2">COMPLETE PLATFORM GUIDE</p>
            <h1 className="font-display text-4xl md:text-5xl text-gradient-gold mb-4">How to Use Devrayog NDA AI</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              This guide explains every feature of the platform in simple language. Whether you're in 8th class or 12th class, 
              by the end of this guide you'll know exactly how to use every tool to prepare for NDA.
            </p>
          </div>

          {/* Quick Start */}
          <Card className="mb-8 border-primary/30 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Lightbulb className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-display text-2xl text-gradient-gold mb-2">⚡ Quick Start (5 Minutes)</h2>
                  <ol className="space-y-2 text-sm">
                    <li><strong>1.</strong> Go to your <Link to="/dashboard" className="text-primary hover:underline font-semibold">Dashboard</Link> — see your DNA Score and today's challenge.</li>
                    <li><strong>2.</strong> Complete the <Link to="/daily-challenge" className="text-primary hover:underline font-semibold">Daily Challenge</Link> — 10 questions, 10 minutes.</li>
                    <li><strong>3.</strong> Open <Link to="/ai-tutor" className="text-primary hover:underline font-semibold">AI Tutor</Link> — ask any doubt you have right now.</li>
                    <li><strong>4.</strong> Visit <Link to="/study/maths" className="text-primary hover:underline font-semibold">Maths Hub</Link> or <Link to="/study/gat" className="text-primary hover:underline font-semibold">GAT Hub</Link> — start studying a topic.</li>
                    <li><strong>5.</strong> Check <Link to="/current-affairs" className="text-primary hover:underline font-semibold">Current Affairs</Link> — read today's news.</li>
                  </ol>
                  <p className="text-muted-foreground mt-3 text-xs">That's it! Do this every day and your DNA Score will keep improving. 🚀</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Sections */}
          <Accordion type="multiple" className="space-y-3">
            {sections.map((section, i) => (
              <AccordionItem key={i} value={`section-${i}`} className="border border-border/50 rounded-xl px-1 data-[state=open]:border-primary/30">
                <AccordionTrigger className="px-4 py-4 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <section.icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="font-display text-lg">{section.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {section.content.split("\n\n").map((paragraph, pi) => {
                      if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                        return <h3 key={pi} className="font-display text-base mt-4 mb-2">{paragraph.replace(/\*\*/g, "")}</h3>;
                      }
                      if (paragraph.startsWith("- ") || paragraph.startsWith("1. ")) {
                        const items = paragraph.split("\n").filter(Boolean);
                        const isOrdered = paragraph.startsWith("1.");
                        const ListTag = isOrdered ? "ol" : "ul";
                        return (
                          <ListTag key={pi} className="space-y-1 my-2">
                            {items.map((item, ii) => (
                              <li key={ii} className="text-sm" dangerouslySetInnerHTML={{
                                __html: item.replace(/^[-\d.]+\s*/, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              }} />
                            ))}
                          </ListTag>
                        );
                      }
                      return (
                        <p key={pi} className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{
                          __html: paragraph.replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground'>$1</strong>")
                        }} />
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <h2 className="font-display text-2xl text-gradient-gold mb-4">Ready to Start? 🚀</h2>
            <p className="text-muted-foreground mb-6">You now know everything about the platform. Time to study!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="bg-gradient-gold text-primary-foreground font-bold tracking-widest px-8">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/ai-tutor">
                <Button size="lg" variant="outline" className="border-gold font-bold tracking-widest px-8">
                  <Brain className="mr-2 h-4 w-4" /> Ask AI Tutor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
