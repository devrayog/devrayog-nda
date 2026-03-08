import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  LayoutDashboard, BookOpen, FileText, Brain, MessageSquare, Users, Dumbbell,
  Trophy, BarChart3, Target, Shield, Bookmark, StickyNote, Bell,
  Settings, FolderOpen, HelpCircle, Star, Swords, Zap
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarHeader, SidebarFooter
} from "@/components/ui/sidebar";

interface NavItem {
  titleKey: string;
  icon: React.ElementType;
  href: string;
}

const mainNav: NavItem[] = [
  { titleKey: "nav.dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { titleKey: "nav.ai_tutor", icon: Brain, href: "/ai-tutor" },
  { titleKey: "nav.notifications", icon: Bell, href: "/notifications" },
];

const studyNav: NavItem[] = [
  { titleKey: "Study Plan", icon: Target, href: "/study-plan" },
  { titleKey: "Maths Hub", icon: Zap, href: "/study/maths" },
  { titleKey: "GAT/GK Hub", icon: BookOpen, href: "/study/gat" },
  { titleKey: "English Hub", icon: FileText, href: "/study/english" },
  { titleKey: "Current Affairs", icon: Star, href: "/current-affairs" },
  { titleKey: "PYQ Papers", icon: FolderOpen, href: "/pyq" },
  { titleKey: "Notes", icon: StickyNote, href: "/notes" },
  { titleKey: "Bookmarks", icon: Bookmark, href: "/bookmarks" },
];

const testNav: NavItem[] = [
  { titleKey: "Mock Tests", icon: FileText, href: "/tests" },
  { titleKey: "Daily Challenge", icon: Swords, href: "/daily-challenge" },
  { titleKey: "Error Log", icon: BarChart3, href: "/error-log" },
  { titleKey: "Question Bank", icon: HelpCircle, href: "/question-bank" },
];

const ssbNav: NavItem[] = [
  { titleKey: "SSB Overview", icon: Shield, href: "/ssb" },
  { titleKey: "OIR Practice", icon: Brain, href: "/ssb/oir" },
  { titleKey: "Mock Interview", icon: MessageSquare, href: "/ssb/interview" },
];

const communityNav: NavItem[] = [
  { titleKey: "Community", icon: Users, href: "/community" },
  { titleKey: "Leaderboard", icon: Trophy, href: "/leaderboard" },
  { titleKey: "Fitness", icon: Dumbbell, href: "/fitness" },
  { titleKey: "Resources", icon: FolderOpen, href: "/resources" },
];

const bottomNav: NavItem[] = [
  { titleKey: "nav.profile", icon: Settings, href: "/profile" },
  { titleKey: "nav.settings", icon: Settings, href: "/settings" },
];

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-mono text-[10px] tracking-[3px] text-primary/70 uppercase">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={location.pathname === item.href} tooltip={item.titleKey}>
                <Link to={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.titleKey}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default function DashboardSidebar() {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="DNA" className="w-8 h-8 rounded-md" />
          <span className="font-display text-lg text-primary tracking-widest">DNA</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="Main" items={mainNav} />
        <NavGroup label="Study" items={studyNav} />
        <NavGroup label="Tests" items={testNav} />
        <NavGroup label="SSB" items={ssbNav} />
        <NavGroup label="Community" items={communityNav} />
      </SidebarContent>

      <SidebarFooter>
        <NavGroup label="" items={bottomNav} />
      </SidebarFooter>
    </Sidebar>
  );
}
