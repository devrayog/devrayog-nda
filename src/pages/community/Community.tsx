import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { Users, MessageSquare, Award, UserPlus, ChevronRight, Trophy, Heart, Send, Trash2, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "general", label: "General" },
  { value: "doubt", label: "Doubts" },
  { value: "strategy", label: "Strategy" },
  { value: "motivation", label: "Motivation" },
  { value: "news", label: "News" },
];

const LINKS = [
  { href: "/mentors", icon: Award, title: "Mentor Connect", desc: "Connect with NDA-cleared officers", color: "text-primary" },
  { href: "/study-partner", icon: UserPlus, title: "Study Partner", desc: "Find accountability partners", color: "text-accent" },
  { href: "/success-stories", icon: Trophy, title: "Success Stories", desc: "Real NDA selection stories", color: "text-success" },
  { href: "/leaderboard", icon: Trophy, title: "Leaderboard", desc: "See your ranking", color: "text-warning" },
];

interface Post {
  id: string;
  user_id: string;
  content: string;
  category: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
  liked_by_me?: boolean;
}

interface Reply {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name?: string;
}

export default function Community() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [posting, setPosting] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [replyText, setReplyText] = useState("");

  const loadPosts = async () => {
    const { data: postsData } = await supabase.from("community_posts").select("*").order("is_pinned", { ascending: false }).order("created_at", { ascending: false }).limit(50);
    if (!postsData) { setLoading(false); return; }

    // Get author names
    const userIds = [...new Set(postsData.map((p: any) => p.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, username, avatar_url").in("user_id", userIds);
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    // Get my likes
    const { data: myLikes } = user ? await supabase.from("post_likes").select("post_id").eq("user_id", user.id) : { data: [] };
    const likedSet = new Set((myLikes || []).map((l: any) => l.post_id));

    const enriched = postsData.map((p: any) => ({
      ...p,
      author_name: profileMap.get(p.user_id)?.full_name || profileMap.get(p.user_id)?.username || "Cadet",
      author_avatar: profileMap.get(p.user_id)?.avatar_url,
      liked_by_me: likedSet.has(p.id),
    }));
    setPosts(enriched);
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, [user]);

  const handlePost = async () => {
    if (!newContent.trim() || !user) return;
    setPosting(true);
    await supabase.from("community_posts").insert({ user_id: user.id, content: newContent.trim(), category: newCategory } as any);
    setNewContent("");
    toast({ title: "Posted!" });
    loadPosts();
    setPosting(false);
  };

  const handleLike = async (postId: string, liked: boolean) => {
    if (!user) return;
    if (liked) {
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id } as any);
    }
    loadPosts();
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("community_posts").delete().eq("id", postId);
    toast({ title: "Post deleted" });
    loadPosts();
  };

  const loadReplies = async (postId: string) => {
    const { data } = await supabase.from("post_replies").select("*").eq("post_id", postId).order("created_at");
    if (!data) return;
    const userIds = [...new Set(data.map((r: any) => r.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, username").in("user_id", userIds);
    const pm = new Map((profiles || []).map((p: any) => [p.user_id, p]));
    setReplies(prev => ({
      ...prev,
      [postId]: data.map((r: any) => ({ ...r, author_name: pm.get(r.user_id)?.full_name || pm.get(r.user_id)?.username || "Cadet" })),
    }));
  };

  const handleReply = async (postId: string) => {
    if (!replyText.trim() || !user) return;
    await supabase.from("post_replies").insert({ post_id: postId, user_id: user.id, content: replyText.trim() } as any);
    setReplyText("");
    loadReplies(postId);
    loadPosts();
  };

  const toggleExpand = (postId: string) => {
    if (expandedPost === postId) { setExpandedPost(null); return; }
    setExpandedPost(postId);
    if (!replies[postId]) loadReplies(postId);
  };

  const filtered = filterCat === "all" ? posts : posts.filter(p => p.category === filterCat);

  const timeAgo = (date: string) => {
    const d = Date.now() - new Date(date).getTime();
    if (d < 60000) return "just now";
    if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
    if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
    return `${Math.floor(d / 86400000)}d ago`;
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20">
              <Users className="h-7 w-7 text-accent" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-gradient-gold">COMMUNITY</h1>
              <p className="text-muted-foreground text-xs">{posts.length} posts from fellow aspirants</p>
            </div>
          </div>
        </motion.div>

        {/* Compose */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card className="glass-card border-gold">
            <CardContent className="p-4 space-y-3">
              <Textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Share a doubt, strategy, or motivate someone..." rows={3} className="bg-background/50" />
              <div className="flex items-center gap-2">
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="text-xs bg-card border border-border rounded-md px-2 py-1.5">
                  {CATEGORIES.slice(1).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <Button onClick={handlePost} disabled={posting || !newContent.trim()} size="sm" className="ml-auto bg-gradient-gold text-primary-foreground font-bold">
                  <Send className="h-3 w-3 mr-1.5" /> Post
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <Button key={c.value} size="sm" variant={filterCat === c.value ? "default" : "outline"} onClick={() => setFilterCat(c.value)}
              className={filterCat === c.value ? "bg-gradient-gold text-primary-foreground" : "border-gold"}>
              {c.label}
            </Button>
          ))}
        </motion.div>

        {/* Feed */}
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((post, i) => (
              <motion.div key={post.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 3}>
                <Card className="glass-card border-gold">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                        {post.author_avatar ? <img src={post.author_avatar} className="w-full h-full rounded-full object-cover" /> : (post.author_name || "C")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{post.author_name}</span>
                          <span className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary`}>{post.category}</span>
                          <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(post.created_at)}</span>
                        </div>
                        <p className="text-sm mt-1.5 whitespace-pre-wrap">{post.content}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <button onClick={() => handleLike(post.id, !!post.liked_by_me)} className={`flex items-center gap-1 text-xs transition-colors ${post.liked_by_me ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`}>
                            <Heart className={`h-3.5 w-3.5 ${post.liked_by_me ? "fill-destructive" : ""}`} />
                            {post.likes_count > 0 && post.likes_count}
                          </button>
                          <button onClick={() => toggleExpand(post.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                            <MessageCircle className="h-3.5 w-3.5" />
                            {post.replies_count > 0 && post.replies_count}
                          </button>
                          {post.user_id === user?.id && (
                            <button onClick={() => handleDelete(post.id)} className="text-xs text-muted-foreground hover:text-destructive transition-colors ml-auto">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Replies */}
                        <AnimatePresence>
                          {expandedPost === post.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="mt-3 pt-3 border-t border-border space-y-2">
                                {(replies[post.id] || []).map(r => (
                                  <div key={r.id} className="flex gap-2 text-xs">
                                    <span className="font-bold text-primary">{r.author_name}</span>
                                    <span className="text-foreground">{r.content}</span>
                                    <span className="text-muted-foreground ml-auto flex-shrink-0">{timeAgo(r.created_at)}</span>
                                  </div>
                                ))}
                                <div className="flex gap-2 mt-2">
                                  <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..."
                                    className="flex-1 text-xs bg-background/50 border border-border rounded-md px-2 py-1.5"
                                    onKeyDown={e => e.key === "Enter" && handleReply(post.id)} />
                                  <Button size="sm" variant="ghost" onClick={() => handleReply(post.id)} disabled={!replyText.trim()}>
                                    <Send className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <Card className="glass-card border-gold">
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                  <h2 className="font-display text-xl text-gradient-gold mb-2">NO POSTS YET</h2>
                  <p className="text-muted-foreground text-sm">Be the first to start a discussion!</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          {LINKS.map((section, i) => (
            <motion.div key={section.href} initial="hidden" animate="visible" variants={fadeUp} custom={i + 10}>
              <Link to={section.href}>
                <Card className="glass-card border-gold hover:scale-[1.01] transition-transform cursor-pointer">
                  <CardContent className="p-3 flex items-center gap-3">
                    <section.icon className={`h-5 w-5 ${section.color}`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xs">{section.title}</h3>
                      <p className="text-[10px] text-muted-foreground truncate">{section.desc}</p>
                    </div>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
