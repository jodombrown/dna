import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loader({ label, size = "md", className }: LoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center space-y-3 p-8",
      className
    )}>
      <Loader2 className={cn(
        "animate-spin text-dna-forest",
        sizeClasses[size]
      )} />
      {label && (
        <p className="text-sm text-dna-copper font-medium">{label}</p>
      )}
    </div>
  );
}