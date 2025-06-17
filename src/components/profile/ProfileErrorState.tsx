
import React from "react";

const ProfileErrorState = ({ error }: { error: string }) => (
  <div className="flex h-[60vh] flex-col items-center justify-center">
    <div className="text-red-600 font-semibold mb-2">Error loading profile</div>
    <div className="mb-4">{error}</div>
  </div>
);

export default ProfileErrorState;
