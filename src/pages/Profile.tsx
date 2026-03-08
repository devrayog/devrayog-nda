import { useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, Target, Shield, Clock, Pencil, Camera, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const meta = user?.user_metadata || {};
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    full_name: meta.full_name || "",
    username: meta.username || "",
    state: meta.state || "",
    attempt: meta.attempt || "1st",
    target_exam: meta.target_exam || "NDA 1 2026",
    service: meta.service || "army",
    study_time: meta.study_time || "",
  });

  const avatarUrl = avatarPreview || meta.avatar_url || null;
  const initial = (form.full_name || "C")[0].toUpperCase();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB", variant: "destructive" });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let avatar_url = meta.avatar_url;

      // Upload avatar if changed
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = urlData.publicUrl;
      }

      // Update auth metadata
      const { error: authErr } = await supabase.auth.updateUser({
        data: { ...form, avatar_url },
      });
      if (authErr) throw authErr;

      // Update profiles table
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          username: form.username,
          state: form.state,
          attempt: form.attempt,
          target_exam: form.target_exam,
          service: form.service,
          study_time: form.study_time,
          avatar_url,
        })
        .eq("user_id", user.id);
      if (profileErr) throw profileErr;

      toast({ title: "Profile updated!" });
      setEditing(false);
      setAvatarFile(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { icon: User, label: "Name", key: "full_name" as const, value: form.full_name || "—" },
    { icon: User, label: "Username", key: "username" as const, value: `@${form.username || "—"}` },
    { icon: MapPin, label: "State", key: "state" as const, value: form.state || "—" },
    { icon: Target, label: "Attempt", key: "attempt" as const, value: form.attempt || "—" },
    { icon: Target, label: "Target Exam", key: "target_exam" as const, value: form.target_exam || "—" },
    { icon: Shield, label: "Service", key: "service" as const, value: form.service || "—" },
    { icon: Clock, label: "Study Time", key: "study_time" as const, value: form.study_time ? `${form.study_time} hrs/day` : "—" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Avatar & Name */}
        <div className="text-center">
          <div className="relative inline-block">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-primary mx-auto" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center font-display text-4xl text-primary-foreground mx-auto animate-pulse-gold">
                {initial}
              </div>
            )}
            {editing && (
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <h1 className="font-display text-3xl text-gradient-gold mt-4">{form.full_name || "Cadet"}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        {/* Edit Toggle */}
        <div className="flex justify-end">
          {!editing ? (
            <Button variant="outline" size="sm" className="border-gold" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditing(false); setAvatarFile(null); setAvatarPreview(null); }}>
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
              <Button size="sm" className="bg-gradient-gold text-primary-foreground" onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>

        {/* Fields */}
        <Card className="glass-card border-gold">
          <CardContent className="p-6 space-y-4">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
                </div>
                <div>
                  <Label>Username</Label>
                  <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                </div>
                <div>
                  <Label>State</Label>
                  <Select value={form.state} onValueChange={v => setForm(f => ({ ...f, state: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Attempt</Label>
                  <Select value={form.attempt} onValueChange={v => setForm(f => ({ ...f, attempt: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["1st", "2nd", "3rd", "4th+"].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Exam</Label>
                  <Select value={form.target_exam} onValueChange={v => setForm(f => ({ ...f, target_exam: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["NDA 1 2026", "NDA 2 2026", "NDA 1 2027"].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Service Preference</Label>
                  <Select value={form.service} onValueChange={v => setForm(f => ({ ...f, service: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["army", "navy", "air force"].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Daily Study Time (hours)</Label>
                  <Input type="number" min="1" max="16" value={form.study_time} onChange={e => setForm(f => ({ ...f, study_time: e.target.value }))} />
                </div>
              </div>
            ) : (
              fields.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <f.icon className="h-4 w-4 text-primary" />
                  <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase w-28">{f.label}</span>
                  <span className="font-semibold text-sm">{f.value}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
