import React from 'react';
import { AlertCircle } from 'lucide-react';
import { LAUNCH_MESSAGES } from '@/utils/prelaunchGate';

interface PrelaunchNoticeProps {
  className?: string;
}

const PrelaunchNotice: React.FC<PrelaunchNoticeProps> = ({ className = '' }) => {
  return (
    <div 
      className={`bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-amber-800">
        <p className="font-medium mb-1">Platform Opening Soon</p>
        <p>{LAUNCH_MESSAGES.SIGNUP_NOTICE}</p>
      </div>
    </div>
  );
};

export default PrelaunchNotice;