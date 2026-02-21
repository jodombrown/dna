import React from "react";
import AfricaSpinner from "@/components/ui/AfricaSpinner";

const ProfileLoadingState = () => (
  <div className="flex h-[60vh] flex-col items-center justify-center">
    <AfricaSpinner size="lg" showText text="Loading your profile…" />
  </div>
);

export default ProfileLoadingState;
