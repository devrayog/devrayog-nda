import DashboardLayout from "@/components/layout/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Globe } from "lucide-react";

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <h1 className="font-display text-3xl text-gradient-gold">{t("nav.settings")}</h1>

        <Card className="glass-card border-gold">
          <CardHeader><CardTitle className="font-display text-xl">{t("settings.theme")}</CardTitle></CardHeader>
          <CardContent className="flex gap-3">
            <Button onClick={() => toggleTheme()} variant={theme === "light" ? "default" : "outline"} className="flex-1 border-gold">
              <Sun className="h-4 w-4 mr-2" /> {t("settings.light")}
            </Button>
            <Button onClick={() => toggleTheme()} variant={theme === "dark" ? "default" : "outline"} className="flex-1 border-gold">
              <Moon className="h-4 w-4 mr-2" /> {t("settings.dark")}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-gold">
          <CardHeader><CardTitle className="font-display text-xl">{t("settings.language")}</CardTitle></CardHeader>
          <CardContent className="flex gap-3">
            <Button onClick={() => setLanguage("en")} variant={language === "en" ? "default" : "outline"} className="flex-1 border-gold">
              <Globe className="h-4 w-4 mr-2" /> English
            </Button>
            <Button onClick={() => setLanguage("hi")} variant={language === "hi" ? "default" : "outline"} className="flex-1 border-gold">
              <Globe className="h-4 w-4 mr-2" /> हिंदी
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
