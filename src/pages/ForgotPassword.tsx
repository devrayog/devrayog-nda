import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-16 px-4">
        <div className="w-full max-w-md glass-card rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <h1 className="font-display text-3xl text-gradient-gold mb-4">CHECK YOUR EMAIL</h1>
              <p className="text-muted-foreground mb-6">We sent a password reset link to <strong>{email}</strong>. Click the link to reset your password.</p>
              <Link to="/login"><Button variant="outline" className="border-gold">Back to Login</Button></Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl text-gradient-gold">FORGOT PASSWORD</h1>
                <p className="text-sm text-muted-foreground mt-2">Enter your email and we'll send you a reset link.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label className="font-mono text-[10px] text-primary tracking-widest uppercase">{t("auth.email")}</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cadet@gmail.com" className="pl-10 bg-card border-gold" required />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-gold text-primary-foreground font-bold tracking-widest py-5">
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-4">
                <Link to="/login" className="text-primary hover:underline">Back to Login</Link>
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
