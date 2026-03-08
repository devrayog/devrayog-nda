import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Construction } from "lucide-react";

interface Props {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: Props) {
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="glass-card border-gold">
          <CardContent className="p-12 text-center">
            <Construction className="h-16 w-16 text-primary/30 mx-auto mb-4" />
            <h1 className="font-display text-3xl text-gradient-gold mb-2">{title}</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {description || "This feature is being built by AI. Check back soon — it will be personalized for your NDA preparation journey."}
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
