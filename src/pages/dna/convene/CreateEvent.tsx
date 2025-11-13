import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedLayout } from '@/components/layout/FeedLayout';

const CreateEvent = () => {
  const navigate = useNavigate();

  return (
    <FeedLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Create Event
            </CardTitle>
            <CardDescription>
              Event creation form coming in M2
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This feature is being built as part of Milestone 2 (M2 - Event Creation & RSVP).
            </p>
            <Button 
              variant="outline"
              onClick={() => navigate('/dna/convene')}
            >
              Back to Convene Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    </FeedLayout>
  );
};

export default CreateEvent;
