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
          {adding && addForm && (
            <Card className="mb-8 p-6 bg-dna-emerald/10">
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div>
                  <label className="block text-sm font-medium mb-1">Phase</label>
                  <Input
                    name="phase_slug"
                    value={addForm.phase_slug || ""}
                    onChange={handleAddChange}
                    placeholder="Phase slug"
                    list="phases"
                  />
                  <datalist id="phases">
                    {PHASES.map(p => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Label</label>
                  <Input name="label" value={addForm.label || ""} onChange={handleAddChange} placeholder="Label" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Value</label>
                  <Input name="value" value={addForm.value || ""} onChange={handleAddChange} placeholder="Value" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target</label>
                  <Input name="target" value={addForm.target || ""} onChange={handleAddChange} placeholder="Target" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Icon</label>
                  <Input name="icon" value={addForm.icon || ""} onChange={handleAddChange} placeholder="(e.g. activity, check, rocket)" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Color</label>
                  <Input name="color" value={addForm.color || ""} onChange={handleAddChange} placeholder="e.g. bg-dna-emerald" />
                </div>
                <div className="col-span-full flex gap-3 mt-3">
                  <Button onClick={saveAdd} className="bg-dna-emerald text-white">Save</Button>
                  <Button onClick={() => { setAdding(false); setAddForm(null); }} variant="outline" className="border-gray-300">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
          <div className="space-y-8">
            {PHASES.map(phase => (
              <div key={phase}>
                <h3 className="font-bold text-2xl mb-2 capitalize">{phase.replace(/-/g, " ")} Metrics</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {metrics.filter(m => m.phase_slug === phase).map(metric =>
                    editingId === metric.id && editForm ? (
                      <Card key={metric.id} className="border border-dna-emerald bg-white">
                        <CardContent className="space-y-3 p-4">
                          <Input
                            className="mb-1"
                            name="label"
                            value={editForm.label || ""}
                            onChange={handleEditChange}
                            placeholder="Label"
                          />
                          <Input
                            className="mb-1"
                            name="value"
                            value={editForm.value || ""}
                            onChange={handleEditChange}
                            placeholder="Value"
                          />
                          <Input
                            className="mb-1"
                            name="target"
                            value={editForm.target || ""}
                            onChange={handleEditChange}
                            placeholder="Target"
                          />
                          <Input
                            className="mb-1"
                            name="icon"
                            value={editForm.icon || ""}
                            onChange={handleEditChange}
                            placeholder="Icon"
                          />
                          <Input
                            className="mb-1"
                            name="color"
                            value={editForm.color || ""}
                            onChange={handleEditChange}
                            placeholder="Color"
                          />
                          <div className="flex gap-2 mt-2">
                            <Button onClick={saveEdit} className="bg-dna-emerald text-white">Save</Button>
                            <Button onClick={() => { setEditingId(null); setEditForm(null); }} variant="outline">Cancel</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card key={metric.id} className="border border-gray-200 bg-white hover:shadow transition-all">
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
                              <Button size="sm" onClick={() => handleEdit(metric)}>Edit</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(metric.id)}>
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
                {metrics.filter(m => m.phase_slug === phase).length === 0 && (
                  <div className="p-4 text-sm text-gray-400 italic">No metrics defined for this phase.</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AdminPhaseDashboard;
