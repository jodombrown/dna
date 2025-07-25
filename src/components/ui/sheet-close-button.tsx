import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SheetCloseButtonProps {
  onClose: () => void;
  className?: string;
}

const SheetCloseButton: React.FC<SheetCloseButtonProps> = ({ onClose, className = "" }) => {
  return (
    <Button
      onClick={onClose}
      variant="ghost"
      size="sm"
      className={`absolute -right-2 -top-2 rounded-full bg-white border-2 border-gray-200 w-8 h-8 h-8 w-8 p-0 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dna-emerald focus:ring-offset-2 z-10 ${className}`}
    >
      <X className="h-4 w-4 text-gray-600" />
      <span className="sr-only">Close</span>
    </Button>
  );
};

export default SheetCloseButton;