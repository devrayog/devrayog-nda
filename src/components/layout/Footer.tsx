import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-gold py-8 px-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="DNA" className="w-6 h-6 rounded" />
          <span className="font-display text-sm text-primary tracking-widest">DEVRAYOG NDA AI</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("footer.made_by")}{" "}
          <a href="https://v0-devrayog.vercel.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
            {t("footer.devrayog")}
          </a>
        </p>
        <p className="text-xs text-muted-foreground font-mono">© 2026 {t("footer.rights")}</p>
      </div>
    </footer>
  );
}
