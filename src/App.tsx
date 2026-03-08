import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import SplashScreen from "@/components/SplashScreen";
import { SpotlightGlow, NoiseOverlay } from "@/components/ModernAnimations";

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
import NotFound from "@/pages/NotFound";
import Notifications from "@/pages/Notifications";
import Leaderboard from "@/pages/Leaderboard";
import ActivityLog from "@/pages/ActivityLog";
import DNAScoreDetails from "@/pages/DNAScoreDetails";
import StudyPlan from "@/pages/StudyPlan";
import CurrentAffairs from "@/pages/CurrentAffairs";
import Notes from "@/pages/Notes";
import Bookmarks from "@/pages/Bookmarks";
import PYQ from "@/pages/PYQ";
import ErrorLog from "@/pages/ErrorLog";
import Feedback from "@/pages/Feedback";
import GirlsNDA from "@/pages/GirlsNDA";
import PlaceholderPage from "@/pages/PlaceholderPage";
import Achievements from "@/pages/Achievements";
import DiagnosticTest from "@/pages/DiagnosticTest";

// Study
import MathsHub from "@/pages/study/MathsHub";
import GATHub from "@/pages/study/GATHub";
import EnglishHub from "@/pages/study/EnglishHub";
import TopicDetail from "@/pages/study/TopicDetail";
import VocabularyBuilder from "@/pages/study/VocabularyBuilder";
import FormulaSheet from "@/pages/study/FormulaSheet";
import RevisionPlanner from "@/pages/study/RevisionPlanner";

// Tests
import MockTestList from "@/pages/tests/MockTestList";
import MockTestEngine from "@/pages/tests/MockTestEngine";
import DailyChallenge from "@/pages/tests/DailyChallenge";

// SSB
import SSBOverview from "@/pages/ssb/SSBOverview";
import SSBPractice from "@/pages/ssb/SSBPractice";
import ScreenoutAnalysis from "@/pages/ssb/ScreenoutAnalysis";
import PersonalityTips from "@/pages/ssb/PersonalityTips";
import PPDTPractice from "@/pages/ssb/PPDTPractice";
import TATPractice from "@/pages/ssb/TATPractice";
import WATPractice from "@/pages/ssb/WATPractice";
import SRTPractice from "@/pages/ssb/SRTPractice";
import SDTPractice from "@/pages/ssb/SDTPractice";
import SSBComingSoon from "@/pages/ssb/SSBComingSoon";

// Community
import Community from "@/pages/community/Community";
import MentorConnect from "@/pages/community/MentorConnect";
import StudyPartner from "@/pages/community/StudyPartner";
import SuccessStories from "@/pages/community/SuccessStories";
import RealtimeChat from "@/pages/community/RealtimeChat";

// Fitness
import FitnessPlan from "@/pages/fitness/FitnessPlan";
import RunningTracker from "@/pages/fitness/RunningTracker";
import MedicalStandards from "@/pages/fitness/MedicalStandards";

// Resources
import Resources from "@/pages/resources/Resources";
import RecommendedBooks from "@/pages/resources/RecommendedBooks";
import VideoLectures from "@/pages/resources/VideoLectures";
import DownloadsPage from "@/pages/resources/Downloads";
import FAQPage from "@/pages/resources/FAQ";

