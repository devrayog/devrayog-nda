import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, Trash2, Save, Lock, Image, Eye } from "lucide-react";
import { motion } from "framer-motion";

type SSBType = "ppdt" | "tat" | "wat" | "srt" | "sdt";
const SSB_TYPES: { value: SSBType; label: string; itemLabel: string }[] = [
  { value: "ppdt", label: "PPDT (Photos)", itemLabel: "Photo" },
  { value: "tat", label: "TAT (12 Photos)", itemLabel: "Photo" },
  { value: "wat", label: "WAT (60 Words)", itemLabel: "Word" },
  { value: "srt", label: "SRT (60 Situations)", itemLabel: "Situation" },
  { value: "sdt", label: "SDT (5 Questions)", itemLabel: "Question" },
];

interface SSBSet { id: string; type: string; title: string; is_active: boolean; }
interface SSBItem { id: string; set_id: string; sort_order: number; content_text: string; image_url: string | null; }

export default function AdminSSB() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [ssbType, setSSBType] = useState<SSBType>("ppdt");
  const [sets, setSets] = useState<SSBSet[]>([]);
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [items, setItems] = useState<SSBItem[]>([]);
  const [newSetTitle, setNewSetTitle] = useState("");
  const [newItem, setNewItem] = useState({ content_text: "", image_url: "" });

  useEffect(() => {
    const check = async () => {
      if (!user) return;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      setIsAdmin(!!(data && data.length > 0));
      setChecking(false);
    };
    check();
  }, [user]);

  const loadSets = async () => {
    const { data } = await supabase.from("ssb_sets").select("*").eq("type", ssbType).order("created_at", { ascending: false });
    setSets((data as SSBSet[]) || []);
  };

  const loadItems = async (setId: string) => {
    const { data } = await supabase.from("ssb_set_items").select("*").eq("set_id", setId).order("sort_order");
    setItems((data as SSBItem[]) || []);
  };

  useEffect(() => { if (isAdmin) { loadSets(); setSelectedSet(null); setItems([]); } }, [isAdmin, ssbType]);

  const createSet = async () => {
    if (!newSetTitle.trim()) return;
    await supabase.from("ssb_sets").insert({ type: ssbType, title: newSetTitle.trim(), created_by: user?.id } as any);
    setNewSetTitle("");
    toast({ title: "Set created!" });
    loadSets();
  };

  const deleteSet = async (id: string) => {
    if (!confirm("Delete this set and all its items?")) return;
    await supabase.from("ssb_sets").delete().eq("id", id);
    if (selectedSet === id) { setSelectedSet(null); setItems([]); }
    toast({ title: "Set deleted" });
    loadSets();
  };

  const addItem = async () => {
    if (!selectedSet || (!newItem.content_text.trim() && !newItem.image_url.trim())) return;
    await supabase.from("ssb_set_items").insert({
      set_id: selectedSet, content_text: newItem.content_text.trim(),
      image_url: newItem.image_url.trim() || null, sort_order: items.length,
    } as any);
    setNewItem({ content_text: "", image_url: "" });
    toast({ title: "Item added!" });
    loadItems(selectedSet);
  };

  const deleteItem = async (id: string) => {
    await supabase.from("ssb_set_items").delete().eq("id", id);
    if (selectedSet) loadItems(selectedSet);
  };

  if (checking) return <DashboardLayout><div className="p-6 flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div></DashboardLayout>;
  if (!isAdmin) return <DashboardLayout><div className="p-6 max-w-md mx-auto mt-20"><Card className="glass-card border-gold"><CardContent className="p-8 text-center"><Lock className="h-12 w-12 text-primary/30 mx-auto mb-4" /><h1 className="font-display text-3xl text-gradient-gold">ADMIN ONLY</h1></CardContent></Card></div></DashboardLayout>;

  const typeConfig = SSB_TYPES.find(t => t.value === ssbType)!;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-accent" />
          <h1 className="font-display text-4xl text-gradient-gold">MANAGE SSB SETS</h1>
        </div>

        <Select value={ssbType} onValueChange={v => setSSBType(v as SSBType)}>
          <SelectTrigger className="w-[250px] border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SSB_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Create Set */}
        <Card className="glass-card border-gold">
          <CardContent className="p-4 flex gap-3">
            <Input placeholder={`New ${typeConfig.label} set title...`} value={newSetTitle} onChange={e => setNewSetTitle(e.target.value)} className="bg-card border-border" />
            <Button onClick={createSet} className="bg-gradient-gold text-primary-foreground font-bold shrink-0">
              <Plus className="h-4 w-4 mr-1" /> Create Set
            </Button>
          </CardContent>
        </Card>

        {/* Sets List */}
        <div className="grid gap-3">
          {sets.map(s => (
            <Card key={s.id} className={`glass-card cursor-pointer transition-colors ${selectedSet === s.id ? "border-primary" : "border-gold"}`}
              onClick={() => { setSelectedSet(s.id); loadItems(s.id); }}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{s.title}</h3>
                  <Badge variant="outline" className="text-[9px] mt-1">{s.type.toUpperCase()}</Badge>
                </div>
                <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); deleteSet(s.id); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {sets.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">No sets yet. Create one above.</p>}
        </div>

        {/* Items for selected set */}
        {selectedSet && (
          <div className="space-y-4">
            <h2 className="font-display text-xl text-gradient-gold">ITEMS IN SET</h2>

            <Card className="glass-card border-gold">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-sm flex items-center gap-2"><Plus className="h-4 w-4" /> Add {typeConfig.itemLabel}</h3>
                <Textarea placeholder={`${typeConfig.itemLabel} text (word, situation, or description)...`}
                  value={newItem.content_text} onChange={e => setNewItem(p => ({ ...p, content_text: e.target.value }))}
                  className="bg-card border-border" rows={2} />
                <Input placeholder="Image URL (for photos)" value={newItem.image_url}
                  onChange={e => setNewItem(p => ({ ...p, image_url: e.target.value }))}
                  className="bg-card border-border" />
                <Button onClick={addItem} className="bg-gradient-gold text-primary-foreground font-bold">
                  <Save className="h-4 w-4 mr-1" /> Add {typeConfig.itemLabel}
                </Button>
              </CardContent>
            </Card>

            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="glass-card border-gold">
                  <CardContent className="p-4 flex items-start gap-3">
                    <Badge variant="outline" className="shrink-0 text-[9px]">#{item.sort_order + 1}</Badge>
                    <div className="flex-1 space-y-1">
                      {item.content_text && <p className="text-sm">{item.content_text}</p>}
                      {item.image_url && (
                        <div className="flex items-center gap-2">
                          <Image className="h-3 w-3 text-muted-foreground" />
                          <a href={item.image_url} target="_blank" className="text-xs text-primary underline truncate">{item.image_url}</a>
                        </div>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => deleteItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {items.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">No items yet.</p>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
