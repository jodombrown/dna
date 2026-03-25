/**
 * DocumentChip - Tappable document attachment display
 */

import React from 'react';
import { FileText, FileSpreadsheet, File, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MediaItem } from '@/types/groupMessaging';

interface DocumentChipProps {
  doc: MediaItem;
  isOwn: boolean;
}

function getDocIcon(mimeType?: string) {
  if (!mimeType) return File;
  if (mimeType.includes('pdf')) return FileText;
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return FileSpreadsheet;
  return FileText;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function truncateName(name: string, max = 24): string {
  if (name.length <= max) return name;
  const ext = name.split('.').pop() || '';
  const base = name.slice(0, max - ext.length - 4);
  return `${base}...${ext}`;
}

export function DocumentChip({ doc, isOwn }: DocumentChipProps) {
  const Icon = getDocIcon(doc.mimeType);

  return (
    <a
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex items-center gap-3 mt-1 p-3 rounded-lg transition-colors',
        isOwn
          ? 'bg-primary-foreground/10 hover:bg-primary-foreground/20'
          : 'bg-muted hover:bg-muted/80'
      )}
    >
      <div className={cn(
        'p-2 rounded-lg flex-shrink-0',
        isOwn ? 'bg-primary-foreground/20' : 'bg-background'
      )}>
        <Icon className={cn(
          'h-5 w-5',
          isOwn ? 'text-primary-foreground' : 'text-muted-foreground'
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium truncate',
          isOwn ? 'text-primary-foreground' : 'text-foreground'
        )}>
          {truncateName(doc.name)}
        </p>
        <p className={cn(
          'text-xs',
          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
        )}>
          {formatSize(doc.size)}
        </p>
      </div>
      <Download className={cn(
        'h-4 w-4 flex-shrink-0',
        isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
      )} />
    </a>
  );
}
