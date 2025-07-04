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
              icon: <ArrowRight className="w-4 h-4" />,
              variant: 'outline' as const
            },
            {
              label: 'Connect',
              onClick: () => navigate('/connect'),
              icon: <ArrowRight className="w-4 h-4" />,
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
    <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-t border-gray-200 px-4 py-6 mt-8">
      <div className="max-w-7xl mx-auto">
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
    </div>
  );
};

export default MobilePageNavigation;