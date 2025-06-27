
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Users, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PhaseHeroProps {
  badge: string;
  title: string;
  description: string;
  prevPhase?: { label: string; url: string };
  nextPhase?: { label: string; url: string };
  gradient: string;
}

const PhaseHero: React.FC<PhaseHeroProps> = ({
  badge,
  title,
  description,
  prevPhase,
  nextPhase,
  gradient,
}) => {
  const navigate = useNavigate();

  return (
    <section className={`py-12 ${gradient} text-white`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge className="mb-6 bg-white/90 text-dna-emerald font-semibold px-6 py-2 rounded-full text-base shadow">
            {badge}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-xl">{title}</h1>
          <p className="text-lg md:text-xl max-w-4xl mx-auto text-white/90 mb-8 leading-relaxed">{description}</p>
          
          {/* Transparency Message */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-8 max-w-3xl mx-auto">
            <p className="text-white/90 text-sm">
              <strong>🔍 Transparent Development:</strong> This page shows our real progress, current challenges, and next steps. 
              Your feedback shapes what we build next.
            </p>
          </div>

          {/* Navigation & Engagement */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            {prevPhase && (
              <Button
                onClick={() => navigate(prevPhase.url)}
                variant="outline"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 font-medium px-6 py-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {prevPhase.label}
              </Button>
            )}
            
            <Button
              onClick={() => navigate('/contact')}
              className="bg-white text-dna-emerald hover:bg-gray-100 font-medium px-6 py-3"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Share Feedback
            </Button>
            
            {nextPhase && (
              <Button
                onClick={() => navigate(nextPhase.url)}
                className="bg-dna-copper hover:bg-dna-gold text-white font-medium px-6 py-3"
              >
                {nextPhase.label}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Community Involvement */}
          <div className="flex justify-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/about')}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <Users className="w-4 h-4 mr-2" />
              Join Our Community
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PhaseHero;
