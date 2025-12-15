import React from "react";
import AfricaSpinner from "./AfricaSpinner";

export const Spinner: React.FC<{ size?: "sm" | "md" | "lg"; className?: string }> = ({
  size = "md",
  className = "",
}) => {
  return <AfricaSpinner size={size} className={className} />;
};
