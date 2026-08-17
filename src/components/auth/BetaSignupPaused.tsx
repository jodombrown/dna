import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, ArrowRight } from 'lucide-react';
import BetaAccessForm from '@/components/auth/BetaAccessForm';
import { BETA_WINDOW_LABEL } from '@/lib/betaAccess';

/**
 * What a visitor sees on the Sign up tab while signup is paused: the beta
 * story, a way to read more, and the request form directly below it so the
 * next step is never something they have to hunt for.
 */
export const BetaSignupPaused: React.FC = () => (
  <div className="space-y-5">
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <CalendarClock className="w-4 h-4 mt-1 shrink-0 text-dna-copper" />
        <h2 className="text-h3">DNA is in closed beta</h2>
      </div>
      <p className="text-body text-muted-foreground">
        Beta runs {BETA_WINDOW_LABEL}. New accounts are granted by invitation during this window.
        Public launch follows with a full campaign into Detty December in Accra, Ghana.
      </p>
      <Link
        to="/beta"
        className="inline-flex items-center gap-1 text-body text-dna-forest underline hover:no-underline"
      >
        Learn more about beta in-app testing
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>

    <div className="space-y-2">
      <h3 className="text-h3">Request beta access</h3>
      <p className="text-meta text-muted-foreground">
        Tell us who you are. If access is granted you will get an email with a sign-in link.
      </p>
    </div>

    <BetaAccessForm />
  </div>
);

export default BetaSignupPaused;
