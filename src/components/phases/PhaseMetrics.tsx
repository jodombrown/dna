
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import * as LucideIcons from "lucide-react";

interface PhaseMetricsProps {
  phaseSlug: string;
  fallbackMetrics?: Array<{
    id: string;
    label: string;
    value: string;
    target?: string;
    icon?: string;
    color?: string;
  }>;
}

const iconWhitelist = [
  "activity", "bar-chart", "calendar", "check", "clock", "file-text", "flag", "rocket", "trending-up",
  "users", "globe", "heart", "star", "zap", "target", "dollar-sign", "briefcase", "code",
  "message-square", "thumbs-up", "building", "graduation-cap", "network", "shield", "award"
];

// Utility to render the Lucide icon by name safely
function PhaseIcon({ iconName }: { iconName?: string }) {
  if (!iconName || !iconWhitelist.includes(iconName)) return null;
  const LucideIcon = (LucideIcons as any)[iconName
    .split("-")
    .map((s, i) => i === 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s.charAt(0).toUpperCase() + s.slice(1))
    .join("")];
  return LucideIcon ? <LucideIcon className="w-6 h-6 text-white" /> : null;
}

// Individual metric card component with animation
function AnimatedMetricCard({ metric }: { metric: any }) {
  const { count: animatedValue, countRef } = useAnimatedCounter({
    end: parseFloat(metric.value.replace(/[^0-9.]/g, '')) || 0,
    duration: 1500,
    decimals: metric.value.includes('.') ? 1 : 0
  });

  const { count: animatedProgress, countRef: progressRef } = useAnimatedCounter({
    end: metric.target && !isNaN(parseFloat(metric.value)) && !isNaN(parseFloat(metric.target)) 
      ? (parseFloat(metric.value) / parseFloat(metric.target)) * 100 
      : 0,
    duration: 2000,
    decimals: 0
  });

  // Format the animated value to match the original format
  const formatValue = (value: number) => {
    const original = metric.value;
    if (original.includes('$')) return `$${value}${original.includes('K') ? 'K' : ''}`;
    if (original.includes('%')) return `${value}%`;
    return value.toString();
  };

  return (
    <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
      <CardContent className="pt-6 text-center">
        <div className={`w-12 h-12 ${metric.color ?? "bg-dna-emerald"} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <PhaseIcon iconName={metric.icon} />
        </div>
        <div ref={countRef} className="text-3xl font-bold text-gray-900 mb-1">
          {formatValue(animatedValue)}
        </div>
        {metric.target && (
          <div className="text-sm text-gray-500 mb-2">
            of {metric.target} target
          </div>
        )}
        <div className="text-sm font-medium text-gray-700">{metric.label}</div>
        {metric.target && !isNaN(parseFloat(metric.value)) && !isNaN(parseFloat(metric.target)) ? (
          <div ref={progressRef}>
            <Progress value={animatedProgress} className="h-2 mt-3" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

const PhaseMetrics: React.FC<PhaseMetricsProps> = ({ phaseSlug, fallbackMetrics = [] }) => {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ["phase-metrics", phaseSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("phase_metrics")
        .select("*")
        .eq("phase_slug", phaseSlug)
        .order("label", { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // Use database metrics if available, otherwise use fallback metrics
  const displayMetrics = metrics && metrics.length > 0 ? metrics : fallbackMetrics;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Progress Metrics</h2>
          <p className="text-lg text-gray-600">Live tracking of our phase progress and accountability targets</p>
        </div>
        {isLoading && (
          <div className="text-center text-gray-500 py-8">Loading metrics...</div>
        )}
        {error && !fallbackMetrics.length && (
          <div className="text-center text-red-500 py-8">Failed to load metrics.</div>
        )}
        <div className="grid md:grid-cols-4 gap-6">
          {displayMetrics && displayMetrics.map((metric: any) => (
            <AnimatedMetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhaseMetrics;
