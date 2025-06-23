
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
    <section className={`py-16 ${gradient} text-white text-center flex flex-col justify-center`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <Badge className="mb-6 bg-white/90 text-dna-emerald font-semibold px-6 py-2 rounded-full text-base shadow">
          {badge}
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-xl">{title}</h1>
        <p className="text-xl max-w-4xl mx-auto text-white/90 mb-10">{description}</p>
        <div className="flex justify-center gap-4 mt-4 flex-wrap">
          {prevPhase && (
            <Button
              onClick={() => navigate(prevPhase.url)}
              variant="outline"
              className="bg-white text-dna-emerald border-white hover:bg-gray-50 font-medium px-6 py-3 text-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {prevPhase.label}
            </Button>
          )}
          {nextPhase && (
            <Button
              onClick={() => navigate(nextPhase.url)}
              className="bg-dna-copper hover:bg-dna-gold text-white font-medium px-6 py-3 text-lg"
            >
              {nextPhase.label}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default PhaseHero;
