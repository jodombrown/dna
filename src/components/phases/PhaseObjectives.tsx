
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
  <section className="py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Phase Objectives</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Our focused approach to driving this phase's success
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {objectives.map((objective, index) => (
          <Card key={index} className={`hover:shadow-lg transition-all border-l-4 border-l-${color}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-${color}/10 rounded-lg flex items-center justify-center text-${color}`}>
                  {objective.icon}
                </div>
                <span className="text-sm font-semibold">{objective.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 text-sm">{objective.description}</p>
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
