import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sun, Moon, Globe, Menu, X, Bell, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 md:px-8 bg-background/95 backdrop-blur-xl border-b border-gold">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3">
        <img src="/logo.png" alt="Devrayog NDA AI" className="w-10 h-10 rounded-lg" />
        <div className="flex flex-col leading-none">
          <span className="font-display text-xl text-primary tracking-widest">DEVRAYOG NDA AI</span>
          <span className="font-mono text-[9px] text-muted-foreground tracking-[3px]">NDA IN DNA</span>
        </div>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-3">
        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
          {theme === "dark" ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4 text-primary" />}
        </Button>

        {/* Language toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === "en" ? "hi" : "en")}
          className="h-8 font-mono text-xs text-primary"
        >
          <Globe className="h-3 w-3 mr-1" />
          {language === "en" ? "हिंदी" : "EN"}
        </Button>

        <Link to="/premium">
          <Button variant="ghost" size="sm" className="h-8 text-sm font-semibold text-primary">
            <Crown className="h-3 w-3 mr-1" /> Premium
          </Button>
        </Link>

        {user ? (
          <>
            <Link to="/notifications">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bell className="h-4 w-4 text-primary" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="h-8 text-sm font-semibold">
                {t("nav.dashboard")}
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <User className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 text-destructive" />
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="outline" size="sm" className="h-8 border-gold text-primary font-bold tracking-wider text-xs">
                {t("nav.login")}
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="h-8 bg-gradient-gold text-primary-foreground font-bold tracking-wider text-xs">
                {t("nav.signup")}
              </Button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-background/98 backdrop-blur-xl p-6 flex flex-col gap-4 md:hidden animate-fade-in">
          <div className="flex gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={toggleTheme} className="flex-1 border-gold">
              {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              {theme === "dark" ? t("settings.light") : t("settings.dark")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setLanguage(language === "en" ? "hi" : "en")} className="flex-1 border-gold">
              <Globe className="h-4 w-4 mr-2" />
              {language === "en" ? "हिंदी" : "English"}
            </Button>
          </div>

          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="p-3 rounded-lg bg-card border border-gold text-center font-semibold">{t("nav.dashboard")}</Link>
              <Link to="/ai-tutor" onClick={() => setMobileOpen(false)} className="p-3 rounded-lg bg-card border border-gold text-center font-semibold">{t("nav.ai_tutor")}</Link>
              <Link to="/tests" onClick={() => setMobileOpen(false)} className="p-3 rounded-lg bg-card border border-gold text-center font-semibold">{t("nav.tests")}</Link>
              <Link to="/study" onClick={() => setMobileOpen(false)} className="p-3 rounded-lg bg-card border border-gold text-center font-semibold">{t("nav.study")}</Link>
              <Link to="/ssb" onClick={() => setMobileOpen(false)} className="p-3 rounded-lg bg-card border border-gold text-center font-semibold">{t("nav.ssb")}</Link>
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="p-3 rounded-lg bg-card border border-gold text-center font-semibold">{t("nav.profile")}</Link>
              <Button variant="destructive" onClick={() => { handleSignOut(); setMobileOpen(false); }}>{t("nav.logout")}</Button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="p-3 rounded-lg border border-gold text-center font-bold text-primary tracking-wider">{t("nav.login")}</Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)} className="p-3 rounded-lg bg-gradient-gold text-center font-bold text-primary-foreground tracking-wider">{t("nav.signup")}</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
