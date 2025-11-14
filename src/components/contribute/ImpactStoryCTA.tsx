import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ImpactStoryCTAProps {
  spaceId: string;
  needId: string;
  needTitle: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function ImpactStoryCTA({ 
  spaceId, 
  needId, 
  needTitle,
  variant = 'outline',
  size = 'default',
  className = ''
}: ImpactStoryCTAProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/dna/convey/new?type=impact&space_id=${spaceId}&need_id=${needId}`);
  };

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleClick}
      className={className}
    >
      <Sparkles className="h-4 w-4 mr-2" />
      Share impact story
    </Button>
  );
}
