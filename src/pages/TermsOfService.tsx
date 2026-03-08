import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TermsOfService() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 px-4 pb-12">
        <div className="max-w-3xl mx-auto prose prose-sm dark:prose-invert">
          <h1 className="font-display text-4xl text-gradient-gold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground font-mono text-xs tracking-widest mb-8">LAST UPDATED: MARCH 8, 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using Devrayog NDA AI ("Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>

          <h2>2. About the Platform</h2>
          <p>Devrayog NDA AI is an AI-powered educational platform designed to help NDA (National Defence Academy) aspirants prepare for the NDA entrance examination, SSB interviews, and physical fitness tests. The Platform is built and maintained by Devrayog.</p>

          <h2>3. Eligibility</h2>
          <ul>
            <li>You must be at least 13 years old to use this Platform.</li>
            <li>If you are under 18, you confirm that you have parental or guardian consent.</li>
            <li>You must provide accurate and truthful information during registration.</li>
          </ul>

          <h2>4. User Accounts</h2>
          <ul>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>One account per person. Sharing accounts is prohibited.</li>
            <li>You must not create accounts using fake identities or bots.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
          </ul>

          <h2>5. Free & Premium Services</h2>
          <ul>
            <li>The Platform offers both free and premium features.</li>
            <li>Premium subscriptions are available starting at ₹11/month.</li>
            <li>Payment processing is handled by secure third-party payment providers.</li>
            <li>Refund requests must be made within 7 days of purchase if the service was not used.</li>
          </ul>

          <h2>6. AI-Generated Content</h2>
          <ul>
            <li>The Platform uses AI to generate study materials, questions, analysis, and recommendations.</li>
            <li>AI-generated content is for educational purposes only and may contain errors.</li>
            <li>Users should cross-reference important information with official UPSC/NDA sources.</li>
            <li>We do not guarantee exam results or selection based on Platform usage.</li>
          </ul>

          <h2>7. User Content & Community</h2>
          <ul>
            <li>You retain ownership of content you create (notes, posts, etc.).</li>
            <li>By posting in community sections, you grant us a non-exclusive license to display your content.</li>
            <li>Abusive, offensive, or misleading content in community sections will be removed.</li>
            <li>Sharing exam papers or copyrighted content without authorization is prohibited.</li>
          </ul>

          <h2>8. Prohibited Activities</h2>
          <ul>
            <li>Attempting to hack, reverse-engineer, or disrupt the Platform.</li>
            <li>Scraping or automated data collection from the Platform.</li>
            <li>Impersonating other users, defence personnel, or officials.</li>
            <li>Using the Platform to spread misinformation about defence services.</li>
            <li>Commercial use of Platform content without authorization.</li>
          </ul>

          <h2>9. Intellectual Property</h2>
          <p>All Platform content, including but not limited to software, design, AI models, questions, and study materials, is owned by Devrayog NDA AI or its licensors. Unauthorized reproduction or distribution is prohibited.</p>

          <h2>10. Limitation of Liability</h2>
          <ul>
            <li>The Platform is provided "as is" without warranties of any kind.</li>
            <li>We are not responsible for any damages arising from Platform use.</li>
            <li>We do not guarantee uninterrupted or error-free service.</li>
            <li>Our total liability shall not exceed the amount paid by you in the past 12 months.</li>
          </ul>

          <h2>11. Data & Privacy</h2>
          <p>Your use of the Platform is also governed by our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>. Please review it to understand how we collect and use your data.</p>

          <h2>12. Changes to Terms</h2>
          <p>We may update these terms at any time. Continued use of the Platform after changes constitutes acceptance. We will notify users of major changes via email or in-app notification.</p>

          <h2>13. Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Pune, Maharashtra.</p>

          <h2>14. Contact</h2>
          <p>For questions about these Terms, contact us at:</p>
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
