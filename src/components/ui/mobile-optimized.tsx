
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TouchFriendlyButtonProps extends React.ComponentProps<typeof Button> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-dna-emerald hover:bg-dna-forest text-white shadow-md',
    destructive: 'bg-red-500 hover:bg-red-600 text-white shadow-md',
    outline: 'border-2 border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white',
    secondary: 'bg-dna-copper hover:bg-dna-gold text-white shadow-md',
    ghost: 'text-dna-emerald hover:bg-dna-emerald/10',
    link: 'text-dna-emerald underline-offset-4 hover:underline'
  };

  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    default: 'h-10 px-4 text-base',
    lg: 'h-11 px-6 text-lg',
    icon: 'h-10 w-10'
  };

  return (
    <Button
      variant={variant}
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
