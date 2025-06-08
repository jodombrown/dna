
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Community, Event } from '@/types/search';

interface ConnectDialogsProps {
  showJoinDialog: boolean;
  showRegisterDialog: boolean;
  selectedCommunity: Community | null;
  selectedEvent: Event | null;
  setShowJoinDialog: (show: boolean) => void;
  setShowRegisterDialog: (show: boolean) => void;
}

const ConnectDialogs: React.FC<ConnectDialogsProps> = ({
  showJoinDialog,
  showRegisterDialog,
  selectedCommunity,
  selectedEvent,
  setShowJoinDialog,
  setShowRegisterDialog
}) => {
  return (
    <>
      {/* Join Community Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-dna-forest">Join Community - Coming Soon!</DialogTitle>
            <DialogDescription className="text-gray-600">
              We're building an amazing community experience for you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-dna-emerald/5 rounded-lg p-4">
              <h4 className="font-medium text-dna-forest mb-2">
                {selectedCommunity?.name}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {selectedCommunity?.description}
              </p>
              <div className="text-sm text-dna-emerald font-medium">
                {selectedCommunity?.member_count} members • {selectedCommunity?.category}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">When this feature launches, you'll be able to:</p>
              <ul className="space-y-1 text-sm ml-4">
                <li>• Join verified professional communities</li>
                <li>• Participate in member-only discussions</li>
                <li>• Access exclusive events and resources</li>
                <li>• Connect with like-minded professionals</li>
              </ul>
            </div>
            <Button 
              onClick={() => setShowJoinDialog(false)}
              className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
            >
              Stay Notified About Launch
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Register Event Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-dna-forest">Event Registration - Coming Soon!</DialogTitle>
            <DialogDescription className="text-gray-600">
              We're preparing an exceptional event experience for the diaspora community.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-dna-emerald/5 rounded-lg p-4">
              <h4 className="font-medium text-dna-forest mb-2">
                {selectedEvent?.title}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {selectedEvent?.description}
              </p>
              <div className="text-sm text-dna-emerald font-medium">
                {selectedEvent?.attendee_count} registered • {selectedEvent?.type}
                {selectedEvent?.is_virtual && (
                  <Badge className="ml-2 bg-dna-emerald text-white text-xs">Virtual</Badge>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">When event registration launches, you'll enjoy:</p>
              <ul className="space-y-1 text-sm ml-4">
                <li>• Seamless event registration and calendar integration</li>
                <li>• Pre-event networking with other attendees</li>
                <li>• Access to event materials and recordings</li>
                <li>• Follow-up collaboration opportunities</li>
              </ul>
            </div>
            <Button 
              onClick={() => setShowRegisterDialog(false)}
              className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
            >
              Stay Notified About Launch
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConnectDialogs;
