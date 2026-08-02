import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import BetaAccessForm from '@/components/auth/BetaAccessForm';

export default function BetaAccess() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-body text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <Card>
          <CardContent className="pt-6">
            <BetaAccessForm />
          </CardContent>
        </Card>

        <p className="text-meta text-muted-foreground text-center">
          Already a Member?{' '}
          <Link to="/auth" className="underline hover:text-foreground">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
