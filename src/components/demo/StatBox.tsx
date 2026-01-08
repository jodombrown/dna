interface StatBoxProps {
  value: string;
  label: string;
}

export function StatBox({ value, label }: StatBoxProps) {
  return (
    <div className="text-center">
      <div 
        className="font-body font-bold text-dna-emerald"
        style={{ fontSize: 'clamp(36px, 6vw, 48px)' }}
      >
        {value}
      </div>
      <div className="text-sm md:text-base text-muted-foreground font-body mt-1">
        {label}
      </div>
    </div>
  );
}
