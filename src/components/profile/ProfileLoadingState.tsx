
import React from "react";
import { Spinner } from "@/components/ui/spinner";

const ProfileLoadingState = () => (
  <div className="flex h-[60vh] flex-col items-center justify-center">
    <Spinner />
    <div className="mt-4 text-gray-700 text-lg">Loading your profile…</div>
  </div>
);

export default ProfileLoadingState;
