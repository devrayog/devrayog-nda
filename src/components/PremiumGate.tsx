import { usePremiumGate } from "@/hooks/usePremiumGate";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { Link } from "react-router-dom";

interface PremiumGateProps {
  children: React.ReactNode;
  feature?: string;
}

export default function PremiumGate({ children, feature }: PremiumGateProps) {
  const { canAccess, premiumEnabled, loading } = usePremiumGate();

  if (loading) return null;
  if (canAccess) return <>{children}</>;

  return (
    <div className="relative">
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
        <div className="text-center p-6 max-w-xs">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Crown className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-display text-lg text-gradient-gold mb-1">Premium Feature</h3>
          <p className="text-xs text-muted-foreground mb-4">
            {feature || "This feature"} is available for Premium members only.
          </p>
          <Link to="/premium">
            <Button className="bg-gradient-gold text-primary-foreground font-bold text-xs">
              <Lock className="h-3 w-3 mr-1" /> Get Premium →
            </Button>
          </Link>
        </div>
      </div>
      <div className="opacity-30 pointer-events-none blur-[2px]">
        {children}
      </div>
    </div>
  );
}

/** A button that shows premium lock when not accessible */
export function PremiumButton({ onClick, children, feature, ...props }: { onClick: () => void; children: React.ReactNode; feature?: string } & React.ComponentProps<typeof Button>) {
  const { canAccess, premiumEnabled } = usePremiumGate();

  if (!premiumEnabled || canAccess) {
    return <Button onClick={onClick} {...props}>{children}</Button>;
  }

  return (
    <Link to="/premium">
      <Button {...props} className={`${props.className || ""} relative`}>
        <Crown className="h-3 w-3 mr-1 text-yellow-400" />
        {children}
        <Lock className="h-3 w-3 ml-1 text-yellow-400/60" />
      </Button>
    </Link>
  );
}
