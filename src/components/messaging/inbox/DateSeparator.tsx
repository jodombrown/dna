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
    <div className="flex items-center justify-center py-2">
      <div className="bg-primary/10 text-primary/80 text-[10px] font-medium px-2.5 py-0.5 rounded-full">
        {formatDate(date)}
      </div>
    </div>
  );
};
