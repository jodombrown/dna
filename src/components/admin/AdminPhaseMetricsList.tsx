
import React from "react";
import AdminPhaseEditMetricCard from "./AdminPhaseEditMetricCard";
import AdminPhaseMetricCard from "./AdminPhaseMetricCard";

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

interface MetricFormState {
  label: string;
  value: string;
  target?: string;
  icon?: string;
  color?: string;
  phase_slug: string;
}

interface MetricsListProps {
  phase: string;
  metrics: Metric[];
  editingId: string | null;
  editForm: MetricFormState | null;
  onEditStart: (metric: Metric) => void;
  onEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDelete: (id: string) => void;
}

const AdminPhaseMetricsList: React.FC<MetricsListProps> = ({
  phase,
  metrics,
  editingId,
  editForm,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  onDelete
}) => {
  const filtered = metrics.filter(m => m.phase_slug === phase);

  return (
    <div>
      <h3 className="font-bold text-2xl mb-2 capitalize">{phase.replace(/-/g, " ")} Metrics</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(metric =>
          editingId === metric.id && editForm ? (
            <AdminPhaseEditMetricCard
              key={metric.id}
              editForm={editForm}
              onChange={onEditChange}
              onSave={onEditSave}
              onCancel={onEditCancel}
            />
          ) : (
            <AdminPhaseMetricCard
              key={metric.id}
              metric={metric}
              onEdit={onEditStart}
              onDelete={onDelete}
            />
          )
        )}
      </div>
      {filtered.length === 0 && (
        <div className="p-4 text-sm text-gray-400 italic">No metrics defined for this phase.</div>
      )}
    </div>
  );
};

export default AdminPhaseMetricsList;
