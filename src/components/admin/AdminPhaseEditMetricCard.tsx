
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MetricFormState {
  label: string;
  value: string;
  target?: string;
  icon?: string;
  color?: string;
  phase_slug: string;
}

interface AdminPhaseEditMetricCardProps {
  editForm: MetricFormState | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}

const AdminPhaseEditMetricCard: React.FC<AdminPhaseEditMetricCardProps> = ({
  editForm,
  onChange,
  onSave,
  onCancel
}) => {
  if (!editForm) return null;
  return (
    <Card className="border border-dna-emerald bg-white">
      <CardContent className="space-y-3 p-4">
        <Input className="mb-1" name="label" value={editForm.label || ""} onChange={onChange} placeholder="Label" />
        <Input className="mb-1" name="value" value={editForm.value || ""} onChange={onChange} placeholder="Value" />
        <Input className="mb-1" name="target" value={editForm.target || ""} onChange={onChange} placeholder="Target" />
        <Input className="mb-1" name="icon" value={editForm.icon || ""} onChange={onChange} placeholder="Icon" />
        <Input className="mb-1" name="color" value={editForm.color || ""} onChange={onChange} placeholder="Color" />
        <div className="flex gap-2 mt-2">
          <Button onClick={onSave} className="bg-dna-emerald text-white">Save</Button>
          <Button onClick={onCancel} variant="outline">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPhaseEditMetricCard;
