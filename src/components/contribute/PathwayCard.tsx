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
      className="perspective group focus:outline-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      style={{
        maxWidth: "100%",
        minWidth: 0,
        minHeight: 230,
        height: "100%",
      }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
          hovered ? "[transform:rotateY(180deg)]" : ""
        }`}
        style={{
          minHeight: 230,
          height: "100%",
          maxWidth: "100%",
          backfaceVisibility: "hidden",
        }}
      >
        {/* Front */}
        <Card
          className={`absolute inset-0 ${bgColor} border border-gray-200 shadow-md [backface-visibility:hidden] h-full w-full rounded-2xl`}
          style={{
            maxWidth: "100%",
            height: "100%",
            overflow: "hidden",
            padding: "0",
            minHeight: 230,
          }}
        >
          <CardHeader className="pb-2 pt-6 px-5">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg font-bold whitespace-normal break-words">
                {title}
              </CardTitle>
            </div>
            <p className="text-sm text-gray-700 whitespace-normal break-words max-w-full font-normal">{description}</p>
          </CardHeader>
          <CardContent className="pt-0 px-5 pb-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-gray-800">Ways to contribute:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {examples.slice(0, 3).map((example, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 whitespace-normal break-words"
                  >
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0 mt-1" />
                    <span className="overflow-hidden text-ellipsis">{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        {/* Back */}
        <Card
          className={`absolute inset-0 flex flex-col items-center justify-center border border-gray-200 bg-white [transform:rotateY(180deg)] [backface-visibility:hidden] h-full w-full rounded-2xl`}
          style={{
            maxWidth: "100%",
            height: "100%",
            overflow: "hidden",
            minHeight: 230,
          }}
        >
          <CardHeader className="flex items-center justify-center p-0">
            <CardTitle className="text-lg text-dna-forest font-bold">
              Why it matters
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center px-5">
            <p className="text-base text-gray-700 font-medium break-words max-w-xs sm:max-w-sm md:max-w-md overflow-hidden text-ellipsis">
              {whyItMatters}
            </p>
          </CardContent>
        </Card>
      </div>
      <style>{`
        .perspective {
          perspective: 1200px;
        }
      `}</style>
    </div>
  );
};

export default PathwayCard;
