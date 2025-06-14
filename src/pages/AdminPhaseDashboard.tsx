import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminPhaseAddMetricForm from "@/components/admin/AdminPhaseAddMetricForm";
import AdminPhaseMetricsList from "@/components/admin/AdminPhaseMetricsList";

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

const PHASES = [
  "prototyping",
  "build",
  "mvp",
  "customer-discovery",
  "go-to-market"
];

// Utility to check admin role (fetches from Supabase using the has_role function)
async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin"
  });
  return !error && !!data;
}

const AdminPhaseDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Metric, "id" | "updated_at"> | null>(null);
  const [adding, setAdding] = useState<boolean>(false);
  const [addForm, setAddForm] = useState<Omit<Metric, "id" | "updated_at"> | null>(null);
  const [fetching, setFetching] = useState<boolean>(true);

  useEffect(() => {
    if (!user && !loading) {
      navigate("/auth");
    }
    if (user) {
      checkIsAdmin(user.id).then(setIsAdmin);
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    async function fetchMetrics() {
      setFetching(true);
      const { data, error } = await supabase
        .from("phase_metrics")
        .select("*")
        .order("phase_slug", { ascending: true })
        .order("label", { ascending: true });
      if (!error && data) setMetrics(data as Metric[]);
      setFetching(false);
    }
    if (isAdmin) fetchMetrics();
  }, [isAdmin]);

  function handleEdit(metric: Metric) {
    const { id, updated_at, ...rest } = metric;
    setEditingId(metric.id);
    setEditForm(rest);
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editForm) return;
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  async function saveEdit() {
    if (!editingId || !editForm) return;
    const { error } = await supabase
      .from("phase_metrics")
      .update(editForm)
      .eq("id", editingId);
    if (!error) {
      const { data: updated } = await supabase
        .from("phase_metrics")
        .select("*")
        .order("phase_slug", { ascending: true })
        .order("label", { ascending: true });
      setMetrics((updated ?? []) as Metric[]);
      setEditingId(null);
      setEditForm(null);
    } else {
      alert("Error saving changes");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this metric?")) return;
    const { error } = await supabase.from("phase_metrics").delete().eq("id", id);
    if (!error) setMetrics(metrics.filter((m) => m.id !== id));
  }

  function handleAddStart() {
    setAdding(true);
    setAddForm({
      phase_slug: PHASES[0],
      label: "",
      value: "",
      target: "",
      icon: "",
      color: ""
    });
  }

  function handleAddChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!addForm) return; // Defensive
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  }

  async function saveAdd() {
    if (!addForm) return;
    if (!addForm.phase_slug || !addForm.label || !addForm.value) {
      alert("Phase, label, and value are required.");
      return;
    }
    const { error } = await supabase.from("phase_metrics").insert([addForm]);
    if (!error) {
      const { data } = await supabase
        .from("phase_metrics")
        .select("*")
        .order("phase_slug", { ascending: true })
        .order("label", { ascending: true });
      setMetrics((data ?? []) as Metric[]);
      setAdding(false);
      setAddForm(null);
    } else {
      alert("Error adding metric");
    }
  }

  if (loading || fetching) {
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Admin Phase Metrics Dashboard</h2>
            <p className="text-lg text-gray-600">
              View, edit, and manage phase progress metrics across all phases.
            </p>
          </div>
          <div className="mb-6 flex justify-end">
            <Button onClick={handleAddStart} variant="outline" className="border-dna-emerald text-dna-emerald">
              + Add Metric
            </Button>
          </div>
          <AdminPhaseAddMetricForm
            phases={PHASES}
            addForm={addForm}
            onChange={handleAddChange}
            onSave={saveAdd}
            onCancel={() => { setAdding(false); setAddForm(null); }}
          />
          <div className="space-y-8">
            {PHASES.map(phase => (
              <AdminPhaseMetricsList
                key={phase}
                phase={phase}
                metrics={metrics}
                editingId={editingId}
                editForm={editForm}
                onEditStart={handleEdit}
                onEditChange={handleEditChange}
                onEditSave={saveEdit}
                onEditCancel={() => { setEditingId(null); setEditForm(null); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AdminPhaseDashboard;
