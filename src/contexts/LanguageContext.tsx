import React, { createContext, useContext, useState, useCallback } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

// Translation dictionary — grows as we add pages
const translations: Record<string, Record<Language, string>> = {
  // Nav
  "nav.home": { en: "Home", hi: "होम" },
  "nav.dashboard": { en: "Dashboard", hi: "डैशबोर्ड" },
  "nav.login": { en: "Log In", hi: "लॉग इन" },
  "nav.signup": { en: "Sign Up", hi: "साइन अप" },
  "nav.profile": { en: "Profile", hi: "प्रोफ़ाइल" },
  "nav.settings": { en: "Settings", hi: "सेटिंग्स" },
  "nav.logout": { en: "Log Out", hi: "लॉग आउट" },
  "nav.study": { en: "Study", hi: "अध्ययन" },
  "nav.tests": { en: "Tests", hi: "टेस्ट" },
  "nav.ssb": { en: "SSB Prep", hi: "SSB तैयारी" },
  "nav.ai_tutor": { en: "AI Tutor", hi: "AI ट्यूटर" },
  "nav.community": { en: "Community", hi: "समुदाय" },
  "nav.fitness": { en: "Fitness", hi: "फिटनेस" },
  "nav.resources": { en: "Resources", hi: "संसाधन" },
  "nav.notifications": { en: "Notifications", hi: "सूचनाएं" },
  "nav.admin": { en: "Admin", hi: "एडमिन" },
  
  // Landing
  "landing.tagline": { en: "NDA in DNA", hi: "NDA in DNA" },
  "landing.hero_title": { en: "YOUR AI-POWERED NDA PREPARATION PLATFORM", hi: "आपका AI-संचालित NDA तैयारी प्लेटफॉर्म" },
  "landing.hero_sub": { en: "Personalized AI mentor that knows your name, weaknesses, and builds your daily study plan. Free to start.", hi: "व्यक्तिगत AI मेंटर जो आपका नाम, कमज़ोरियाँ जानता है और आपकी दैनिक अध्ययन योजना बनाता है। शुरू करना मुफ़्त है।" },
  "landing.cta_start": { en: "Start Free — Join DNA", hi: "मुफ़्त शुरू करें — DNA में जुड़ें" },
  "landing.cta_login": { en: "Already have account? Log In", hi: "पहले से अकाउंट है? लॉग इन करें" },
  "landing.features_title": { en: "WHY DNA IS DIFFERENT", hi: "DNA अलग क्यों है" },
  "landing.f1_title": { en: "AI Personalization", hi: "AI व्यक्तिगतकरण" },
  "landing.f1_desc": { en: "Every plan, question, and tip is personalized for YOU — your attempt, weakness, and exam date.", hi: "हर योजना, सवाल और टिप आपके लिए व्यक्तिगत है — आपका प्रयास, कमज़ोरी और परीक्षा तिथि।" },
  "landing.f2_title": { en: "SSB Preparation", hi: "SSB तैयारी" },
  "landing.f2_desc": { en: "OIR, PPDT, TAT, WAT, SRT, SDT — complete SSB prep that no other platform offers.", hi: "OIR, PPDT, TAT, WAT, SRT, SDT — पूर्ण SSB तैयारी जो कोई अन्य प्लेटफॉर्म नहीं देता।" },
  "landing.f3_title": { en: "Hindi + English", hi: "हिंदी + English" },
  "landing.f3_desc": { en: "Full bilingual support. Study in your preferred language. AI responds in Hinglish too.", hi: "पूर्ण द्विभाषी सपोर्ट। अपनी पसंदीदा भाषा में पढ़ें। AI हिंग्लिश में भी जवाब देता है।" },
  "landing.f4_title": { en: "Adaptive Testing", hi: "अनुकूली परीक्षण" },
  "landing.f4_desc": { en: "AI adjusts difficulty based on your performance. Weak topics get more focus automatically.", hi: "AI आपके प्रदर्शन के आधार पर कठिनाई समायोजित करता है। कमज़ोर विषयों पर स्वचालित रूप से अधिक ध्यान।" },
  "landing.stats_students": { en: "Active Students", hi: "सक्रिय छात्र" },
  "landing.stats_questions": { en: "AI Questions", hi: "AI प्रश्न" },
  "landing.stats_tests": { en: "Mock Tests", hi: "मॉक टेस्ट" },
  "landing.stats_selections": { en: "Selections", hi: "चयन" },

  // Auth
  "auth.login_title": { en: "WELCOME BACK, CADET", hi: "वापस स्वागत है, कैडेट" },
  "auth.login_sub": { en: "Log in to continue your NDA preparation journey.", hi: "अपनी NDA तैयारी यात्रा जारी रखने के लिए लॉग इन करें।" },
  "auth.email": { en: "Email Address", hi: "ईमेल पता" },
  "auth.password": { en: "Password", hi: "पासवर्ड" },
  "auth.confirm_password": { en: "Confirm Password", hi: "पासवर्ड पुष्टि करें" },
  "auth.forgot": { en: "Forgot password?", hi: "पासवर्ड भूल गए?" },
  "auth.login_btn": { en: "Log In", hi: "लॉग इन" },
  "auth.no_account": { en: "Don't have an account?", hi: "अकाउंट नहीं है?" },
  "auth.has_account": { en: "Already have an account?", hi: "पहले से अकाउंट है?" },
  "auth.signup_btn": { en: "Sign Up", hi: "साइन अप" },

  // Signup steps
  "signup.step1_tag": { en: "STEP 1 OF 4", hi: "चरण 1 / 4" },
  "signup.step1_title": { en: "BASIC INFO", hi: "बुनियादी जानकारी" },
  "signup.step1_sub": { en: "Tell us who you are. This sets up your DNA profile.", hi: "हमें बताएं आप कौन हैं। यह आपकी DNA प्रोफ़ाइल बनाता है।" },
  "signup.full_name": { en: "Full Name", hi: "पूरा नाम" },
  "signup.username": { en: "Username", hi: "यूज़रनेम" },
  "signup.state": { en: "State", hi: "राज्य" },
  "signup.select_state": { en: "Select your state", hi: "अपना राज्य चुनें" },
  "signup.girl_candidate": { en: "I am a girl candidate", hi: "मैं लड़की उम्मीदवार हूं" },
  "signup.continue": { en: "Continue →", hi: "आगे बढ़ें →" },
  "signup.back": { en: "← Back", hi: "← पीछे" },

  "signup.step2_tag": { en: "STEP 2 OF 4", hi: "चरण 2 / 4" },
  "signup.step2_title": { en: "YOUR NDA JOURNEY", hi: "आपकी NDA यात्रा" },
  "signup.step2_sub": { en: "This helps DNA's AI understand where you are and build the right plan.", hi: "यह DNA के AI को समझने में मदद करता है कि आप कहां हैं और सही योजना बनाता है।" },
  "signup.attempt": { en: "Which attempt is this?", hi: "यह कौन सा प्रयास है?" },
  "signup.1st": { en: "1st Attempt", hi: "पहला प्रयास" },
  "signup.2nd": { en: "2nd Attempt", hi: "दूसरा प्रयास" },
  "signup.3rd": { en: "3rd Attempt", hi: "तीसरा प्रयास" },
  "signup.4th": { en: "4th+ Attempt", hi: "4th+ प्रयास" },
  "signup.target_exam": { en: "Target Exam", hi: "लक्ष्य परीक्षा" },
  "signup.select_exam": { en: "Select target exam", hi: "लक्ष्य परीक्षा चुनें" },
  "signup.cleared_written": { en: "Have you cleared NDA Written before?", hi: "क्या आपने पहले NDA लिखित पास किया है?" },
  "signup.not_yet": { en: "Not Yet", hi: "अभी नहीं" },
  "signup.yes_cleared": { en: "Yes, Cleared", hi: "हां, पास किया" },

  "signup.step3_tag": { en: "STEP 3 OF 4", hi: "चरण 3 / 4" },
  "signup.step3_title": { en: "YOUR PREFERENCES", hi: "आपकी प्राथमिकताएं" },
  "signup.step3_sub": { en: "Customize your DNA experience. AI uses this to personalize everything.", hi: "अपना DNA अनुभव कस्टमाइज़ करें। AI इसका उपयोग सब कुछ व्यक्तिगत बनाने के लिए करता है।" },
  "signup.medium": { en: "Study Medium", hi: "अध्ययन माध्यम" },
  "signup.hindi_medium": { en: "Hindi / Hinglish", hi: "हिंदी / हिंग्लिश" },
  "signup.english_medium": { en: "English", hi: "English" },
  "signup.service": { en: "Preferred Service", hi: "पसंदीदा सेवा" },
  "signup.army": { en: "Army", hi: "सेना" },
  "signup.navy": { en: "Navy", hi: "नौसेना" },
  "signup.airforce": { en: "Air Force", hi: "वायु सेना" },
  "signup.challenge": { en: "Biggest Challenge Right Now", hi: "अभी सबसे बड़ी चुनौती" },
  "signup.select_challenge": { en: "Select your challenge", hi: "अपनी चुनौती चुनें" },
  "signup.study_time": { en: "Daily Study Time Available", hi: "दैनिक अध्ययन समय" },

  "signup.step4_tag": { en: "STEP 4 OF 4", hi: "चरण 4 / 4" },
  "signup.step4_title": { en: "SET PASSWORD", hi: "पासवर्ड सेट करें" },
  "signup.step4_sub": { en: "Last step! Set a strong password to secure your DNA account.", hi: "अंतिम चरण! अपने DNA अकाउंट को सुरक्षित करने के लिए एक मज़बूत पासवर्ड सेट करें।" },
  "signup.terms": { en: "I agree to DNA's Terms of Service and Privacy Policy", hi: "मैं DNA की सेवा शर्तों और गोपनीयता नीति से सहमत हूं" },
  "signup.create_btn": { en: "CREATE MY DNA ACCOUNT", hi: "मेरा DNA अकाउंट बनाएं" },

  "signup.success_title": { en: "WELCOME TO DNA!", hi: "DNA में आपका स्वागत है!" },
  "signup.success_sub": { en: "Your account is ready. The AI has started building your personal Learning DNA profile.", hi: "आपका अकाउंट तैयार है। AI ने आपकी व्यक्तिगत Learning DNA प्रोफ़ाइल बनाना शुरू कर दिया है।" },
  "signup.go_dashboard": { en: "Go to My Dashboard →", hi: "मेरे डैशबोर्ड पर जाएं →" },

  // Dashboard
  "dashboard.welcome": { en: "Welcome back", hi: "वापस स्वागत है" },
  "dashboard.dna_score": { en: "DNA Score", hi: "DNA स्कोर" },
  "dashboard.streak": { en: "Day Streak", hi: "दिन का स्ट्रीक" },
  "dashboard.today_plan": { en: "Today's AI Plan", hi: "आज की AI योजना" },
  "dashboard.exam_countdown": { en: "Days to Exam", hi: "परीक्षा तक दिन" },
  "dashboard.weak_areas": { en: "Weak Areas", hi: "कमज़ोर क्षेत्र" },
  "dashboard.quick_actions": { en: "Quick Actions", hi: "त्वरित कार्य" },

  // Footer
  "footer.made_by": { en: "Made with ❤️ by", hi: "❤️ से बनाया" },
  "footer.devrayog": { en: "Devrayog AI", hi: "Devrayog AI" },
  "footer.rights": { en: "All rights reserved.", hi: "सभी अधिकार सुरक्षित।" },

  // Common
  "common.loading": { en: "Loading...", hi: "लोड हो रहा है..." },
  "common.save": { en: "Save", hi: "सेव करें" },
  "common.cancel": { en: "Cancel", hi: "रद्द करें" },
  "common.delete": { en: "Delete", hi: "हटाएं" },
  "common.edit": { en: "Edit", hi: "संपादित करें" },
  "common.search": { en: "Search...", hi: "खोजें..." },

  // Theme
  "settings.theme": { en: "Theme", hi: "थीम" },
  "settings.light": { en: "Light", hi: "लाइट" },
  "settings.dark": { en: "Dark", hi: "डार्क" },
  "settings.language": { en: "Language", hi: "भाषा" },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("dna-language");
    return (saved as Language) || "en";
  });

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("dna-language", lang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[key]?.[language] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
