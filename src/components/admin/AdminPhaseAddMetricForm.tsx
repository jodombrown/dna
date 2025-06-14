
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MetricFormState {
  phase_slug: string;
  label: string;
  value: string;
  target?: string;
  icon?: string;
  color?: string;
}

interface AdminPhaseAddMetricFormProps {
  phases: string[];
  addForm: MetricFormState | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}

const AdminPhaseAddMetricForm: React.FC<AdminPhaseAddMetricFormProps> = ({
  phases,
  addForm,
  onChange,
  onSave,
  onCancel
}) => {
  if (!addForm) return null;
  return (
    <Card className="mb-8 p-6 bg-dna-emerald/10">
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        <div>
          <label className="block text-sm font-medium mb-1">Phase</label>
          <Input
            name="phase_slug"
            value={addForm.phase_slug || ""}
            onChange={onChange}
            placeholder="Phase slug"
            list="phases"
          />
          <datalist id="phases">
            {phases.map(p => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Label</label>
          <Input name="label" value={addForm.label || ""} onChange={onChange} placeholder="Label" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Value</label>
          <Input name="value" value={addForm.value || ""} onChange={onChange} placeholder="Value" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Target</label>
          <Input name="target" value={addForm.target || ""} onChange={onChange} placeholder="Target" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Icon</label>
          <Input name="icon" value={addForm.icon || ""} onChange={onChange} placeholder="(e.g. activity, check, rocket)" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Color</label>
          <Input name="color" value={addForm.color || ""} onChange={onChange} placeholder="e.g. bg-dna-emerald" />
        </div>
        <div className="col-span-full flex gap-3 mt-3">
          <Button onClick={onSave} className="bg-dna-emerald text-white">Save</Button>
          <Button onClick={onCancel} variant="outline" className="border-gray-300">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPhaseAddMetricForm;
