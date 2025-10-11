import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const EventEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dna/events/manage")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Event Management
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
          <p className="text-muted-foreground">Event ID: {id}</p>
        </div>

        <Card className="p-8 text-center">
          <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Event Editor</h2>
          <div className="bg-muted/50 rounded-lg p-6 mb-6 max-w-2xl mx-auto">
            <p className="text-lg mb-2">🚧 Coming in Phase 2</p>
            <p className="text-sm text-muted-foreground mb-4">
              Full event editing interface with attendee management, registration settings, 
              and analytics will be available soon.
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/dna/events/manage")} variant="outline">
              Event Dashboard
            </Button>
            <Button onClick={() => navigate("/dna/events")}>
              View All Events
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EventEditPage;
