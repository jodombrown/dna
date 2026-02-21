import React from 'react';

interface FeedbackWidgetProps {
  step?: string;
  onComplete?: () => void;
  onSkip?: () => void;
}

// Placeholder component - feedback functionality removed
const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ step, onComplete, onSkip }) => {
  return null;
};

export default FeedbackWidget;