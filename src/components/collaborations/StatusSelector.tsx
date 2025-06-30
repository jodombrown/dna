
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { projectStatuses, getStatusColor, getStatusDisplayName } from './projectUtils';

interface StatusSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({
  value,
  onValueChange,
  className
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue>
          {value && (
            <Badge className={getStatusColor(value)} variant="secondary">
              {getStatusDisplayName(value)}
            </Badge>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {projectStatuses.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(status.value)} variant="secondary">
                {status.label}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StatusSelector;
