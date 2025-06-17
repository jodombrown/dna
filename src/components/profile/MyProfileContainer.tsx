
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const MyProfileContainer = () => {
  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-dna-forest">Profile</CardTitle>
          <CardDescription>
            Profile functionality has been reset for fresh implementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            The profile system is ready to be rebuilt from scratch.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyProfileContainer;
