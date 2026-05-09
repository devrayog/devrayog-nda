import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PageVisibilityProvider } from "@/contexts/PageVisibilityContext";
import SplashScreen from "@/components/SplashScreen";
import { SpotlightGlow, NoiseOverlay } from "@/components/ModernAnimations";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Waitlist from "@/pages/Waitlist";
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
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Guide from "@/pages/Guide";

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
import FitnessEligibility from "@/pages/fitness/FitnessEligibility";
import MedicalEligibility from "@/pages/fitness/MedicalEligibility";

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
import AdminAI from "@/pages/admin/AdminAI";
import AdminMockQuestions from "@/pages/admin/AdminMockQuestions";
import AdminGuide from "@/pages/admin/AdminGuide";
import AdminReports from "@/pages/admin/AdminReports";
import AdminGirlsNDA from "@/pages/admin/AdminGirlsNDA";
import AdminVocabulary from "@/pages/admin/AdminVocabulary";
import AdminDailyTasks from "@/pages/admin/AdminDailyTasks";
import AdminOIR from "@/pages/admin/AdminOIR";
import AdminScreenout from "@/pages/admin/AdminScreenout";
import AdminFitness from "@/pages/admin/AdminFitness";
import AdminMedical from "@/pages/admin/AdminMedical";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminPremiumSettings from "@/pages/admin/AdminPremiumSettings";
import AdminAnnouncements from "@/pages/admin/AdminAnnouncements";
import AdminSEO from "@/pages/admin/AdminSEO";
import AdminCountdown from "@/pages/admin/AdminCountdown";
import QuestionBank from "@/pages/QuestionBank";
import Premium from "@/pages/Premium";
import InstallApp from "@/pages/InstallApp";
import InstallAppPrompt from "@/components/InstallAppPrompt";
import AnnouncementPopup from "@/components/AnnouncementPopup";

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
      <Route path="/signup" element={<Waitlist />} />
      <Route path="/get-inside" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/premium" element={<Premium />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/guide" element={<Guide />} />

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
      <Route path="/fitness/eligibility" element={<ProtectedRoute><FitnessEligibility /></ProtectedRoute>} />
      <Route path="/fitness/medical-check" element={<ProtectedRoute><MedicalEligibility /></ProtectedRoute>} />

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
      <Route path="/admin/ai" element={<ProtectedRoute><AdminAI /></ProtectedRoute>} />
      <Route path="/admin/mock-questions/:testId" element={<ProtectedRoute><AdminMockQuestions /></ProtectedRoute>} />
      <Route path="/admin/guide" element={<ProtectedRoute><AdminGuide /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
      <Route path="/admin/girls-nda" element={<ProtectedRoute><AdminGirlsNDA /></ProtectedRoute>} />
      <Route path="/admin/vocabulary" element={<ProtectedRoute><AdminVocabulary /></ProtectedRoute>} />
      <Route path="/admin/daily-tasks" element={<ProtectedRoute><AdminDailyTasks /></ProtectedRoute>} />
      <Route path="/admin/oir" element={<ProtectedRoute><AdminOIR /></ProtectedRoute>} />
      <Route path="/admin/screenout" element={<ProtectedRoute><AdminScreenout /></ProtectedRoute>} />
      <Route path="/admin/fitness" element={<ProtectedRoute><AdminFitness /></ProtectedRoute>} />
      <Route path="/admin/medical" element={<ProtectedRoute><AdminMedical /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/premium-settings" element={<ProtectedRoute><AdminPremiumSettings /></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute><AdminAnnouncements /></ProtectedRoute>} />
      <Route path="/admin/seo" element={<ProtectedRoute><AdminSEO /></ProtectedRoute>} />
      <Route path="/admin/countdown" element={<ProtectedRoute><AdminCountdown /></ProtectedRoute>} />
      <Route path="/install" element={<ProtectedRoute><InstallApp /></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function AppWithSplash() {
  const [splashDone, setSplashDone] = useState(false);
  const hasSeenSplash = sessionStorage.getItem("splash_seen");
  if (!hasSeenSplash && !splashDone) {
    return <SplashScreen onComplete={() => { sessionStorage.setItem("splash_seen", "1"); setSplashDone(true); }} />;
  }
  return (
    <>
      <SpotlightGlow />
      <NoiseOverlay />
      <InstallAppPrompt />
      <AnnouncementPopup />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <PageVisibilityProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AppWithSplash />
            </TooltipProvider>
          </PageVisibilityProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
