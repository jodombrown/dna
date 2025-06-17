
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface ArrayFieldManagerProps {
  label: string;
  items: string[];
  newItem: string;
  placeholder: string;
  badgeColor?: string;
  onNewItemChange: (value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (item: string) => void;
}

const ArrayFieldManager: React.FC<ArrayFieldManagerProps> = ({
  label,
  items,
  newItem,
  placeholder,
  badgeColor = "text-gray-700 border-gray-300",
  onNewItemChange,
  onAddItem,
  onRemoveItem,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddItem();
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 mb-2">
        <Input
          value={newItem}
          onChange={(e) => onNewItemChange(e.target.value)}
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
        />
        <Button type="button" onClick={onAddItem} size="sm">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={index} variant="outline" className={badgeColor}>
            {item}
            <X
              className="w-3 h-3 ml-1 cursor-pointer"
              onClick={() => onRemoveItem(item)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default ArrayFieldManager;
