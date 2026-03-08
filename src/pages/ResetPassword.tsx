import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast({ title: "Password must be at least 8 characters", variant: "destructive" }); return; }
    if (password !== confirm) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated! Redirecting..." });
      setTimeout(() => navigate("/dashboard"), 1500);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-16 px-4">
        <div className="w-full max-w-md glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-gradient-gold">RESET PASSWORD</h1>
            <p className="text-sm text-muted-foreground mt-2">Set your new password below.</p>
          </div>
          {!ready ? (
            <p className="text-center text-muted-foreground">Invalid or expired reset link. Please request a new one.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label className="font-mono text-[10px] text-primary tracking-widest uppercase">New Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" className="pl-10 pr-10 bg-card border-gold" required />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="font-mono text-[10px] text-primary tracking-widest uppercase">Confirm Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter" className="pl-10 bg-card border-gold" required />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-gold text-primary-foreground font-bold tracking-widest py-5">
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
