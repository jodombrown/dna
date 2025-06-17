
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ProfileForm = () => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-dna-forest">Profile Form</CardTitle>
        <CardDescription>
          Profile form functionality has been reset for fresh implementation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">
          Ready to build a new profile form.
        </p>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
