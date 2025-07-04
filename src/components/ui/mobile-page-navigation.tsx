import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobilePageNavigationProps {
  currentPage: 'connect' | 'collaborate' | 'contribute';
}

const MobilePageNavigation: React.FC<MobilePageNavigationProps> = ({ currentPage }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const getNavigationConfig = () => {
    switch (currentPage) {
      case 'connect':
        return {
          buttons: [
            {
              label: 'Collaborate',
              onClick: () => navigate('/collaborate'),
              icon: <ArrowRight className="w-4 h-4" />,
              variant: 'default' as const
            }
          ]
        };
      case 'collaborate':
        return {
          buttons: [
            {
              label: 'Contribute',
              onClick: () => navigate('/contribute'),
              icon: <ArrowRight className="w-4 h-4" />,
              variant: 'default' as const
            }
          ]
        };
      case 'contribute':
        return {
          buttons: [
            {
              label: 'Collaborate',
              onClick: () => navigate('/collaborate'),
              icon: <ArrowLeft className="w-4 h-4" />,
              variant: 'outline' as const
            },
            {
              label: 'Connect',
              onClick: () => navigate('/connect'),
              icon: <ArrowLeft className="w-4 h-4" />,
              variant: 'outline' as const
            }
          ]
        };
      default:
        return { buttons: [] };
    }
  };

  const { buttons } = getNavigationConfig();

  if (buttons.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-3 safe-area-pb">
      <div className="flex gap-3 justify-center max-w-sm mx-auto">
        {buttons.map((button, index) => (
          <Button
            key={index}
            onClick={button.onClick}
            variant={button.variant}
            size="sm"
            className="flex-1 flex items-center justify-center gap-2 font-medium shadow-sm"
          >
            {button.variant === 'outline' && button.icon}
            <span>{button.label}</span>
            {button.variant === 'default' && button.icon}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MobilePageNavigation;