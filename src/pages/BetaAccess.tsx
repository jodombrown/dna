import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import BetaAccessForm from '@/components/auth/BetaAccessForm';
import AuthPageShell from '@/components/auth/AuthPageShell';

export default function BetaAccess() {
  return (
    <AuthPageShell>
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
    </AuthPageShell>
  );
}
