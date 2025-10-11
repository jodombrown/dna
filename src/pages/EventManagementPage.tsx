import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const EventManagementPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dna/events")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Events Dashboard</h1>
          <p className="text-muted-foreground">
            Manage all events you've created
          </p>
        </div>

        <Card className="p-8 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Event Management Dashboard</h2>
          <div className="bg-muted/50 rounded-lg p-6 mb-6 max-w-2xl mx-auto">
            <p className="text-lg mb-2">🚧 Coming in Phase 2</p>
            <p className="text-sm text-muted-foreground mb-4">
              Full event management dashboard with analytics, attendee management, 
              and event editing capabilities will be available soon.
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/dna/events")} variant="outline">
              Browse Events
            </Button>
            <Button onClick={() => navigate("/dna/events")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EventManagementPage;
