import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface MatchReasoning {
  shared_focus_areas?: string[];
  shared_industries?: string[];
  shared_skills?: string[];
  same_country_of_origin?: boolean;
  same_location?: boolean;
  regional_expertise_match?: boolean;
  scores?: {
    focus_areas?: number;
    industries?: number;
    skills?: number;
    country_origin?: number;
    location?: number;
    regional?: number;
    profile_completion?: number;
  };
}

interface MatchScoreBadgeProps {
  score: number;
  size?: "default" | "sm" | "lg";
  reasoning?: MatchReasoning;
  showTooltip?: boolean;
}

export function MatchScoreBadge({ score, size = "default", reasoning, showTooltip = true }: MatchScoreBadgeProps) {
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

  const badge = (
    <Badge
      className={`${config.className} ${size === 'sm' ? 'text-xs' : ''} ${reasoning && showTooltip ? 'cursor-help' : ''}`}
    >
      {score}% {config.label}
      {reasoning && showTooltip && (
        <HelpCircle className="inline ml-1 h-3 w-3 opacity-70" />
      )}
    </Badge>
  );

  if (!reasoning || !showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs" side="bottom">
          <div className="space-y-2">
            <p className="font-semibold text-sm">Why {score}% match:</p>
            <div className="space-y-1 text-xs">
              {reasoning.same_country_of_origin && reasoning.scores?.country_origin && (
                <div className="flex justify-between">
                  <span>🌍 Same country of origin</span>
                  <span className="font-semibold">+{reasoning.scores.country_origin}</span>
                </div>
              )}
              {reasoning.shared_focus_areas && reasoning.shared_focus_areas.length > 0 && reasoning.scores?.focus_areas && (
                <div className="flex justify-between">
                  <span>🎯 Shared focus: {reasoning.shared_focus_areas.slice(0, 2).join(', ')}</span>
                  <span className="font-semibold">+{reasoning.scores.focus_areas}</span>
                </div>
              )}
              {reasoning.shared_industries && reasoning.shared_industries.length > 0 && reasoning.scores?.industries && (
                <div className="flex justify-between">
                  <span>💼 Shared industries: {reasoning.shared_industries.slice(0, 2).join(', ')}</span>
                  <span className="font-semibold">+{reasoning.scores.industries}</span>
                </div>
              )}
              {reasoning.shared_skills && reasoning.shared_skills.length > 0 && reasoning.scores?.skills && (
                <div className="flex justify-between">
                  <span>⚡ Shared skills: {reasoning.shared_skills.slice(0, 2).join(', ')}</span>
                  <span className="font-semibold">+{reasoning.scores.skills}</span>
                </div>
              )}
              {reasoning.same_location && reasoning.scores?.location && (
                <div className="flex justify-between">
                  <span>📍 Same location</span>
                  <span className="font-semibold">+{reasoning.scores.location}</span>
                </div>
              )}
              {reasoning.regional_expertise_match && reasoning.scores?.regional && (
                <div className="flex justify-between">
                  <span>🗺️ Regional expertise match</span>
                  <span className="font-semibold">+{reasoning.scores.regional}</span>
                </div>
              )}
              {reasoning.scores?.profile_completion && (
                <div className="flex justify-between">
                  <span>⭐ Strong profile</span>
                  <span className="font-semibold">+{reasoning.scores.profile_completion}</span>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
