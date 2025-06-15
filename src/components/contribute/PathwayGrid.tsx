
import React from "react";
import PathwayCard from "./PathwayCard";
import impactPathwaysData from "./impactPathwaysData";

// A responsive grid that displays pathway cards and prevents text overflow
const PathwayGrid: React.FC = () => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {impactPathwaysData.map((pathway, i) => (
        <div
          key={i}
          className="overflow-hidden max-w-full"
          style={{ minWidth: 0 }}
        >
          <PathwayCard {...pathway} />
        </div>
      ))}
    </div>
  );
};

export default PathwayGrid;
