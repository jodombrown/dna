
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import SheetCloseButton from '@/components/ui/sheet-close-button';
import { DollarSign, Target, CheckCircle } from 'lucide-react';

interface ContributionPathway {
  id: number;
  title: string;
  description: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  contributors: number;
  timeLeft: string;
  impactMetric: string;
  category: string;
  urgency: string;
  detailedDescription: string;
  goals: string[];
  timeline: string;
  partnership: string;
}

interface ContributeDialogsProps {
  isContributeDialogOpen: boolean;
  setIsContributeDialogOpen: (open: boolean) => void;
  isLearnMoreOpen: boolean;
  setIsLearnMoreOpen: (open: boolean) => void;
  selectedPathway: ContributionPathway | null;
}

const ContributeDialogs: React.FC<ContributeDialogsProps> = ({
  isContributeDialogOpen,
  setIsContributeDialogOpen,
  isLearnMoreOpen,
  setIsLearnMoreOpen,
  selectedPathway
}) => {
  return (
    <>
      {/* Contribute Now Dialog */}
      <Dialog open={isContributeDialogOpen} onOpenChange={setIsContributeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-dna-emerald" />
              How We Envision Contributing
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>
                In our fully built platform, clicking "Contribute Now" will take you through a seamless process where you can:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Choose your contribution type (financial, skills, or time)</li>
                <li>Set up secure payment processing for financial contributions</li>
                <li>Connect with project coordinators for skills-based volunteering</li>
                <li>Schedule time commitments that fit your availability</li>
                <li>Track your impact in real-time through detailed analytics</li>
                <li>Join project-specific communication channels</li>
              </ul>
              <p className="text-sm text-gray-600 bg-dna-emerald/10 p-3 rounded">
                This is our vision for how contribution will work. We're building this experience to be as seamless and impactful as possible.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setIsContributeDialogOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Learn More Sheet */}
      <Sheet open={isLearnMoreOpen} onOpenChange={setIsLearnMoreOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto relative">
          <SheetCloseButton onClose={() => setIsLearnMoreOpen(false)} />
          {selectedPathway && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-dna-emerald/10 rounded-lg">
                    <Target className="w-6 h-6 text-dna-emerald" />
                  </div>
                  <Badge className="bg-dna-emerald text-white">
                    {selectedPathway.category}
                  </Badge>
                </div>
                <SheetTitle className="text-2xl text-gray-900">{selectedPathway.title}</SheetTitle>
                <SheetDescription className="text-base text-gray-600">
                  {selectedPathway.detailedDescription}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Goals</h3>
                  <ul className="space-y-2">
                    {selectedPathway.goals.map((goal: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-dna-emerald mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Timeline</h3>
                  <p className="text-gray-700">{selectedPathway.timeline}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Partnership Approach</h3>
                  <p className="text-gray-700">{selectedPathway.partnership}</p>
                </div>

                <div className="bg-gradient-to-r from-dna-emerald/5 to-dna-copper/5 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Current Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Funding Progress</span>
                      <span className="font-medium">
                        {Math.round((selectedPathway.currentAmount / selectedPathway.targetAmount) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(selectedPathway.currentAmount / selectedPathway.targetAmount) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>${selectedPathway.currentAmount.toLocaleString()} raised</span>
                      <span>{selectedPathway.contributors} contributors</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ContributeDialogs;
