import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, X, Loader2 } from "lucide-react";

interface Props {
  value?: string | null;
  onChange: (url: string | null) => void;
  bucket?: string;
  folder?: string;
  className?: string;
  size?: "sm" | "default";
}

export default function ImageUploadButton({ value, onChange, bucket = "question-images", folder = "uploads", className, size = "sm" }: Props) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast({ title: "File too large (max 5MB)", variant: "destructive" }); return; }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(publicUrl);
    }
    setUploading(false);
  };

  if (value) {
    return (
      <div className={`relative inline-block ${className}`}>
        <img src={value} alt="" className="h-16 w-16 object-cover rounded-lg border border-border" />
        <button onClick={() => onChange(null)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center">
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <label className={`inline-flex ${className}`}>
      <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      <Button type="button" variant="outline" size={size} className="border-dashed border-border cursor-pointer" disabled={uploading} asChild>
        <span>{uploading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ImagePlus className="h-3 w-3 mr-1" />}{uploading ? "Uploading..." : "Add Image"}</span>
      </Button>
    </label>
  );
}
