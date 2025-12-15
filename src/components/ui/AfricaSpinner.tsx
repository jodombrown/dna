import React from 'react';
import { cn } from '@/lib/utils';
import africaIcon from '@/assets/africa-icon.png';

interface AfricaSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  text?: string;
}

const AfricaSpinner: React.FC<AfricaSpinnerProps> = ({ 
  size = 'md', 
  className,
  showText = false,
  text = 'Loading...'
}) => {
  const sizeConfig = {
    sm: { container: 'w-12 h-12', icon: 'w-6 h-6', ring: 'w-12 h-12 border-2' },
    md: { container: 'w-20 h-20', icon: 'w-10 h-10', ring: 'w-20 h-20 border-3' },
    lg: { container: 'w-28 h-28', icon: 'w-14 h-14', ring: 'w-28 h-28 border-4' }
  };

  const config = sizeConfig[size];

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn('relative', config.container)}>
        {/* Spinning ring */}
        <div 
          className={cn(
            'absolute inset-0 rounded-full border-dna-emerald/30 border-t-dna-emerald animate-spin',
            config.ring
          )}
          style={{ animationDuration: '1s' }}
        />
        
        {/* Africa icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={africaIcon} 
            alt="Loading" 
            className={cn('object-contain', config.icon)}
          />
        </div>
      </div>
      
      {showText && (
        <span className="text-sm text-muted-foreground font-medium">{text}</span>
      )}
    </div>
  );
};

export default AfricaSpinner;
export { AfricaSpinner };
