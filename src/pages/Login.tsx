import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back, Cadet!" });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-16 px-4">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-8">
            <div className="text-center mb-8">
              <img src="/logo.png" alt="DNA" className="w-14 h-14 rounded-xl mx-auto mb-4" />
              <h1 className="font-display text-3xl text-gradient-gold">{t("auth.login_title")}</h1>
              <p className="text-sm text-muted-foreground mt-2">{t("auth.login_sub")}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label className="font-mono text-[10px] text-primary tracking-widest uppercase">{t("auth.email")}</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cadet@gmail.com"
                    className="pl-10 bg-card border-gold"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="font-mono text-[10px] text-primary tracking-widest uppercase">{t("auth.password")}</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-card border-gold"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline font-mono">{t("auth.forgot")}</Link>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-gradient-gold text-primary-foreground font-bold tracking-widest py-5">
                {loading ? "..." : t("auth.login_btn")}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {t("auth.no_account")}{" "}
              <Link to="/signup" className="text-primary font-bold hover:underline">{t("auth.signup_btn")}</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
