import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { User, MapPin, Target, Shield, Clock } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const meta = user?.user_metadata || {};

  const fields = [
    { icon: User, label: "Name", value: meta.full_name || "—" },
    { icon: User, label: "Username", value: `@${meta.username || "—"}` },
    { icon: MapPin, label: "State", value: meta.state || "—" },
    { icon: Target, label: "Attempt", value: meta.attempt || "—" },
    { icon: Target, label: "Target Exam", value: meta.target_exam || "—" },
    { icon: Shield, label: "Service", value: meta.service || "—" },
    { icon: Clock, label: "Study Time", value: meta.study_time ? `${meta.study_time} hrs/day` : "—" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center font-display text-4xl text-primary-foreground mx-auto mb-4 animate-pulse-gold">
            {(meta.full_name || "C")[0].toUpperCase()}
          </div>
          <h1 className="font-display text-3xl text-gradient-gold">{meta.full_name || "Cadet"}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        <Card className="glass-card border-gold">
          <CardContent className="p-6 space-y-4">
            {fields.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <f.icon className="h-4 w-4 text-primary" />
                <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase w-28">{f.label}</span>
                <span className="font-semibold text-sm">{f.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
