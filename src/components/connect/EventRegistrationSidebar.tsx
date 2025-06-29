
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Event } from '@/types/search';
import EventRegistrationHeader from './sidebar/EventRegistrationHeader';
import EventTicketSection from './sidebar/EventTicketSection';
import EventDetailsSection from './sidebar/EventDetailsSection';
import EventAboutSection from './sidebar/EventAboutSection';
import EventLocationSection from './sidebar/EventLocationSection';
import EventPresenterSection from './sidebar/EventPresenterSection';
import EventHostSection from './sidebar/EventHostSection';
import EventActionsSection from './sidebar/EventActionsSection';
import EventSocialSection from './sidebar/EventSocialSection';
import EventDemoDialogs from './sidebar/EventDemoDialogs';

interface EventRegistrationSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onRegister: () => void;
  onCreatorClick?: (creatorId: string) => void;
}

const EventRegistrationSidebar: React.FC<EventRegistrationSidebarProps> = ({
  open,
  onOpenChange,
  event,
  onRegister,
  onCreatorClick
}) => {
  const [demoExplanationOpen, setDemoExplanationOpen] = React.useState(false);
  const [contactHostDialogOpen, setContactHostDialogOpen] = React.useState(false);
  const [reportEventDialogOpen, setReportEventDialogOpen] = React.useState(false);

  if (!event) return null;

  const handleRegisterClick = () => {
    setDemoExplanationOpen(true);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="right" 
          className="w-full sm:max-w-lg p-0 overflow-y-auto shadow-2xl border-l-4 border-dna-emerald"
          style={{ 
            boxShadow: '-8px 0 24px -4px rgba(0, 0, 0, 0.1), -4px 0 8px -2px rgba(0, 0, 0, 0.06)' 
          }}
        >
          <div className="flex flex-col h-full">
            <EventRegistrationHeader event={event} />

            <div className="flex-1 p-6 space-y-8">
              <EventTicketSection onRegister={handleRegisterClick} />
              <EventDetailsSection event={event} />
              <EventAboutSection event={event} />
              <EventLocationSection event={event} />
              <EventPresenterSection />
              <EventHostSection event={event} onCreatorClick={onCreatorClick} />
              <EventActionsSection 
                onContactHost={() => setContactHostDialogOpen(true)}
                onReportEvent={() => setReportEventDialogOpen(true)}
              />
              <EventSocialSection event={event} />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <EventDemoDialogs
        demoExplanationOpen={demoExplanationOpen}
        setDemoExplanationOpen={setDemoExplanationOpen}
        contactHostDialogOpen={contactHostDialogOpen}
        setContactHostDialogOpen={setContactHostDialogOpen}
        reportEventDialogOpen={reportEventDialogOpen}
        setReportEventDialogOpen={setReportEventDialogOpen}
      />
    </>
  );
};

export default EventRegistrationSidebar;
