import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const PROVIDERS = [
  { value: "openai", label: "OpenAI (GPT-4o, GPT-5)", placeholder: "sk-...", baseUrl: "https://api.openai.com/v1/chat/completions", model: "gpt-4o-mini" },
  { value: "gemini", label: "Google Gemini", placeholder: "AIza...", baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", model: "gemini-2.0-flash" },
  { value: "claude", label: "Anthropic Claude", placeholder: "sk-ant-...", baseUrl: "https://api.anthropic.com/v1/messages", model: "claude-sonnet-4-20250514" },
  { value: "openrouter", label: "OpenRouter (Any Model)", placeholder: "sk-or-...", baseUrl: "https://openrouter.ai/api/v1/chat/completions", model: "google/gemini-2.0-flash-exp:free" },
  { value: "groq", label: "Groq", placeholder: "gsk_...", baseUrl: "https://api.groq.com/openai/v1/chat/completions", model: "llama-3.3-70b-versatile" },
  { value: "together", label: "Together AI", placeholder: "...", baseUrl: "https://api.together.xyz/v1/chat/completions", model: "meta-llama/Llama-3.3-70B-Instruct-Turbo" },
  { value: "sarvam", label: "Sarvam AI", placeholder: "...", baseUrl: "https://api.sarvam.ai/v1/chat/completions", model: "sarvam-m" },
  { value: "custom", label: "Custom (OpenAI-compatible)", placeholder: "API Key", baseUrl: "", model: "" },
];

export default function AdminAPIKeySettings() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("openai");
  const [customUrl, setCustomUrl] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [savedProvider, setSavedProvider] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("admin_settings").select("value").eq("key", "custom_ai_api_key").single(),
      supabase.from("admin_settings").select("value").eq("key", "custom_ai_provider").single(),
      supabase.from("admin_settings").select("value").eq("key", "custom_ai_base_url").single(),
      supabase.from("admin_settings").select("value").eq("key", "custom_ai_model").single(),
    ]).then(([keyRes, provRes, urlRes, modelRes]) => {
      if (keyRes.data?.value) { setSavedKey(keyRes.data.value); setApiKey(keyRes.data.value); }
      if (provRes.data?.value) { setSavedProvider(provRes.data.value); setProvider(provRes.data.value); }
      if (urlRes.data?.value) setCustomUrl(urlRes.data.value);
      if (modelRes.data?.value) setCustomModel(modelRes.data.value);
    });
  }, []);

  const upsert = async (key: string, value: string) => {
    const { data } = await supabase.from("admin_settings").select("id").eq("key", key).single();
    if (data) await supabase.from("admin_settings").update({ value } as any).eq("key", key);
    else await supabase.from("admin_settings").insert({ key, value } as any);
  };

  const saveAll = async () => {
    setSaving(true);
    const prov = PROVIDERS.find(p => p.value === provider);
    const baseUrl = provider === "custom" ? customUrl : (prov?.baseUrl || "");
    const model = provider === "custom" ? customModel : (prov?.model || "");

    await Promise.all([
      upsert("custom_ai_api_key", apiKey),
      upsert("custom_ai_provider", provider),
      upsert("custom_ai_base_url", baseUrl),
      upsert("custom_ai_model", model),
    ]);
    setSavedKey(apiKey);
    setSavedProvider(provider);
    setSaving(false);
    setTestResult(null);
    toast({ title: apiKey ? `✅ ${prov?.label || "Custom"} API key saved! All AI features will use this.` : "Custom key removed. Using default." });
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: "Say 'API key working!' in exactly 3 words." }] }),
      });
      if (!resp.ok) {
        const err = await resp.text();
        console.error("Test failed:", resp.status, err);
        setTestResult("error");
        toast({ title: `❌ Connection failed (${resp.status})`, description: "Check your API key and provider selection.", variant: "destructive" });
      } else {
        // Read a bit of the stream to confirm it works
        const reader = resp.body?.getReader();
        if (reader) {
          const { value } = await reader.read();
          reader.cancel();
          if (value) {
            setTestResult("success");
            toast({ title: "✅ API key is working! AI features will use your key." });
          }
        }
      }
    } catch (e) {
      setTestResult("error");
      toast({ title: "❌ Connection test failed", description: String(e), variant: "destructive" });
    }
    setTesting(false);
  };

  const removeKey = async () => {
    setSaving(true);
    await Promise.all([
      upsert("custom_ai_api_key", ""),
      upsert("custom_ai_provider", ""),
      upsert("custom_ai_base_url", ""),
      upsert("custom_ai_model", ""),
    ]);
    setApiKey(""); setSavedKey(""); setSavedProvider(""); setTestResult(null);
    setSaving(false);
    toast({ title: "Custom API key removed. Using default AI." });
  };

  const currentProv = PROVIDERS.find(p => p.value === provider);

  return (
    <Card className="glass-card border-gold">
      <CardHeader><CardTitle className="text-sm">🔑 Custom AI API Key</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Select your AI provider and add your API key. ALL AI features across the platform will use YOUR key.
        </p>
        <div>
          <label className="text-xs text-muted-foreground">AI Provider</label>
          <Select value={provider} onValueChange={v => { setProvider(v); setTestResult(null); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PROVIDERS.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Input
            type="password"
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); setTestResult(null); }}
            placeholder={currentProv?.placeholder || "API Key"}
            className="font-mono text-xs"
          />
          <Button onClick={saveAll} disabled={saving} className="bg-gradient-gold text-primary-foreground font-bold shrink-0">
            {saving ? "..." : "Save"}
          </Button>
        </div>
        {provider === "custom" && (
          <div className="space-y-2">
            <Input value={customUrl} onChange={e => setCustomUrl(e.target.value)} placeholder="Base URL (e.g. https://api.example.com/v1/chat/completions)" className="text-xs" />
            <Input value={customModel} onChange={e => setCustomModel(e.target.value)} placeholder="Model name (e.g. gpt-4o-mini)" className="text-xs" />
          </div>
        )}
        {savedKey && (
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-success/10 p-2 rounded text-xs">
              <span className="text-success font-bold">✓ Active: {PROVIDERS.find(p => p.value === savedProvider)?.label || "Custom"} — {savedKey.slice(0, 8)}...</span>
              <Button size="sm" variant="ghost" className="text-destructive text-xs h-6" onClick={removeKey}>Remove</Button>
            </div>
            <Button onClick={testConnection} disabled={testing} variant="outline" size="sm" className="w-full border-gold text-xs">
              {testing ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Testing...</> :
               testResult === "success" ? <><CheckCircle className="h-3 w-3 mr-1 text-success" /> Connected!</> :
               testResult === "error" ? <><XCircle className="h-3 w-3 mr-1 text-destructive" /> Failed — Retry</> :
               "🔌 Test Connection"}
            </Button>
          </div>
        )}
        <p className="text-[10px] text-muted-foreground">
          Supported: OpenAI, Gemini, Claude, Groq, Together, Sarvam, OpenRouter, or any OpenAI-compatible API. Save first, then test.
        </p>
      </CardContent>
    </Card>
  );
}
