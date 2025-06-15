
import React, { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PrototypeBanner: React.FC = () => {
  const navigate = useNavigate();
  const [openJourney, setOpenJourney] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-r from-dna-emerald/15 via-dna-copper/10 to-dna-gold/10 border-b border-dna-emerald/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-dna-emerald mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-md md:text-lg text-dna-forest mb-0.5">
                You’re using the DNA Platform Prototype!
              </h3>
              <p className="text-xs md:text-sm text-gray-700">
                This is an early preview of Diaspora Network of Africa—your ideas, feedback, and involvement
                will shape the future of our community-powered professional platform.
                <br className="hidden md:block" />
                <span className="font-semibold">Help us build a home for Africa’s Diaspora!</span>
              </p>
            </div>
          </div>
          {/* Replace "Complete Your Profile" with Start Your Journey button and modal */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              size="sm"
              onClick={() => setOpenJourney(true)}
              className="bg-dna-copper hover:bg-dna-gold text-white"
            >
              Start Your Journey, Today
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/contribute')}
              className="bg-dna-copper hover:bg-dna-gold text-white"
            >
              Give Feedback
            </Button>
          </div>
        </div>
      </div>
      {/* Modal for the button */}
      <Dialog open={openJourney} onOpenChange={setOpenJourney}>
        <DialogContent className="max-w-xl mx-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-dna-forest text-center">
              Your DNA Journey: What Happens Next?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ol className="list-decimal list-inside text-gray-700 text-lg space-y-2">
              <li><strong>Create Your Profile:</strong> Share your background, skills, and aspirations with the global diaspora network.</li>
              <li><strong>Discover Opportunities:</strong> Explore professional communities, collaborations, and events tailored to your interests.</li>
              <li><strong>Connect & Collaborate:</strong> Build relationships, join impactful projects, and unlock new pathways for personal and collective growth.</li>
              <li><strong>Contribute & Grow:</strong> Empower others and advance your own journey through community-driven engagement.</li>
            </ol>
            <p className="text-center text-dna-copper mt-4">
              We’re committed to making Africa’s diaspora the world’s most connected and impactful community!
            </p>
            <Button
              className="w-full bg-dna-emerald hover:bg-dna-forest text-white rounded-lg"
              onClick={() => { setOpenJourney(false); navigate('/auth'); }}
            >
              Get Started — Create Your Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrototypeBanner;

