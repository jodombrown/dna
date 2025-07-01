
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Objective {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: string;
  completion: number;
}

interface PhaseObjectivesProps {
  objectives: Objective[];
  color?: string;
}

const PhaseObjectives: React.FC<PhaseObjectivesProps> = ({ objectives, color = "dna-emerald" }) => (
  <section className="py-12 md:py-16">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Phase Objectives</h2>
        <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-4">
          Our focused approach to driving this phase's success. Track our real-time progress and see exactly what we're working on.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {objectives.map((objective, index) => (
          <Card key={index} className={`hover:shadow-lg transition-all border-l-4 border-l-${color} h-full relative z-10`}>
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="flex items-start gap-3 text-sm md:text-base">
                <div className={`w-8 h-8 md:w-10 md:h-10 bg-${color}/10 rounded-lg flex items-center justify-center text-${color} flex-shrink-0 mt-1`}>
                  {objective.icon}
                </div>
                <span className="font-semibold leading-tight">{objective.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-600 mb-4 text-sm md:text-base leading-relaxed">{objective.description}</p>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className={`border-${color} text-${color} text-xs`}>
                  {objective.status}
                </Badge>
                <span className="text-xs font-medium text-gray-700">
                  {objective.completion}%
                </span>
              </div>
              <Progress value={objective.completion} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default PhaseObjectives;
