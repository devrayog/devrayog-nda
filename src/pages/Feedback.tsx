import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MessageSquare, Send, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Feedback() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [type, setType] = useState("general");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!message.trim() || !user) return;
    setLoading(true);
    await supabase.from("feedback").insert({
      user_id: user.id,
      type,
      message: `[Rating: ${rating}/5] ${message}`,
    });
    toast({ title: "Feedback submitted! Thank you. ⭐" });
    setMessage("");
    setRating(0);
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-accent" />
          <h1 className="font-display text-4xl text-gradient-gold">FEEDBACK</h1>
        </div>

        <Card className="glass-card border-gold">
          <CardContent className="p-6 space-y-4">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-card border-gold"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Feedback</SelectItem>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="content">Content Issue</SelectItem>
              </SelectContent>
            </Select>

            {/* Star Rating */}
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">Rate your experience</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "text-warning fill-warning"
                          : "text-muted-foreground"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-xs text-primary font-mono">
                  {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Great" : "Excellent!"}
                </p>
              )}
            </div>

            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind..."
              className="bg-card border-gold min-h-[120px]"
            />
            <Button
              onClick={submit}
              disabled={!message.trim() || loading || rating === 0}
              className="w-full bg-gradient-gold text-primary-foreground font-bold"
            >
              <Send className="h-4 w-4 mr-2" /> Submit Feedback
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
