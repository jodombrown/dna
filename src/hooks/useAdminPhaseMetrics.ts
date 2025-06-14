
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export interface Metric {
  id: string;
  phase_slug: string;
  label: string;
  value: string;
  target?: string;
  icon?: string;
  color?: string;
  updated_at?: string;
}

export interface MetricFormState {
  phase_slug: string;
  label: string;
  value: string;
  target?: string;
  icon?: string;
  color?: string;
}

const PHASES = [
  "prototyping",
  "build",
  "mvp",
  "customer-discovery",
  "go-to-market"
];

// Checks admin role using the has_role Supabase function
async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin"
  });
  return !error && !!data;
}

export function useAdminPhaseMetrics() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MetricFormState | null>(null);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState<MetricFormState | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user && !authLoading) {
      navigate("/auth");
    }
    if (user) {
      checkIsAdmin(user.id).then(setIsAdmin);
    }
  }, [user, authLoading, navigate]);

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

  // Edit logic
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

  function handleEditCancel() {
    setEditingId(null);
    setEditForm(null);
  }

  // Add logic
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
    if (!addForm) return;
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

  function handleAddCancel() {
    setAdding(false);
    setAddForm(null);
  }

  // Delete logic
  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this metric?")) return;
    const { error } = await supabase.from("phase_metrics").delete().eq("id", id);
    if (!error) setMetrics(metrics.filter((m) => m.id !== id));
  }

  return {
    PHASES,
    user,
    authLoading,
    isAdmin,
    metrics,
    editingId,
    editForm,
    adding,
    addForm,
    fetching,
    // handlers
    handleEdit,
    handleEditChange,
    saveEdit,
    handleEditCancel,
    handleAddStart,
    handleAddChange,
    saveAdd,
    handleAddCancel,
    handleDelete
  };
}
