import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';

interface DateSeparatorProps {
  date: string;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isToday(d)) return 'Today';
      if (isYesterday(d)) return 'Yesterday';
      return format(d, 'MMMM d, yyyy');
    } catch {
      return '';
    }
  };

  return (
    <div className="flex items-center justify-center py-4">
      <div className="bg-muted/80 text-muted-foreground text-xs font-medium px-3 py-1 rounded-full">
        {formatDate(date)}
      </div>
    </div>
  );
};
