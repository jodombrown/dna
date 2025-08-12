import React from "react";
import { useParams } from "react-router-dom";
import ConnectionDetail from "@/components/connection/ConnectionDetail";

const ConnectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Basic SEO
  React.useEffect(() => {
    document.title = `Connection | DNA`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Manage your connection cadence, intentions, and nudges.');
  }, []);

  if (!id) return <div className="p-6">Connection not found.</div>;

  return (
    <main className="container mx-auto p-4">
      <ConnectionDetail connectionId={id} />
    </main>
  );
};

export default ConnectionDetailPage;