// Admin
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminTopics from "@/pages/admin/AdminTopics";
import AdminQuestions from "@/pages/admin/AdminQuestions";
import AdminCurrentAffairs from "@/pages/admin/AdminCurrentAffairs";
import AdminPYQ from "@/pages/admin/AdminPYQ";
import AdminResources from "@/pages/admin/AdminResources";
import AdminFAQ from "@/pages/admin/AdminFAQ";
import AdminSSB from "@/pages/admin/AdminSSB";
import AdminSuccessStories from "@/pages/admin/AdminSuccessStories";
import QuestionBank from "@/pages/QuestionBank";
import Premium from "@/pages/Premium";

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
      <Route path="/premium" element={<Premium />} />

      {/* Protected — Core */}
      <Route path="/diagnostic" element={<ProtectedRoute><DiagnosticTest /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
      <Route path="/activity" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
      <Route path="/dna-score" element={<ProtectedRoute><DNAScoreDetails /></ProtectedRoute>} />
      <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />

      {/* Protected — AI */}
      <Route path="/ai-tutor" element={<ProtectedRoute><AITutor /></ProtectedRoute>} />

      {/* Protected — Study */}
      <Route path="/study-plan" element={<ProtectedRoute><StudyPlan /></ProtectedRoute>} />
      <Route path="/study/maths" element={<ProtectedRoute><MathsHub /></ProtectedRoute>} />
      <Route path="/study/gat" element={<ProtectedRoute><GATHub /></ProtectedRoute>} />
      <Route path="/study/english" element={<ProtectedRoute><EnglishHub /></ProtectedRoute>} />
      <Route path="/study/topic/:topicId" element={<ProtectedRoute><TopicDetail /></ProtectedRoute>} />
      <Route path="/current-affairs" element={<ProtectedRoute><CurrentAffairs /></ProtectedRoute>} />
      <Route path="/pyq" element={<ProtectedRoute><PYQ /></ProtectedRoute>} />
      <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
      <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
      <Route path="/revision" element={<ProtectedRoute><RevisionPlanner /></ProtectedRoute>} />
      <Route path="/formulas" element={<ProtectedRoute><FormulaSheet /></ProtectedRoute>} />
      <Route path="/vocabulary" element={<ProtectedRoute><VocabularyBuilder /></ProtectedRoute>} />

      {/* Protected — Tests */}
      <Route path="/tests" element={<ProtectedRoute><MockTestList /></ProtectedRoute>} />
      <Route path="/tests/take/:testId" element={<ProtectedRoute><MockTestEngine /></ProtectedRoute>} />
      <Route path="/daily-challenge" element={<ProtectedRoute><DailyChallenge /></ProtectedRoute>} />
      <Route path="/error-log" element={<ProtectedRoute><ErrorLog /></ProtectedRoute>} />
      <Route path="/question-bank" element={<ProtectedRoute><QuestionBank /></ProtectedRoute>} />

      {/* Protected — SSB */}
      <Route path="/ssb" element={<ProtectedRoute><SSBOverview /></ProtectedRoute>} />
      <Route path="/ssb/oir" element={<ProtectedRoute><SSBPractice /></ProtectedRoute>} />
      <Route path="/ssb/ppdt" element={<ProtectedRoute><PPDTPractice /></ProtectedRoute>} />
      <Route path="/ssb/tat" element={<ProtectedRoute><TATPractice /></ProtectedRoute>} />
      <Route path="/ssb/wat" element={<ProtectedRoute><WATPractice /></ProtectedRoute>} />
      <Route path="/ssb/srt" element={<ProtectedRoute><SRTPractice /></ProtectedRoute>} />
      <Route path="/ssb/sdt" element={<ProtectedRoute><SDTPractice /></ProtectedRoute>} />
      <Route path="/ssb/gd" element={<ProtectedRoute><SSBComingSoon /></ProtectedRoute>} />
      <Route path="/ssb/interview" element={<ProtectedRoute><SSBComingSoon /></ProtectedRoute>} />
      <Route path="/ssb/personality" element={<ProtectedRoute><PersonalityTips /></ProtectedRoute>} />
      <Route path="/ssb/screenout" element={<ProtectedRoute><ScreenoutAnalysis /></ProtectedRoute>} />

      {/* Protected — Community */}
      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      <Route path="/community/chat" element={<ProtectedRoute><RealtimeChat /></ProtectedRoute>} />
      <Route path="/mentors" element={<ProtectedRoute><MentorConnect /></ProtectedRoute>} />
      <Route path="/study-partner" element={<ProtectedRoute><StudyPartner /></ProtectedRoute>} />
      <Route path="/success-stories" element={<ProtectedRoute><SuccessStories /></ProtectedRoute>} />

      {/* Protected — Fitness */}
      <Route path="/fitness" element={<ProtectedRoute><FitnessPlan /></ProtectedRoute>} />
      <Route path="/fitness/running" element={<ProtectedRoute><RunningTracker /></ProtectedRoute>} />
      <Route path="/fitness/medical" element={<ProtectedRoute><MedicalStandards /></ProtectedRoute>} />

      {/* Protected — Resources */}
      <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
      <Route path="/resources/books" element={<ProtectedRoute><RecommendedBooks /></ProtectedRoute>} />
      <Route path="/resources/videos" element={<ProtectedRoute><VideoLectures /></ProtectedRoute>} />
      <Route path="/resources/downloads" element={<ProtectedRoute><DownloadsPage /></ProtectedRoute>} />
      <Route path="/faq" element={<ProtectedRoute><FAQPage /></ProtectedRoute>} />

      {/* Protected — Girls Section */}
      <Route path="/girls" element={<ProtectedRoute><GirlsNDA /></ProtectedRoute>} />

      {/* Protected — Admin */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/topics" element={<ProtectedRoute><AdminTopics /></ProtectedRoute>} />
      <Route path="/admin/topics/:topicId/questions" element={<ProtectedRoute><AdminQuestions /></ProtectedRoute>} />
      <Route path="/admin/current-affairs" element={<ProtectedRoute><AdminCurrentAffairs /></ProtectedRoute>} />
      <Route path="/admin/pyq" element={<ProtectedRoute><AdminPYQ /></ProtectedRoute>} />
      <Route path="/admin/resources" element={<ProtectedRoute><AdminResources /></ProtectedRoute>} />
      <Route path="/admin/faq" element={<ProtectedRoute><AdminFAQ /></ProtectedRoute>} />
      <Route path="/admin/ssb" element={<ProtectedRoute><AdminSSB /></ProtectedRoute>} />
      <Route path="/admin/success-stories" element={<ProtectedRoute><AdminSuccessStories /></ProtectedRoute>} />

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
