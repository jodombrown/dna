
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
            <Card key={metric.id} className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="pt-6 text-center">
                <div className={`w-12 h-12 ${metric.color ?? "bg-dna-emerald"} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <PhaseIcon iconName={metric.icon} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                {metric.target && (
                  <div className="text-sm text-gray-500 mb-2">
                    of {metric.target} target
                  </div>
                )}
                <div className="text-sm font-medium text-gray-700">{metric.label}</div>
                {metric.target && !isNaN(parseFloat(metric.value)) && !isNaN(parseFloat(metric.target)) ? (
                  <Progress value={(parseFloat(metric.value) / parseFloat(metric.target)) * 100} className="h-2 mt-3" />
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhaseMetrics;
