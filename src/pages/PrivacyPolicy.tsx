import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 px-4 pb-12">
        <div className="max-w-3xl mx-auto prose prose-sm dark:prose-invert">
          <h1 className="font-display text-4xl text-gradient-gold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground font-mono text-xs tracking-widest mb-8">LAST UPDATED: MARCH 8, 2026</p>

          <h2>1. Introduction</h2>
          <p>Devrayog NDA AI ("we," "our," "Platform") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share your information when you use our educational platform.</p>

          <h2>2. Information We Collect</h2>
          <h3>2.1 Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> Full name, username, email address, password, state, gender, and NDA preparation details (attempt number, target exam, study preferences).</li>
            <li><strong>Profile Data:</strong> Avatar, service preference (Army/Navy/Air Force), study medium (English/Hindi), challenges faced.</li>
            <li><strong>Content:</strong> Notes, bookmarks, community posts, chat messages, feedback submissions.</li>
          </ul>

          <h3>2.2 Information Collected Automatically</h3>
          <ul>
            <li><strong>Usage Data:</strong> Pages visited, features used, study time, questions attempted, test scores, and accuracy metrics.</li>
            <li><strong>Device Information:</strong> Browser type, device type, screen resolution.</li>
            <li><strong>AI Interaction Data:</strong> Conversations with AI Tutor (used to improve responses).</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <ul>
            <li><strong>Personalization:</strong> AI uses your data to create personalized study plans, track DNA Score, and recommend content.</li>
            <li><strong>Platform Improvement:</strong> Analyzing usage patterns to improve features and content quality.</li>
            <li><strong>Communication:</strong> Sending study reminders, exam countdown alerts, and important announcements (configurable in settings).</li>
            <li><strong>Leaderboard & Community:</strong> Displaying your username, DNA score, and streak on public leaderboards (you can opt out).</li>
            <li><strong>Error Tracking:</strong> Your wrong answers are logged in the Error Log to help you review and improve.</li>
          </ul>

          <h2>4. Data Storage & Security</h2>
          <ul>
            <li>Your data is stored securely using industry-standard cloud infrastructure.</li>
            <li>Passwords are hashed and never stored in plain text.</li>
            <li>All data transmission uses HTTPS encryption.</li>
            <li>We implement Row-Level Security (RLS) to ensure users can only access their own data.</li>
            <li>Admin access is role-based and restricted.</li>
          </ul>

          <h2>5. Data Sharing</h2>
          <p>We do <strong>NOT</strong> sell your personal data. We may share data in these cases:</p>
          <ul>
            <li><strong>Service Providers:</strong> AI services (for generating content), payment processors, and cloud hosting.</li>
            <li><strong>Legal Requirements:</strong> If required by law or to protect rights and safety.</li>
            <li><strong>Aggregated Analytics:</strong> Non-personally identifiable statistics may be shared publicly (e.g., "10,000+ students use our Platform").</li>
          </ul>

          <h2>6. AI & Machine Learning</h2>
          <ul>
            <li>Our AI uses your study data to provide personalized recommendations.</li>
            <li>AI-generated content is created by third-party AI models (Google Gemini, etc.).</li>
            <li>Your conversations with AI Tutor may be used to improve AI response quality.</li>
            <li>You can delete your AI chat history at any time from Settings.</li>
          </ul>

          <h2>7. Your Rights</h2>
          <ul>
            <li><strong>Access:</strong> You can view all your data from your Profile and Settings pages.</li>
            <li><strong>Correction:</strong> Update your profile information at any time.</li>
            <li><strong>Deletion:</strong> Request account deletion by contacting us. This will permanently delete all your data.</li>
            <li><strong>Data Export:</strong> You can export your notes and test history.</li>
            <li><strong>Notification Control:</strong> Customize all notification preferences in Settings.</li>
          </ul>

          <h2>8. Cookies & Local Storage</h2>
          <ul>
            <li>We use local storage for theme preferences, language selection, and session management.</li>
            <li>We use session storage for splash screen state.</li>
            <li>No third-party tracking cookies are used for advertising.</li>
          </ul>

          <h2>9. Children's Privacy</h2>
          <p>Our Platform is designed for NDA aspirants, typically aged 15-19. Users under 13 are not permitted. Users aged 13-17 should use the Platform under parental guidance. We do not knowingly collect data from children under 13.</p>

          <h2>10. Data Retention</h2>
          <ul>
            <li>Account data is retained as long as your account is active.</li>
            <li>Test results and study history are retained for performance tracking.</li>
            <li>Deleted accounts have their data purged within 30 days.</li>
            <li>Community posts may remain even after account deletion (anonymized).</li>
          </ul>

          <h2>11. Changes to Privacy Policy</h2>
          <p>We may update this policy periodically. Changes will be communicated via in-app notification. Continued use after changes constitutes acceptance.</p>

          <h2>12. Contact Us</h2>
          <p>For privacy concerns or data requests:</p>
          <ul>
            <li>Website: <a href="https://v0-devrayog.vercel.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">devrayog.vercel.app</a></li>
            <li>Platform: <a href="https://devrayog-nda.lovable.app" className="text-primary hover:underline">devrayog-nda.lovable.app</a></li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
