import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Professional } from '@/types/search';

interface ConnectDialogsManagerProps {
  // Professional Profile Dialog
  professionalDialogOpen: boolean;
  selectedProfessional: Professional | null;
  onProfessionalDialogChange: (open: boolean) => void;
  onConnect: (professionalId: string) => void;
  onMessage: (professionalId: string, professionalName: string) => void;
  
  // Demo Explanation Dialog
  demoExplanationOpen: boolean;
  onDemoExplanationChange: (open: boolean) => void;
}

const ConnectDialogsManager: React.FC<ConnectDialogsManagerProps> = ({
  professionalDialogOpen,
  selectedProfessional,
  onProfessionalDialogChange,
  onConnect,
  onMessage,
  demoExplanationOpen,
  onDemoExplanationChange
}) => {
  return (
    <>
      {/* Professional Profile Dialog - Enhanced Preview */}
      <Dialog open={professionalDialogOpen} onOpenChange={onProfessionalDialogChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Professional Profile</DialogTitle>
          </DialogHeader>
          {selectedProfessional && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <img
                  src={selectedProfessional.avatar_url}
                  alt={`${selectedProfessional.full_name} profile photo`}
                  className="w-24 h-24 rounded-full object-cover border"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedProfessional.full_name}</h3>
                  {selectedProfessional.profession && (
                    <p className="text-dna-emerald font-semibold">{selectedProfessional.profession}</p>
                  )}
                  {selectedProfessional.company && (
                    <p className="text-gray-600">{selectedProfessional.company}</p>
                  )}
                  {selectedProfessional.location && (
                    <p className="text-gray-500 text-sm">{selectedProfessional.location}</p>
                  )}
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex gap-3">
                <Button 
                  className="bg-dna-emerald hover:bg-dna-forest text-white"
                  onClick={() => {
                    onConnect(selectedProfessional.id);
                    onProfessionalDialogChange(false);
                  }}
                >
                  Connect
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    onMessage(selectedProfessional.id, selectedProfessional.full_name);
                    onProfessionalDialogChange(false);
                  }}
                >
                  Message
                </Button>
              </div>

              {/* Overview */}
              <section>
                <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                <p className="text-gray-700">
                  {selectedProfessional.bio || 'This professional has not added a bio yet.'}
                </p>
              </section>

              {selectedProfessional.skills && selectedProfessional.skills.length > 0 && (
                <section>
                  <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfessional.skills.slice(0, 10).map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-dna-emerald/10 text-dna-emerald rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {(selectedProfessional.years_experience !== undefined || selectedProfessional.education || selectedProfessional.languages) && (
                <section>
                  <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
                    {selectedProfessional.years_experience !== undefined && (
                      <div>
                        <div className="text-gray-500">Years of Experience</div>
                        <div className="font-medium">{selectedProfessional.years_experience}+</div>
                      </div>
                    )}
                    {selectedProfessional.education && (
                      <div>
                        <div className="text-gray-500">Education</div>
                        <div className="font-medium">{selectedProfessional.education}</div>
                      </div>
                    )}
                    {selectedProfessional.languages && (
                      <div className="sm:col-span-2">
                        <div className="text-gray-500">Languages</div>
                        <div className="font-medium">{selectedProfessional.languages.join(', ')}</div>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Demo Explanation Dialog */}
      <Dialog open={demoExplanationOpen} onOpenChange={onDemoExplanationChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>DNA Platform Demo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Welcome to the DNA platform demo! This prototype showcases our core Connect pillar functionality.
            </p>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900">What you're seeing:</h4>
                <ul className="text-sm text-gray-600 space-y-1 mt-1">
                  <li>• Sample professionals from the African diaspora</li>
                  <li>• Community groups focused on impact areas</li>
                  <li>• Events created by diaspora leaders</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">In our MVP, you'll have:</h4>
                <ul className="text-sm text-gray-600 space-y-1 mt-1">
                  <li>• Real user profiles with verified credentials</li>
                  <li>• Advanced matching algorithms</li>
                  <li>• Live event registration and management</li>
                  <li>• Direct messaging and video calls</li>
                  <li>• Impact tracking and collaboration tools</li>
                </ul>
              </div>
            </div>
            <Button 
              onClick={() => onDemoExplanationChange(false)}
              className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConnectDialogsManager;
