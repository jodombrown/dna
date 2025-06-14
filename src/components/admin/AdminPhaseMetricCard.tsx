
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface Metric {
  id: string;
  phase_slug: string;
  label: string;
  value: string;
  target?: string;
  icon?: string;
  color?: string;
  updated_at?: string;
}

interface AdminPhaseMetricCardProps {
  metric: Metric;
  onEdit: (metric: Metric) => void;
  onDelete: (id: string) => void;
}

const AdminPhaseMetricCard: React.FC<AdminPhaseMetricCardProps> = ({
  metric,
  onEdit,
  onDelete
}) => {
  return (
    <Card className="border border-gray-200 bg-white hover:shadow transition-all">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-lg font-bold">{metric.label}</div>
            <div className="text-sm text-gray-400 mb-2">{metric.phase_slug}</div>
            <div className="font-mono text-2xl text-dna-emerald">{metric.value}</div>
            <div className="text-xs text-gray-500">
              {metric.target ? `of ${metric.target}` : ""}
            </div>
            {metric.target && !isNaN(parseFloat(metric.value)) && !isNaN(parseFloat(metric.target)) && (
              <Progress
                value={(parseFloat(metric.value) / parseFloat(metric.target)) * 100}
                className="h-2 mt-3"
              />
            )}
            <div className="text-xs mt-2 font-mono text-gray-400">Icon: {metric.icon || "none"}</div>
            <div className="text-xs text-gray-400">Color: {metric.color || "none"}</div>
          </div>
          <div className="flex flex-col gap-2">
            <Button size="sm" onClick={() => onEdit(metric)}>Edit</Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(metric.id)}>
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPhaseMetricCard;
