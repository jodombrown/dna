import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

const POLICIES = [
  { label: 'User Agreement', path: '/legal/user-agreement' },
  { label: 'Privacy Policy', path: '/legal/privacy-policy' },
  { label: 'Terms & Conditions', path: '/legal/terms' },
  { label: 'Cookie Policy', path: '/legal/cookie-policy' },
];

export function RelatedPolicies() {
  const navigate = useNavigate();
  const location = useLocation();

  const otherPolicies = POLICIES.filter(p => p.path !== location.pathname);

  return (
    <div className="border-t border-border pt-6 mt-8">
      <h3 className="text-lg font-semibold text-dna-forest mb-3">Related Policies</h3>
      <div className="flex flex-wrap gap-3">
        {otherPolicies.map(policy => (
          <Button
            key={policy.path}
            variant="outline"
            size="sm"
            onClick={() => navigate(policy.path)}
            className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
          >
            {policy.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default RelatedPolicies;
