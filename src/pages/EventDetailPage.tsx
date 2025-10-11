import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dna/events")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <Card className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Event Detail View</h1>
          <p className="text-muted-foreground mb-6">
            Event ID: {id}
          </p>
          <div className="bg-muted/50 rounded-lg p-6 mb-6">
            <p className="text-lg mb-2">🚧 Coming in Phase 2</p>
            <p className="text-sm text-muted-foreground">
              Full event detail view with registration, attendees, and event information will be available soon.
            </p>
          </div>
          <Button onClick={() => navigate("/dna/events")}>
            Browse All Events
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default EventDetailPage;
