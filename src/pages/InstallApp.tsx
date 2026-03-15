import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Apple, Globe, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) setIsInstalled(true);
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e as BeforeInstallPromptEvent); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setIsInstalled(true);
    }
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <Smartphone className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-display text-4xl text-gradient-gold mb-2">INSTALL DNA APP</h1>
          <p className="text-muted-foreground">Get the full app experience — no app store needed!</p>
        </div>

        {isInstalled ? (
          <Card className="glass-card border-success/30">
            <CardContent className="p-8 text-center">
              <Check className="h-12 w-12 text-success mx-auto mb-4" />
              <h2 className="font-display text-2xl text-success mb-2">APP INSTALLED!</h2>
              <p className="text-muted-foreground text-sm">You're already using DNA as an app. Enjoy!</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {deferredPrompt && (
              <Card className="glass-card border-primary/30">
                <CardContent className="p-6 text-center">
                  <Download className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h2 className="font-display text-xl mb-3">Quick Install</h2>
                  <Button onClick={install} className="bg-gradient-gold text-primary-foreground font-bold text-lg px-8 py-3">
                    <Download className="h-5 w-5 mr-2" /> Install App Now
                  </Button>
                </CardContent>
              </Card>
            )}

            {isIOS && (
              <Card className="glass-card border-gold">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Apple className="h-8 w-8 text-foreground" />
                    <h2 className="font-display text-xl">iPhone / iPad</h2>
                  </div>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>Tap the <strong>Share button</strong> (↑) at the bottom of Safari</li>
                    <li className="flex items-start gap-2"><span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                    <li className="flex items-start gap-2"><span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>Tap <strong>"Add"</strong> — DNA app icon appears on your home screen!</li>
                  </ol>
                </CardContent>
              </Card>
            )}

            {isAndroid && !deferredPrompt && (
              <Card className="glass-card border-gold">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-8 w-8 text-success" />
                    <h2 className="font-display text-xl">Android</h2>
                  </div>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>Tap the <strong>⋮ menu</strong> (three dots) in Chrome</li>
                    <li className="flex items-start gap-2"><span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></li>
                    <li className="flex items-start gap-2"><span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>Tap <strong>"Install"</strong> — Done!</li>
                  </ol>
                </CardContent>
              </Card>
            )}

            {!isIOS && !isAndroid && (
              <Card className="glass-card border-gold">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Globe className="h-8 w-8 text-primary" />
                    <h2 className="font-display text-xl">Desktop Browser</h2>
                  </div>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>Look for the <strong>install icon</strong> (⊕) in the address bar</li>
                    <li className="flex items-start gap-2"><span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>Click <strong>"Install"</strong></li>
                    <li className="flex items-start gap-2"><span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>DNA launches like a native app!</li>
                  </ol>
                </CardContent>
              </Card>
            )}

            <Card className="glass-card border-gold">
              <CardContent className="p-4">
                <h3 className="font-bold text-sm mb-2">Why install?</h3>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>✅ Instant access from home screen</li>
                  <li>✅ Full-screen experience — no browser bars</li>
                  <li>✅ Faster loading with cached content</li>
                  <li>✅ Works like a native app</li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
