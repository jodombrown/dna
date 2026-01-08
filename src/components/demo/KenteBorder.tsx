import { cn } from '@/lib/utils';

interface KenteBorderProps {
  width?: string;
  height?: string;
  centered?: boolean;
  className?: string;
}

export function KenteBorder({ 
  width = '80px', 
  height = '3px', 
  centered = true,
  className 
}: KenteBorderProps) {
  return (
    <div 
      className={cn(
        "rounded-sm animate-kente-flow",
        centered && "mx-auto",
        className
      )}
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, #4A8D77, #E07A5F, #F4A261, #9B5DE5, #3D5A80, #4A8D77)',
        backgroundSize: '200% 100%',
        animation: 'kente-flow 8s linear infinite',
      }}
    />
  );
}

// Add this to your global CSS or index.css:
// @keyframes kente-flow {
//   0% { background-position: 0% 50%; }
//   100% { background-position: 200% 50%; }
// }
