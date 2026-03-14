import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallAppPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already dismissed today
    const lastDismissed = localStorage.getItem("install_prompt_dismissed");
    if (lastDismissed) {
      const dismissedDate = new Date(lastDismissed).toDateString();
      const today = new Date().toDateString();
      if (dismissedDate === today) return;
    }

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after 5 seconds
      setTimeout(() => setShow(true), 5000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS/Safari where beforeinstallprompt doesn't fire
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !window.matchMedia("(display-mode: standalone)").matches) {
      setTimeout(() => setShow(true), 5000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("install_prompt_dismissed", new Date().toISOString());
  };

  const install = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShow(false);
        localStorage.setItem("install_prompt_dismissed", new Date().toISOString());
      }
    } else {
      // iOS fallback - show instructions
      alert("Tap the Share button (↑) in Safari, then tap 'Add to Home Screen' to install the app.");
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-6 md:max-w-sm"
        >
          <div className="bg-card border border-primary/30 rounded-2xl p-4 shadow-2xl shadow-primary/10 backdrop-blur-xl">
            <button onClick={dismiss} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                <Smartphone className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-sm text-foreground mb-0.5">📲 Install DNA App</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Get instant access, offline support & push notifications. No app store needed!
                </p>
                <div className="flex gap-2">
                  <Button onClick={install} size="sm" className="bg-gradient-gold text-primary-foreground font-bold text-xs flex-1">
                    <Download className="h-3 w-3 mr-1" /> Install Now
                  </Button>
                  <Button onClick={dismiss} size="sm" variant="ghost" className="text-xs text-muted-foreground">
                    Later
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
