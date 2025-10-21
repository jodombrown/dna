import { Badge } from "@/components/ui/badge";

interface MatchScoreBadgeProps {
  score: number;
  size?: "default" | "sm" | "lg";
}

export function MatchScoreBadge({ score, size = "default" }: MatchScoreBadgeProps) {
  const getMatchConfig = () => {
    if (score >= 90) {
      return {
        label: "Excellent Match",
        className: "bg-[hsl(151,75%,50%)] text-white font-bold"
      };
    }
    if (score >= 75) {
      return {
        label: "Great Match",
        className: "bg-[hsl(151,75%,50%)]/10 text-[hsl(151,75%,30%)] border border-[hsl(151,75%,50%)]/30 font-semibold"
      };
    }
    if (score >= 60) {
      return {
        label: "Good Match",
        className: "bg-[hsl(18,60%,55%)]/10 text-[hsl(18,60%,35%)] border border-[hsl(18,60%,55%)]/30 font-semibold"
      };
    }
    return {
      label: "Potential",
      className: "bg-[hsl(30,10%,95%)] text-[hsl(30,10%,40%)] font-semibold"
    };
  };

  const config = getMatchConfig();

  return (
    <Badge 
      className={`${config.className} ${size === 'sm' ? 'text-xs' : ''}`}
    >
      {score}% {config.label}
    </Badge>
  );
}
