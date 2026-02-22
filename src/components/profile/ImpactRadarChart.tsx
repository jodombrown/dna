/**
 * DNA | Impact Radar Chart — Sprint 13A
 *
 * Pentagon radar chart showing Five C's engagement scores.
 * DNA's signature visual element on every profile.
 */

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ImpactScores } from '@/services/impact-score-service';

interface ImpactRadarChartProps {
  scores: ImpactScores;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  interactive?: boolean;
}

const C_ROUTES: Record<string, string> = {
  Connect: '/dna/connect',
  Convene: '/dna/convene',
  Collaborate: '/dna/collaborate',
  Contribute: '/dna/contribute',
  Convey: '/dna/convey',
};

const DNA_EMERALD = '#4A8D77';

const SIZE_CONFIG = {
  sm: { width: 120, height: 120, fontSize: 0, dotSize: 0, showCenter: false },
  md: { width: 200, height: 200, fontSize: 10, dotSize: 3, showCenter: true },
  lg: { width: 300, height: 300, fontSize: 12, dotSize: 4, showCenter: true },
};

function TrendIcon({ trend }: { trend: ImpactScores['trend'] }) {
  if (trend === 'rising') return <TrendingUp className="w-3 h-3 text-green-500 inline-block" />;
  if (trend === 'declining') return <TrendingDown className="w-3 h-3 text-red-400 inline-block" />;
  return <Minus className="w-3 h-3 text-muted-foreground inline-block" />;
}

interface CustomTickProps {
  x: number;
  y: number;
  payload: { value: string };
  interactive: boolean;
  navigate: (path: string) => void;
}

function CustomTick({ x, y, payload, interactive, navigate: nav }: CustomTickProps) {
  const handleClick = () => {
    if (interactive) {
      const route = C_ROUTES[payload.value];
      if (route) nav(route);
    }
  };

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        textAnchor="middle"
        fill="currentColor"
        fontSize={11}
        className={interactive ? 'cursor-pointer hover:fill-primary' : ''}
        onClick={handleClick}
        dy={0}
      >
        {payload.value}
      </text>
    </g>
  );
}

const ImpactRadarChart: React.FC<ImpactRadarChartProps> = ({
  scores,
  size = 'md',
  showLabels,
  interactive = false,
}) => {
  const navigate = useNavigate();
  const config = SIZE_CONFIG[size];
  const shouldShowLabels = showLabels ?? size !== 'sm';

  const chartData = [
    { c: 'Connect', score: scores.connect, fullMark: 100 },
    { c: 'Convene', score: scores.convene, fullMark: 100 },
    { c: 'Collaborate', score: scores.collaborate, fullMark: 100 },
    { c: 'Contribute', score: scores.contribute, fullMark: 100 },
    { c: 'Convey', score: scores.convey, fullMark: 100 },
  ];

  return (
    <div className="relative" style={{ width: config.width, height: config.height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="hsl(var(--border))" />
          {shouldShowLabels && (
            <PolarAngleAxis
              dataKey="c"
              tick={(props: any) => (
                <CustomTick
                  x={props.x}
                  y={props.y}
                  payload={props.payload}
                  interactive={interactive}
                  navigate={navigate}
                />
              )}
            />
          )}
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          {size === 'lg' && (
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload as { c: string; score: number };
                return (
                  <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-md text-sm">
                    <p className="font-medium">{item.c}: {item.score}/100</p>
                  </div>
                );
              }}
            />
          )}
          <Radar
            name="Impact"
            dataKey="score"
            stroke={DNA_EMERALD}
            fill={DNA_EMERALD}
            fillOpacity={0.3}
            strokeWidth={2}
            dot={config.dotSize > 0 ? { r: config.dotSize, fill: DNA_EMERALD } : false}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Center overall score */}
      {config.showCenter && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <span className="text-lg font-bold text-foreground">{scores.overall}</span>
            <div className="flex items-center justify-center gap-0.5">
              <TrendIcon trend={scores.trend} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactRadarChart;
