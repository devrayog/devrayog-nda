import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { User, AtSign, Mail, MapPin, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra",
  "Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu",
  "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Other"
];

const EXAMS = ["NDA 1 2026 — April 2026", "NDA 2 2026 — September 2026", "NDA 1 2027 — April 2027", "NDA 2 2027 — September 2027"];

const CHALLENGES = [
  "Maths is very weak","GAT / GK is weak","No study consistency","Don't know SSB preparation",
  "Physical fitness not ready","Negative marking kills my score","Time management in exam","Everything is weak"
];

interface SignupData {
  name: string; username: string; email: string; state: string; isGirl: boolean;
  attempt: string; targetExam: string; clearedWritten: string;
  medium: string; service: string; challenge: string; studyTime: string;
  password: string; confirmPassword: string; agreedTerms: boolean;
}

const initial: SignupData = {
  name: "", username: "", email: "", state: "", isGirl: false,
  attempt: "", targetExam: "", clearedWritten: "",
  medium: "", service: "", challenge: "", studyTime: "",
  password: "", confirmPassword: "", agreedTerms: false,
};

function OptionCard({ selected, onClick, icon, title, desc }: { selected: boolean; onClick: () => void; icon: string; title: string; desc?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 border rounded-lg text-center transition-all ${selected ? "border-primary bg-primary/10" : "border-gold hover:border-primary hover:bg-primary/5"}`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-sm font-bold">{title}</div>
      {desc && <div className="text-[11px] text-muted-foreground mt-1">{desc}</div>}
    </button>
  );
}

export default function Signup() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<SignupData>(initial);
  const [showPw, setShowPw] = useState(false);
  const [showPwC, setShowPwC] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (field: keyof SignupData, value: any) => setData((prev) => ({ ...prev, [field]: value }));

  const validateStep = () => {
    if (step === 1) {
      if (!data.name || !data.username || !data.email || !data.state) {
        toast({ title: "Please fill all fields", variant: "destructive" }); return false;
      }
      if (!/^[a-zA-Z0-9_]{3,}$/.test(data.username)) {
        toast({ title: "Username must be 3+ chars (letters, numbers, underscore)", variant: "destructive" }); return false;
      }
      if (!data.email.includes("@")) {
        toast({ title: "Please enter a valid email", variant: "destructive" }); return false;
      }
    }
    if (step === 2) {
      if (!data.attempt || !data.targetExam || !data.clearedWritten) {
        toast({ title: "Please complete all selections", variant: "destructive" }); return false;
      }
    }
    if (step === 3) {
      if (!data.medium || !data.service || !data.challenge || !data.studyTime) {
        toast({ title: "Please complete all selections", variant: "destructive" }); return false;
      }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 4)); };
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleCreate = async () => {
    if (data.password.length < 8) { toast({ title: "Password must be at least 8 characters", variant: "destructive" }); return; }
    if (data.password !== data.confirmPassword) { toast({ title: "Passwords do not match", variant: "destructive" }); return; }
    if (!data.agreedTerms) { toast({ title: "Please agree to Terms of Service", variant: "destructive" }); return; }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: data.name,
          username: data.username,
          state: data.state,
          is_girl: data.isGirl,
          attempt: data.attempt,
          target_exam: data.targetExam,
          cleared_written: data.clearedWritten,
          medium: data.medium,
          service: data.service,
          challenge: data.challenge,
          study_time: data.studyTime,
        },
      },
    });

    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      setSuccess(true);
      toast({ title: "Account created! Check your email to verify." });
    }
    setLoading(false);
  };

  const pwStrength = () => {
    let s = 0;
    if (data.password.length >= 8) s++;
    if (/[A-Z]/.test(data.password)) s++;
    if (/[0-9]/.test(data.password)) s++;
    if (/[^A-Za-z0-9]/.test(data.password)) s++;
    return s;
  };

  const strength = pwStrength();
  const strengthColor = ["bg-destructive", "bg-destructive", "bg-warning", "bg-success"][Math.min(strength - 1, 3)] || "bg-border";

  if (success) {
    const initials = data.name ? data.name[0].toUpperCase() : "D";
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-16 px-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 rounded-full bg-gradient-gold flex items-center justify-center font-display text-5xl text-primary-foreground mx-auto mb-6 animate-pulse-gold border-4 border-primary">
              {initials}
            </div>
            <h1 className="font-display text-4xl text-gradient-gold mb-4">{t("signup.success_title")}</h1>
            <p className="text-muted-foreground mb-8">{t("signup.success_sub")}</p>
            <div className="glass-card rounded-xl p-6 mb-6 inline-block">
              <p className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase mb-2">Initial DNA Score</p>
              <p className="font-display text-6xl text-gradient-gold">42%</p>
              <p className="text-xs text-muted-foreground mt-2">AI will update this as you study</p>
            </div>
            <div>
              <Link to="/diagnostic">
                <Button size="lg" className="bg-gradient-gold text-primary-foreground font-bold tracking-widest px-8 py-6">
                  Take DNA Diagnostic Test 🧬
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Progress bar */}
      <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-muted">
        <div className="h-full bg-gradient-gold transition-all duration-500" style={{ width: `${step * 25}%` }} />
      </div>

      <main className="flex-1 pt-20 px-4 pb-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left panel — step indicators */}
          <div className="hidden lg:flex flex-col justify-center glass-card rounded-2xl p-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(hsl(var(--gold) / 0.04) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--gold) / 0.04) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
            <div className="relative z-10 space-y-4 mb-8">
              {[
                { n: 1, title: "Basic Info", desc: "NAME · EMAIL · USERNAME" },
                { n: 2, title: "Your NDA Journey", desc: "ATTEMPTS · TARGET EXAM" },
                { n: 3, title: "Preferences", desc: "MEDIUM · SERVICE · FOCUS" },
                { n: 4, title: "Set Password", desc: "SECURE YOUR ACCOUNT" },
              ].map((s) => (
                <div key={s.n} className={`flex items-center gap-4 p-3 rounded-lg transition-all ${step === s.n ? "bg-primary/10 border border-gold" : step > s.n ? "opacity-50" : "opacity-30"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs ${step === s.n ? "bg-gradient-gold text-primary-foreground" : step > s.n ? "bg-success/20 text-success border border-success/30" : "bg-primary/10 text-muted-foreground border border-gold"}`}>
                    {step > s.n ? <CheckCircle className="h-4 w-4" /> : s.n}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{s.title}</p>
                    <p className="font-mono text-[9px] text-muted-foreground tracking-widest">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative z-10 p-5 bg-primary/5 border border-gold rounded-lg">
              <p className="font-mono text-[9px] text-primary tracking-widest uppercase mb-3">DNA Promise</p>
              {["100% Free to start — no card needed", "AI builds your profile from Day 1", "No spam. No ads on email.", "Premium is just ₹11/month"].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-medium mb-1.5">
                  <span className="text-success font-bold">✓</span> {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right panel — form steps */}
          <div className="flex flex-col justify-center">
            {/* Step 1 */}
            {step === 1 && (
              <div className="animate-fade-in">
                <p className="font-mono text-[10px] text-primary tracking-widest mb-2">{t("signup.step1_tag")}</p>
                <h1 className="font-display text-3xl text-gradient-gold mb-2">{t("signup.step1_title")}</h1>
                <p className="text-sm text-muted-foreground mb-8">{t("signup.step1_sub")}</p>

                <div className="space-y-4">
                  <div>
                    <Label className="font-mono text-[10px] text-primary tracking-widest uppercase">{t("signup.full_name")}</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input value={data.name} onChange={(e) => update("name", e.target.value)} placeholder="Enter your full name" className="pl-10 bg-card border-gold" />
                    </div>
                  </div>

                  <div>
                    <Label className="font-mono text-[10px] text-primary tracking-widest uppercase">{t("signup.username")}</Label>
                    <div className="relative mt-1">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input value={data.username} onChange={(e) => update("username", e.target.value)} placeholder="your_username" className="pl-10 bg-card border-gold" />
                    </div>
                    <p className="font-mono text-[9px] text-muted-foreground mt-1">Only letters, numbers, underscore. Min 3 chars.</p>
                  </div>

                  <div>
                    <Label className="font-mono text-[10px] text-primary tracking-widest uppercase">{t("auth.email")}</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="you@gmail.com" className="pl-10 bg-card border-gold" />
                    </div>
                  </div>

                  <div>
                    <Label className="font-mono text-[10px] text-primary tracking-widest uppercase">{t("signup.state")}</Label>
                    <Select value={data.state} onValueChange={(v) => update("state", v)}>
                      <SelectTrigger className="mt-1 bg-card border-gold">
                        <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                        <SelectValue placeholder={t("signup.select_state")} />
                      </SelectTrigger>
                      <SelectContent>
                        {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-3 p-3 border border-gold rounded-lg cursor-pointer hover:bg-primary/5" onClick={() => update("isGirl", !data.isGirl)}>
                    <Checkbox checked={data.isGirl} onCheckedChange={(c) => update("isGirl", !!c)} />
                    <label className="text-sm font-medium cursor-pointer">{t("signup.girl_candidate")}</label>
                  </div>

                  <Button onClick={next} className="w-full bg-gradient-gold text-primary-foreground font-bold tracking-widest py-5">
                    {t("signup.continue")} Step 2
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                    <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">OR</span></div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      const { error } = await lovable.auth.signInWithOAuth("google", {
                        redirect_uri: window.location.origin,
                      });
                      if (error) {
                        toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
                      }
                    }}
                    className="w-full border-gold py-5 font-bold"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Continue with Google
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="animate-fade-in">
                <p className="font-mono text-[10px] text-primary tracking-widest mb-2">{t("signup.step2_tag")}</p>
                <h1 className="font-display text-3xl text-gradient-gold mb-2">{t("signup.step2_title")}</h1>
                <p className="text-sm text-muted-foreground mb-8">{t("signup.step2_sub")}</p>

                <div className="space-y-6">
                  <div>
                    <Label className="font-mono text-[10px] text-primary tracking-widest uppercase mb-3 block">{t("signup.attempt")}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { v: "1st", icon: "🎯", title: t("signup.1st"), desc: "Just starting" },
                        { v: "2nd", icon: "🔄", title: t("signup.2nd"), desc: "Tried once" },
                        { v: "3rd", icon: "💪", title: t("signup.3rd"), desc: "Still fighting" },
                        { v: "4th+", icon: "🦾", title: t("signup.4th"), desc: "Never giving up" },
                      ].map((o) => (
                        <OptionCard key={o.v} selected={data.attempt === o.v} onClick={() => update("attempt", o.v)} icon={o.icon} title={o.title} desc={o.desc} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="font-mono text-[10px] text-primary tracking-widest uppercase">{t("signup.target_exam")}</Label>
                    <Select value={data.targetExam} onValueChange={(v) => update("targetExam", v)}>
                      <SelectTrigger className="mt-2 bg-card border-gold"><SelectValue placeholder={t("signup.select_exam")} /></SelectTrigger>
                      <SelectContent>
                        {EXAMS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="font-mono text-[10px] text-primary tracking-widest uppercase mb-3 block">{t("signup.cleared_written")}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <OptionCard selected={data.clearedWritten === "no"} onClick={() => update("clearedWritten", "no")} icon="📝" title={t("signup.not_yet")} desc="Working towards it" />
                      <OptionCard selected={data.clearedWritten === "yes"} onClick={() => update("clearedWritten", "yes")} icon="✅" title={t("signup.yes_cleared")} desc="SSB is next" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={back} variant="outline" className="flex-1 border-gold"><ArrowLeft className="mr-2 h-4 w-4" /> {t("signup.back")}</Button>
                    <Button onClick={next} className="flex-1 bg-gradient-gold text-primary-foreground font-bold tracking-widest">{t("signup.continue")} 3 <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="animate-fade-in">
                <p className="font-mono text-[10px] text-primary tracking-widest mb-2">{t("signup.step3_tag")}</p>
                <h1 className="font-display text-3xl text-gradient-gold mb-2">{t("signup.step3_title")}</h1>
                <p className="text-sm text-muted-foreground mb-8">{t("signup.step3_sub")}</p>

                <div className="space-y-6">
                  <div>
                    <Label className="font-mono text-[10px] text-primary tracking-widest uppercase mb-3 block">{t("signup.medium")}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <OptionCard selected={data.medium === "hindi"} onClick={() => update("medium", "hindi")} icon="🇮🇳" title={t("signup.hindi_medium")} />
                      <OptionCard selected={data.medium === "english"} onClick={() => update("medium", "english")} icon="🇬🇧" title={t("signup.english_medium")} />
                    </div>
                  </div>

                  <div>
                    <Label className="font-mono text-[10px] text-primary tracking-widest uppercase mb-3 block">{t("signup.service")}</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <OptionCard selected={data.service === "army"} onClick={() => update("service", "army")} icon="🪖" title={t("signup.army")} />
                      <OptionCard selected={data.service === "navy"} onClick={() => update("service", "navy")} icon="⚓" title={t("signup.navy")} />
                      <OptionCard selected={data.service === "airforce"} onClick={() => update("service", "airforce")} icon="✈️" title={t("signup.airforce")} />
                    </div>
                  </div>

                  <div>
                    <Label className="font-mono text-[10px] text-primary tracking-widest uppercase">{t("signup.challenge")}</Label>
                    <Select value={data.challenge} onValueChange={(v) => update("challenge", v)}>
                      <SelectTrigger className="mt-2 bg-card border-gold"><SelectValue placeholder={t("signup.select_challenge")} /></SelectTrigger>
                      <SelectContent>
                        {CHALLENGES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <p className="font-mono text-[9px] text-muted-foreground mt-1">AI will prioritize your weak areas from Day 1.</p>
                  </div>

                  <div>
                    <Label className="font-mono text-[10px] text-primary tracking-widest uppercase mb-3 block">{t("signup.study_time")}</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <OptionCard selected={data.studyTime === "1-2"} onClick={() => update("studyTime", "1-2")} icon="⏱️" title="1–2 Hours" />
                      <OptionCard selected={data.studyTime === "3-4"} onClick={() => update("studyTime", "3-4")} icon="⏰" title="3–4 Hours" />
                      <OptionCard selected={data.studyTime === "5+"} onClick={() => update("studyTime", "5+")} icon="🕐" title="5+ Hours" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={back} variant="outline" className="flex-1 border-gold"><ArrowLeft className="mr-2 h-4 w-4" /> {t("signup.back")}</Button>
                    <Button onClick={next} className="flex-1 bg-gradient-gold text-primary-foreground font-bold tracking-widest">{t("signup.continue")} Password <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="animate-fade-in">
                <p className="font-mono text-[10px] text-primary tracking-widest mb-2">{t("signup.step4_tag")}</p>
                <h1 className="font-display text-3xl text-gradient-gold mb-2">{t("signup.step4_title")}</h1>
                <p className="text-sm text-muted-foreground mb-8">{t("signup.step4_sub")}</p>

                <div className="space-y-5">
                  <div>
                    <Label className="font-mono text-[10px] text-primary tracking-widest uppercase">{t("auth.password")}</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type={showPw ? "text" : "password"} value={data.password} onChange={(e) => update("password", e.target.value)} placeholder="Min 8 characters" className="pl-10 pr-10 bg-card border-gold" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {data.password && (
                      <>
                        <div className="flex gap-1 mt-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`flex-1 h-1 rounded-full ${i <= strength ? strengthColor : "bg-border"}`} />
                          ))}
                        </div>
                        <p className="font-mono text-[9px] mt-1" style={{ color: ["", "var(--destructive)", "var(--destructive)", "hsl(var(--warning))", "hsl(var(--success))"][strength] }}>
                          {["", "Too short", "Weak", "Medium", "Strong ✓"][strength]}
                        </p>
                      </>
                    )}
                  </div>

                  <div>
                    <Label className="font-mono text-[10px] text-primary tracking-widest uppercase">{t("auth.confirm_password")}</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type={showPwC ? "text" : "password"} value={data.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Re-enter password" className="pl-10 pr-10 bg-card border-gold" />
                      <button type="button" onClick={() => setShowPwC(!showPwC)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPwC ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {data.confirmPassword && data.password !== data.confirmPassword && (
                      <p className="font-mono text-[9px] text-destructive mt-1">Passwords do not match.</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-3 border border-gold rounded-lg cursor-pointer hover:bg-primary/5" onClick={() => update("agreedTerms", !data.agreedTerms)}>
                    <Checkbox checked={data.agreedTerms} onCheckedChange={(c) => update("agreedTerms", !!c)} />
                    <label className="text-sm font-medium cursor-pointer">{t("signup.terms")}</label>
                  </div>

                  <Button onClick={handleCreate} disabled={loading} className="w-full bg-gradient-gold text-primary-foreground font-bold tracking-widest py-5">
                    🎖️ {loading ? "CREATING ACCOUNT..." : t("signup.create_btn")}
                  </Button>

                  <Button onClick={back} variant="outline" className="w-full border-gold">
                    <ArrowLeft className="mr-2 h-4 w-4" /> {t("signup.back")}
                  </Button>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground mt-6">
              {t("auth.has_account")}{" "}
              <Link to="/login" className="text-primary font-bold hover:underline">{t("nav.login")}</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
