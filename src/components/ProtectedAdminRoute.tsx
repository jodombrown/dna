
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        navigate("/admin-login");
        return;
      }
      // Check admin using Supabase RPC
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin"
      });
      if (error || !data) {
        navigate("/admin-login");
        return;
      }
      setIsAdmin(true);
      setChecking(false);
    }
    if (!loading) {
      checkAdmin();
    }
  }, [user, loading, navigate]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
