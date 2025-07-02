
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TouchFriendlyButtonProps extends React.ComponentProps<typeof Button> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({
  className,
  variant = 'primary',
  size = 'default',
  children,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-dna-emerald hover:bg-dna-forest text-white shadow-md',
    secondary: 'bg-dna-copper hover:bg-dna-gold text-white shadow-md',
    outline: 'border-2 border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white',
    ghost: 'text-dna-emerald hover:bg-dna-emerald/10'
  };

  const sizeClasses = {
    sm: 'h-10 px-4 text-sm',
    default: 'h-11 px-6 text-base',
    lg: 'h-12 px-8 text-lg'
  };

  return (
    <Button
      className={cn(
        'touch-manipulation transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95',
        'min-h-[44px] font-medium rounded-lg',
        variantClasses[variant],
        sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.default,
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};
