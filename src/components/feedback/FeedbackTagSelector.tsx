import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UserTag } from '@/types/feedback';
import { USER_TAG_LABELS } from '@/types/feedback';

interface FeedbackTagSelectorProps {
  value: UserTag | null;
  onChange: (tag: UserTag | null) => void;
  disabled?: boolean;
}

const TAG_OPTIONS: UserTag[] = ['bug', 'suggestion', 'question', 'praise', 'other'];

export function FeedbackTagSelector({ value, onChange, disabled }: FeedbackTagSelectorProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {TAG_OPTIONS.map((tag) => (
        <Button
          key={tag}
          type="button"
          variant={value === tag ? 'default' : 'outline'}
          size="sm"
          disabled={disabled}
          onClick={() => onChange(value === tag ? null : tag)}
          className={cn('h-7 text-xs', value === tag && 'ring-2 ring-offset-2')}
        >
          #{USER_TAG_LABELS[tag]}
        </Button>
      ))}
    </div>
  );
}
