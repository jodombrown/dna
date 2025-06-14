
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3 } from "lucide-react";

interface Metric {
  label: string;
  value: string;
  target: string;
  color: string; // Tailwind class
}

interface PhaseMetricsProps {
  metrics: Metric[];
}

const PhaseMetrics: React.FC<PhaseMetricsProps> = ({ metrics }) => (
  <section className="py-16 bg-gray-50">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Progress Metrics</h2>
        <p className="text-lg text-gray-600">Live tracking of our phase progress</p>
      </div>
      <div className="grid md:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-all hover:-translate-y-1">
            <CardContent className="pt-6 text-center">
              <div className={`w-12 h-12 ${metric.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
              <div className="text-sm text-gray-500 mb-2">of {metric.target} target</div>
              <div className="text-sm font-medium text-gray-700">{metric.label}</div>
              <Progress value={(parseInt(metric.value) / parseInt(metric.target)) * 100} className="h-2 mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default PhaseMetrics;
