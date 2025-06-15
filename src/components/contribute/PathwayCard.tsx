
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PathwayCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  examples: string[];
  color: string;
  bgColor: string;
  whyItMatters: string;
}

const PathwayCard: React.FC<PathwayCardProps> = ({
  icon: Icon,
  title,
  description,
  examples,
  color,
  bgColor,
  whyItMatters
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="perspective"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
          hovered ? "[transform:rotateY(180deg)]" : ""
        }`}
        style={{ minHeight: 240 }}
      >
        {/* Front */}
        <Card
          className={`absolute inset-0 ${bgColor} border-l-4 border-l-gray-300 [backface-visibility:hidden] h-full w-full`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <p className="text-sm text-gray-600">{description}</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-900">Ways to contribute:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {examples.map((example, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        {/* Back */}
        <Card
          className={`absolute inset-0 flex flex-col items-center justify-center border-l-4 border-l-gray-300 bg-white [transform:rotateY(180deg)] [backface-visibility:hidden] h-full w-full`}
        >
          <CardHeader className="flex items-center justify-center">
            <CardTitle className="text-lg text-dna-forest">Why it matters</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center">
            <p className="text-base text-gray-700 font-medium">{whyItMatters}</p>
          </CardContent>
        </Card>
      </div>
      <style jsx>{`
        .perspective {
          perspective: 1200px;
        }
      `}</style>
    </div>
  );
};

export default PathwayCard;
