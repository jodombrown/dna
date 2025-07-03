
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { useSavedItems } from '@/hooks/useSavedItems';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  targetType: 'post' | 'event' | 'opportunity';
  targetId: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showText?: boolean;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  targetType,
  targetId,
  variant = 'ghost',
  size = 'sm',
  className,
  showText = false
}) => {
  const { isSaved, toggleSave } = useSavedItems();
  const saved = isSaved(targetType, targetId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleSave(targetType, targetId);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      className={cn(
        "transition-colors",
        saved ? "text-blue-600 hover:text-blue-700" : "text-gray-500 hover:text-blue-600",
        className
      )}
    >
      <Bookmark 
        className={cn(
          "w-4 h-4",
          showText && "mr-1",
          saved && "fill-current"
        )} 
      />
      {showText && (saved ? "Saved" : "Save")}
    </Button>
  );
};

export default BookmarkButton;
