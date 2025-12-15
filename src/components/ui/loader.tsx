import { cn } from "@/lib/utils";
import AfricaSpinner from "./AfricaSpinner";

interface LoaderProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loader({ label, size = "md", className }: LoaderProps) {
  return (
    <div className={cn("p-8", className)}>
      <AfricaSpinner size={size} showText={!!label} text={label} />
    </div>
  );
}