import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, BookOpen, FileText, Brain, MessageSquare, Users, Dumbbell,
  Trophy, BarChart3, Target, Shield, Bookmark, StickyNote, Bell,
  Settings, FolderOpen, HelpCircle, Star, Swords, Zap, UserCircle,
  GraduationCap, Heart, Calculator, Globe, Newspaper, ChevronDown, ChevronRight,
  HeartPulse, AlertTriangle, ClipboardList, Crown, Download, Megaphone, Image
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarHeader, SidebarFooter
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface NavItem { titleKey: string; icon: React.ElementType; href: string; }

const mainNav: NavItem[] = [
  { titleKey: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { titleKey: "AI Tutor", icon: Brain, href: "/ai-tutor" },
  { titleKey: "Notifications", icon: Bell, href: "/notifications" },
  { titleKey: "Achievements", icon: Trophy, href: "/achievements" },
  { titleKey: "Activity Log", icon: BarChart3, href: "/activity" },
  { titleKey: "DNA Score", icon: Target, href: "/dna-score" },
  { titleKey: "Premium", icon: Crown, href: "/premium" },
  { titleKey: "Install App", icon: Download, href: "/install" },
];

const studyNav: NavItem[] = [
  { titleKey: "Study Plan", icon: Target, href: "/study-plan" },
  { titleKey: "Maths Hub", icon: Calculator, href: "/study/maths" },
  { titleKey: "GAT/GK Hub", icon: Globe, href: "/study/gat" },
  { titleKey: "English Hub", icon: FileText, href: "/study/english" },
  { titleKey: "Current Affairs", icon: Newspaper, href: "/current-affairs" },
  { titleKey: "PYQ Papers", icon: FolderOpen, href: "/pyq" },
  { titleKey: "Notes", icon: StickyNote, href: "/notes" },
  { titleKey: "Bookmarks", icon: Bookmark, href: "/bookmarks" },
  { titleKey: "Revision", icon: BookOpen, href: "/revision" },
  { titleKey: "Formulas", icon: Calculator, href: "/formulas" },
  { titleKey: "Vocabulary", icon: GraduationCap, href: "/vocabulary" },
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
  { titleKey: "PPDT", icon: FileText, href: "/ssb/ppdt" },
  { titleKey: "TAT", icon: FileText, href: "/ssb/tat" },
  { titleKey: "WAT", icon: FileText, href: "/ssb/wat" },
  { titleKey: "SRT", icon: FileText, href: "/ssb/srt" },
  { titleKey: "SDT", icon: FileText, href: "/ssb/sdt" },
  { titleKey: "GD Practice", icon: Users, href: "/ssb/gd" },
  { titleKey: "Interview", icon: MessageSquare, href: "/ssb/interview" },
  { titleKey: "Personality Tips", icon: Star, href: "/ssb/personality" },
  { titleKey: "Screenout", icon: AlertTriangle, href: "/ssb/screenout" },
];

const communityNav: NavItem[] = [
  { titleKey: "Community", icon: Users, href: "/community" },
  { titleKey: "Live Chat", icon: MessageSquare, href: "/community/chat" },
  { titleKey: "Leaderboard", icon: Trophy, href: "/leaderboard" },
  { titleKey: "Mentors", icon: UserCircle, href: "/mentors" },
  { titleKey: "Study Partners", icon: Users, href: "/study-partner" },
  { titleKey: "Success Stories", icon: Star, href: "/success-stories" },
];

const fitnessNav: NavItem[] = [
  { titleKey: "Fitness Plan", icon: Dumbbell, href: "/fitness" },
  { titleKey: "Running Tracker", icon: Dumbbell, href: "/fitness/running" },
  { titleKey: "Am I Fit?", icon: Zap, href: "/fitness/eligibility" },
  { titleKey: "Medical Standards", icon: HeartPulse, href: "/fitness/medical" },
  { titleKey: "Am I Medically Fit?", icon: HeartPulse, href: "/fitness/medical-check" },
];

const resourceNav: NavItem[] = [
  { titleKey: "Resources", icon: FolderOpen, href: "/resources" },
  { titleKey: "Books", icon: BookOpen, href: "/resources/books" },
  { titleKey: "Videos", icon: FileText, href: "/resources/videos" },
  { titleKey: "Downloads", icon: FolderOpen, href: "/resources/downloads" },
  { titleKey: "FAQ", icon: HelpCircle, href: "/faq" },
];

const adminNav: NavItem[] = [
  { titleKey: "Admin Panel", icon: Shield, href: "/admin" },
  { titleKey: "Users", icon: Users, href: "/admin/users" },
  { titleKey: "Topics & MCQs", icon: BookOpen, href: "/admin/topics" },
  { titleKey: "Current Affairs", icon: Newspaper, href: "/admin/current-affairs" },
  { titleKey: "PYQ Manage", icon: FolderOpen, href: "/admin/pyq" },
  { titleKey: "Resources", icon: FolderOpen, href: "/admin/resources" },
  { titleKey: "FAQ", icon: HelpCircle, href: "/admin/faq" },
  { titleKey: "SSB Sets", icon: Shield, href: "/admin/ssb" },
  { titleKey: "OIR Questions", icon: Brain, href: "/admin/oir" },
  { titleKey: "Screenout", icon: AlertTriangle, href: "/admin/screenout" },
  { titleKey: "Vocabulary", icon: GraduationCap, href: "/admin/vocabulary" },
  { titleKey: "Daily Tasks", icon: ClipboardList, href: "/admin/daily-tasks" },
  { titleKey: "Fitness Stds", icon: Dumbbell, href: "/admin/fitness" },
  { titleKey: "Medical Stds", icon: HeartPulse, href: "/admin/medical" },
  { titleKey: "Success Stories", icon: Star, href: "/admin/success-stories" },
  { titleKey: "Girls NDA", icon: Heart, href: "/admin/girls-nda" },
  { titleKey: "Guide Editor", icon: BookOpen, href: "/admin/guide" },
  { titleKey: "Reports", icon: HelpCircle, href: "/admin/reports" },
  { titleKey: "Announcements", icon: Megaphone, href: "/admin/announcements" },
  { titleKey: "SEO Settings", icon: Globe, href: "/admin/seo" },
  { titleKey: "Premium Settings", icon: Crown, href: "/admin/premium-settings" },
];

function CollapsibleNavGroup({ label, items, defaultOpen = false }: { label: string; items: NavItem[]; defaultOpen?: boolean }) {
  const location = useLocation();
  const isActive = items.some(i => location.pathname === i.href || location.pathname.startsWith(i.href + "/"));
  const [open, setOpen] = useState(defaultOpen || isActive);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarGroup>
        <CollapsibleTrigger className="w-full">
          <SidebarGroupLabel className="font-mono text-[10px] tracking-[3px] text-primary/70 uppercase flex items-center justify-between cursor-pointer hover:text-primary transition-colors">
            {label}
            {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href} tooltip={item.titleKey}>
                    <Link to={item.href}><item.icon className="h-4 w-4" /><span>{item.titleKey}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const location = useLocation();
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-mono text-[10px] tracking-[3px] text-primary/70 uppercase">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={location.pathname === item.href} tooltip={item.titleKey}>
                <Link to={item.href}><item.icon className="h-4 w-4" /><span>{item.titleKey}</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default function DashboardSidebar() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin")
      .then(({ data }) => { if (data && data.length > 0) setIsAdmin(true); });
    supabase.from("profiles").select("is_girl, service, cleared_written").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  const meta = user?.user_metadata || {};
  // Determine which sections to show based on profile
  const showSSB = meta.cleared_written === "yes" || profile?.cleared_written === "yes" || meta.service !== undefined;
  const showGirls = meta.is_girl === true || meta.is_girl === "true" || profile?.is_girl === true;

  const bottomNav: NavItem[] = [
    { titleKey: "Profile", icon: UserCircle, href: "/profile" },
    { titleKey: "Settings", icon: Settings, href: "/settings" },
    { titleKey: "Feedback", icon: MessageSquare, href: "/feedback" },
    ...(showGirls ? [{ titleKey: "Girls NDA", icon: Heart, href: "/girls" }] : []),
  ];

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
        <CollapsibleNavGroup label="Study" items={studyNav} defaultOpen />
        <CollapsibleNavGroup label="Tests" items={testNav} />
        {showSSB && <CollapsibleNavGroup label="SSB Prep" items={ssbNav} />}
        <CollapsibleNavGroup label="Community" items={communityNav} />
        <CollapsibleNavGroup label="Fitness" items={fitnessNav} />
        <CollapsibleNavGroup label="Resources" items={resourceNav} />
        {isAdmin && <CollapsibleNavGroup label="Admin" items={adminNav} />}
      </SidebarContent>
      <SidebarFooter>
        <NavGroup label="" items={bottomNav} />
      </SidebarFooter>
    </Sidebar>
  );
}
