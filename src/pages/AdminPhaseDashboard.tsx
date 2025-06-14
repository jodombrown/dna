import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminPhaseAddMetricForm from "@/components/admin/AdminPhaseAddMetricForm";
import AdminPhaseMetricsList from "@/components/admin/AdminPhaseMetricsList";
import { Button } from "@/components/ui/button";
import { useAdminPhaseMetrics } from "@/hooks/useAdminPhaseMetrics";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";

// The Admin Phase Metrics Dashboard page, now with logic hooks extracted
const AdminPhaseDashboard: React.FC = () => {
  const {
    PHASES,
    isAdmin,
    authLoading,
    metrics,
    editingId,
    editForm,
    adding,
    addForm,
    fetching,
    handleEdit,
    handleEditChange,
    saveEdit,
    handleEditCancel,
    handleAddStart,
    handleAddChange,
    saveAdd,
    handleAddCancel,
    handleDelete
  } = useAdminPhaseMetrics();

  if (authLoading || fetching) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">Loading...</div>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p>You must be an admin to view this page.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Admin Phase Metrics Dashboard
              </h2>
              <p className="text-lg text-gray-600">
                View, edit, and manage phase progress metrics across all phases.
              </p>
            </div>
            <div className="mb-6 flex justify-end">
              <Button
                onClick={handleAddStart}
                variant="outline"
                className="border-dna-emerald text-dna-emerald"
              >
                + Add Metric
              </Button>
            </div>
            <AdminPhaseAddMetricForm
              phases={PHASES}
              addForm={addForm}
              onChange={handleAddChange}
              onSave={saveAdd}
              onCancel={handleAddCancel}
            />
            <div className="space-y-8">
              {PHASES.map((phase) => (
                <AdminPhaseMetricsList
                  key={phase}
                  phase={phase}
                  metrics={metrics}
                  editingId={editingId}
                  editForm={editForm}
                  onEditStart={handleEdit}
                  onEditChange={handleEditChange}
                  onEditSave={saveEdit}
                  onEditCancel={handleEditCancel}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </ProtectedAdminRoute>
  );
};

export default AdminPhaseDashboard;
