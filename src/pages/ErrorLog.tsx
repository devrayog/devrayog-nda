import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function ErrorLog() {
  const { user } = useAuth();
  const [errors, setErrors] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("test_results").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => {
        if (!data) return;
        const allErrors: any[] = [];
        data.forEach((test: any) => {
          const qd = test.questions_data as any[];
          if (Array.isArray(qd)) {
            qd.filter((q: any) => q.userAnswer !== undefined && q.userAnswer !== q.correct && q.userAnswer !== -1)
              .forEach((q: any) => allErrors.push({ ...q, testDate: test.created_at, subject: test.subject }));
          }
        });
        setErrors(allErrors);
      });
  }, [user]);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-destructive" />
          <h1 className="font-display text-4xl text-gradient-gold">ERROR LOG</h1>
        </div>
        <p className="text-muted-foreground text-sm">All your wrong answers organized by topic for targeted revision.</p>

        {errors.length === 0 && (
          <Card className="glass-card border-gold">
            <CardContent className="p-8 text-center">
              <XCircle className="h-10 w-10 text-primary/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No errors yet! Take some tests and wrong answers will appear here for revision.</p>
            </CardContent>
          </Card>
        )}

        {errors.map((err, i) => (
          <Card key={i} className="glass-card border-destructive/30">
            <CardContent className="p-4">
              <p className="font-bold text-sm mb-2">{err.question}</p>
              <p className="text-xs text-destructive mb-1">Your answer: {err.options?.[err.userAnswer]} ✗</p>
              <p className="text-xs text-success mb-2">Correct: {err.options?.[err.correct]} ✓</p>
              <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">{err.explanation}</p>
              <p className="text-[10px] text-muted-foreground mt-2">{err.topic} • {err.subject}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
