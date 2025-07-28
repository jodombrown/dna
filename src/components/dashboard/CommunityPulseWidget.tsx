import { useDashboard } from "@/contexts/DashboardContext";

const CommunityPulseWidget = () => {
  const { setActiveView } = useDashboard();

  return (
    <div
      onClick={() => setActiveView("community_pulse")}
      className="cursor-pointer hover:bg-dna-gold/10 transition rounded-xl p-4 shadow"
    >
      <h3 className="text-dna-forest text-sm font-medium">Community Pulse</h3>
      <p className="text-xs text-gray-500">Click to view your impact</p>
    </div>
  );
};

export default CommunityPulseWidget;