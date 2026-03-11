import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Flag } from "lucide-react";

interface Props {
  questionText: string;
  options?: Record<string, string>;
  correctAnswer?: string;
  userAnswer?: string;
  explanation?: string;
  source?: string;
  className?: string;
  variant?: "icon" | "button";
}

export default function QuestionReportButton({
  questionText, options, correctAnswer, userAnswer, explanation, source = "unknown", className, variant = "icon"
}: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [issueType, setIssueType] = useState("wrong_answer");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user) { toast({ title: "Please login first", variant: "destructive" }); return; }
    setSubmitting(true);
    const { error } = await supabase.from("question_reports").insert({
      user_id: user.id,
      question_text: questionText,
      options: options || {},
      correct_answer: correctAnswer || "",
      user_answer: userAnswer || "",
      explanation: explanation || "",
      source,
      issue_type: issueType,
      issue_description: description,
    } as any);
    if (error) toast({ title: "Error submitting report", variant: "destructive" });
    else toast({ title: "Report submitted! Admin will review it." });
    setOpen(false);
    setDescription("");
    setSubmitting(false);
  };

  return (
    <>
      {variant === "icon" ? (
        <Button size="icon" variant="ghost" className={`h-8 w-8 text-muted-foreground hover:text-warning ${className}`} onClick={() => setOpen(true)} title="Report this question">
          <Flag className="h-4 w-4" />
        </Button>
      ) : (
        <Button size="sm" variant="outline" className={`border-warning/30 text-warning hover:bg-warning/10 ${className}`} onClick={() => setOpen(true)}>
          <Flag className="h-3 w-3 mr-1" /> Report
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" /> Report Question
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-muted/50 p-3 rounded text-sm">{questionText.slice(0, 200)}{questionText.length > 200 ? "..." : ""}</div>
            <div>
              <label className="text-xs text-muted-foreground">Issue Type</label>
              <Select value={issueType} onValueChange={setIssueType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="wrong_answer">Wrong Answer / Incorrect Option</SelectItem>
                  <SelectItem value="wrong_explanation">Wrong Explanation</SelectItem>
                  <SelectItem value="typo">Typo / Formatting Error</SelectItem>
                  <SelectItem value="unclear">Question is Unclear</SelectItem>
                  <SelectItem value="duplicate">Duplicate Question</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Describe the issue</label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What's wrong with this question? What should be the correct answer?" rows={3} />
            </div>
            <Button onClick={submit} disabled={submitting || !description} className="w-full bg-gradient-gold text-primary-foreground font-bold">
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
