import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import AITutor from "@/pages/AITutor";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected — Core */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><PlaceholderPage title="NOTIFICATIONS" description="Smart AI-triggered notifications based on your study patterns." /></ProtectedRoute>} />
      <Route path="/achievements" element={<ProtectedRoute><PlaceholderPage title="ACHIEVEMENTS" description="Earn badges as you progress in your NDA preparation." /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><PlaceholderPage title="LEADERBOARD" description="See how you rank among fellow aspirants in your state and batch." /></ProtectedRoute>} />
      <Route path="/activity" element={<ProtectedRoute><PlaceholderPage title="ACTIVITY LOG" description="Track your complete study history and patterns." /></ProtectedRoute>} />
      <Route path="/dna-score" element={<ProtectedRoute><PlaceholderPage title="DNA SCORE DETAILS" description="Full breakdown of your NDA readiness score across all subjects." /></ProtectedRoute>} />

      {/* Protected — AI */}
      <Route path="/ai-tutor" element={<ProtectedRoute><AITutor /></ProtectedRoute>} />

      {/* Protected — Study */}
      <Route path="/study-plan" element={<ProtectedRoute><PlaceholderPage title="STUDY PLAN" description="AI-generated daily and weekly study plans based on your weakness and exam date." /></ProtectedRoute>} />
      <Route path="/study/maths" element={<ProtectedRoute><PlaceholderPage title="MATHS HUB" description="AI-recommended topic order based on your weakness analysis." /></ProtectedRoute>} />
      <Route path="/study/gat" element={<ProtectedRoute><PlaceholderPage title="GAT / GK HUB" description="History, Geography, Science, Polity — organized by NDA weightage." /></ProtectedRoute>} />
      <Route path="/study/english" element={<ProtectedRoute><PlaceholderPage title="ENGLISH HUB" description="Grammar, Vocabulary, Comprehension — improve your English score." /></ProtectedRoute>} />
      <Route path="/current-affairs" element={<ProtectedRoute><PlaceholderPage title="CURRENT AFFAIRS" description="AI-curated daily current affairs from NDA exam perspective." /></ProtectedRoute>} />
      <Route path="/pyq" element={<ProtectedRoute><PlaceholderPage title="PREVIOUS YEAR PAPERS" description="Year-wise and topic-wise analysis of NDA previous year questions." /></ProtectedRoute>} />
      <Route path="/notes" element={<ProtectedRoute><PlaceholderPage title="MY NOTES" description="Create and organize your personal study notes." /></ProtectedRoute>} />
      <Route path="/bookmarks" element={<ProtectedRoute><PlaceholderPage title="BOOKMARKS" description="Your saved questions, topics, and resources." /></ProtectedRoute>} />
      <Route path="/revision" element={<ProtectedRoute><PlaceholderPage title="REVISION PLANNER" description="Spaced repetition schedule — AI brings back topics you're forgetting." /></ProtectedRoute>} />
      <Route path="/formulas" element={<ProtectedRoute><PlaceholderPage title="FORMULA SHEET" description="Quick reference for all important Maths formulas." /></ProtectedRoute>} />
      <Route path="/vocabulary" element={<ProtectedRoute><PlaceholderPage title="VOCABULARY BUILDER" description="Daily word lists to improve your English score." /></ProtectedRoute>} />

      {/* Protected — Tests */}
      <Route path="/tests" element={<ProtectedRoute><PlaceholderPage title="MOCK TESTS" description="Full-length NDA mock tests with timer and negative marking." /></ProtectedRoute>} />
      <Route path="/daily-challenge" element={<ProtectedRoute><PlaceholderPage title="DAILY CHALLENGE" description="One challenge per day — keep your streak alive!" /></ProtectedRoute>} />
      <Route path="/error-log" element={<ProtectedRoute><PlaceholderPage title="ERROR LOG" description="All your wrong answers organized by topic for targeted revision." /></ProtectedRoute>} />
      <Route path="/question-bank" element={<ProtectedRoute><PlaceholderPage title="QUESTION BANK" description="Browse all questions by topic and difficulty level." /></ProtectedRoute>} />

      {/* Protected — SSB */}
      <Route path="/ssb" element={<ProtectedRoute><PlaceholderPage title="SSB PREPARATION" description="Complete SSB prep — OIR, PPDT, TAT, WAT, SRT, SDT, Mock Interview." /></ProtectedRoute>} />
      <Route path="/ssb/oir" element={<ProtectedRoute><PlaceholderPage title="OIR PRACTICE" description="Officer Intelligence Rating test practice." /></ProtectedRoute>} />
      <Route path="/ssb/ppdt" element={<ProtectedRoute><PlaceholderPage title="PPDT PRACTICE" description="Picture Perception and Discussion Test practice." /></ProtectedRoute>} />
      <Route path="/ssb/tat" element={<ProtectedRoute><PlaceholderPage title="TAT PRACTICE" description="Thematic Apperception Test practice with AI feedback." /></ProtectedRoute>} />
      <Route path="/ssb/wat" element={<ProtectedRoute><PlaceholderPage title="WAT PRACTICE" description="Word Association Test — quick response training." /></ProtectedRoute>} />
      <Route path="/ssb/srt" element={<ProtectedRoute><PlaceholderPage title="SRT PRACTICE" description="Situation Reaction Test — build officer-like responses." /></ProtectedRoute>} />
      <Route path="/ssb/sdt" element={<ProtectedRoute><PlaceholderPage title="SDT PRACTICE" description="Self Description Test practice." /></ProtectedRoute>} />
      <Route path="/ssb/gd" element={<ProtectedRoute><PlaceholderPage title="MOCK GD" description="AI-simulated Group Discussion practice." /></ProtectedRoute>} />
      <Route path="/ssb/interview" element={<ProtectedRoute><PlaceholderPage title="MOCK INTERVIEW" description="AI conducts SSB-style personal interview." /></ProtectedRoute>} />
      <Route path="/ssb/personality" element={<ProtectedRoute><PlaceholderPage title="PERSONALITY TIPS" description="Body language, communication, and officer-like qualities." /></ProtectedRoute>} />
      <Route path="/ssb/screenout" element={<ProtectedRoute><PlaceholderPage title="SCREEN-OUT ANALYSIS" description="Why people get screened out — real experience analysis." /></ProtectedRoute>} />

      {/* Protected — Community */}
      <Route path="/community" element={<ProtectedRoute><PlaceholderPage title="COMMUNITY" description="Connect with fellow NDA aspirants, ask questions, share strategies." /></ProtectedRoute>} />
      <Route path="/mentors" element={<ProtectedRoute><PlaceholderPage title="MENTOR CONNECT" description="Connect with NDA-cleared officers for guidance." /></ProtectedRoute>} />
      <Route path="/study-partner" element={<ProtectedRoute><PlaceholderPage title="STUDY PARTNER" description="Find accountability partners by state and attempt." /></ProtectedRoute>} />
      <Route path="/success-stories" element={<ProtectedRoute><PlaceholderPage title="SUCCESS STORIES" description="Real NDA selection stories and strategies that worked." /></ProtectedRoute>} />

      {/* Protected — Fitness */}
      <Route path="/fitness" element={<ProtectedRoute><PlaceholderPage title="FITNESS PLAN" description="Service-specific fitness plan — Army, Navy, Air Force." /></ProtectedRoute>} />
      <Route path="/fitness/running" element={<ProtectedRoute><PlaceholderPage title="RUNNING TRACKER" description="Log your daily runs and track improvement." /></ProtectedRoute>} />
      <Route path="/fitness/medical" element={<ProtectedRoute><PlaceholderPage title="MEDICAL STANDARDS" description="Height, weight, eyesight requirements for NDA." /></ProtectedRoute>} />

      {/* Protected — Resources */}
      <Route path="/resources" element={<ProtectedRoute><PlaceholderPage title="RESOURCES" description="Books, video lectures, downloads, and FAQ." /></ProtectedRoute>} />
      <Route path="/resources/books" element={<ProtectedRoute><PlaceholderPage title="RECOMMENDED BOOKS" description="AI-curated reading list for NDA preparation." /></ProtectedRoute>} />
      <Route path="/resources/videos" element={<ProtectedRoute><PlaceholderPage title="VIDEO LECTURES" description="Curated video content for each subject." /></ProtectedRoute>} />
      <Route path="/resources/downloads" element={<ProtectedRoute><PlaceholderPage title="DOWNLOADS" description="PDFs, formula sheets, and quick references." /></ProtectedRoute>} />
      <Route path="/faq" element={<ProtectedRoute><PlaceholderPage title="FAQ" description="Frequently asked questions about NDA exam." /></ProtectedRoute>} />

      {/* Protected — Girls Section */}
      <Route path="/girls" element={<ProtectedRoute><PlaceholderPage title="GIRLS NDA SECTION" description="Specific guidance and community for girl candidates." /></ProtectedRoute>} />

      {/* Protected — Admin */}
      <Route path="/admin" element={<ProtectedRoute><PlaceholderPage title="ADMIN DASHBOARD" description="Admin panel — user stats, content management, analytics." /></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
