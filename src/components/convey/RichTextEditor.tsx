import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link,
  Image,
  Video,
  Minus,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  error?: string;
}

interface FormatAction {
  icon: React.ReactNode;
  label: string;
  action: 'wrap' | 'prefix' | 'insert';
  before?: string;
  after?: string;
  prefix?: string;
  insert?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your story...",
  minHeight = "300px",
  error,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const insertFormatting = useCallback((
    action: 'wrap' | 'prefix' | 'insert',
    before?: string,
    after?: string,
    prefix?: string,
    insert?: string
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newValue = value;
    let newCursorPos = start;

    if (action === 'wrap' && before && after) {
      // Wrap selected text with before/after
      newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);
      newCursorPos = start + before.length + selectedText.length + after.length;
    } else if (action === 'prefix' && prefix) {
      // Add prefix at start of line
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const currentLinePrefix = value.substring(lineStart, start);
      
      // Check if line already has this prefix
      if (currentLinePrefix.startsWith(prefix)) {
        // Remove prefix
        newValue = value.substring(0, lineStart) + value.substring(lineStart + prefix.length);
        newCursorPos = start - prefix.length;
      } else {
        // Add prefix
        newValue = value.substring(0, lineStart) + prefix + value.substring(lineStart);
        newCursorPos = start + prefix.length;
      }
    } else if (action === 'insert' && insert) {
      // Insert text at cursor
      newValue = value.substring(0, start) + insert + value.substring(end);
      newCursorPos = start + insert.length;
    }

    onChange(newValue);
    
    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  const handleBold = () => insertFormatting('wrap', '**', '**');
  const handleItalic = () => insertFormatting('wrap', '*', '*');
  const handleH1 = () => insertFormatting('prefix', undefined, undefined, '# ');
  const handleH2 = () => insertFormatting('prefix', undefined, undefined, '## ');
  const handleH3 = () => insertFormatting('prefix', undefined, undefined, '### ');
  const handleQuote = () => insertFormatting('prefix', undefined, undefined, '> ');
  const handleBulletList = () => insertFormatting('prefix', undefined, undefined, '- ');
  const handleNumberedList = () => insertFormatting('prefix', undefined, undefined, '1. ');
  const handleDivider = () => insertFormatting('insert', undefined, undefined, undefined, '\n\n---\n\n');
  
  const handleLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      // Wrap selected text as link
      const linkText = `[${selectedText}](url)`;
      const newValue = value.substring(0, start) + linkText + value.substring(end);
      onChange(newValue);
      
      // Position cursor at "url" for easy replacement
      setTimeout(() => {
        textarea.focus();
        const urlStart = start + selectedText.length + 3;
        textarea.setSelectionRange(urlStart, urlStart + 3);
      }, 0);
    } else {
      // Insert link template
      const linkTemplate = '[link text](url)';
      const newValue = value.substring(0, start) + linkTemplate + value.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 1, start + 10);
      }, 0);
    }
  };

  const handleImage = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const imageTemplate = '\n![Image description](image-url)\n';
    const newValue = value.substring(0, start) + imageTemplate + value.substring(start);
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      const descStart = start + 3;
      textarea.setSelectionRange(descStart, descStart + 17);
    }, 0);
  };

  const handleVideo = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const videoTemplate = '\n[Video: paste YouTube/Vimeo URL here]\n';
    const newValue = value.substring(0, start) + videoTemplate + value.substring(start);
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      const urlStart = start + 9;
      textarea.setSelectionRange(urlStart, urlStart + 28);
    }, 0);
  };

  const formatButtons: { icon: React.ReactNode; label: string; onClick: () => void; shortcut?: string }[] = [
    { icon: <Bold className="h-4 w-4" />, label: 'Bold', onClick: handleBold, shortcut: '**text**' },
    { icon: <Italic className="h-4 w-4" />, label: 'Italic', onClick: handleItalic, shortcut: '*text*' },
    { icon: <Heading1 className="h-4 w-4" />, label: 'Heading 1', onClick: handleH1, shortcut: '# ' },
    { icon: <Heading2 className="h-4 w-4" />, label: 'Heading 2', onClick: handleH2, shortcut: '## ' },
    { icon: <Heading3 className="h-4 w-4" />, label: 'Heading 3', onClick: handleH3, shortcut: '### ' },
    { icon: <Quote className="h-4 w-4" />, label: 'Block Quote', onClick: handleQuote, shortcut: '> ' },
    { icon: <List className="h-4 w-4" />, label: 'Bullet List', onClick: handleBulletList, shortcut: '- ' },
    { icon: <ListOrdered className="h-4 w-4" />, label: 'Numbered List', onClick: handleNumberedList, shortcut: '1. ' },
    { icon: <Minus className="h-4 w-4" />, label: 'Divider', onClick: handleDivider, shortcut: '---' },
    { icon: <Link className="h-4 w-4" />, label: 'Link', onClick: handleLink, shortcut: '[text](url)' },
    { icon: <Image className="h-4 w-4" />, label: 'Image', onClick: handleImage, shortcut: '![alt](url)' },
    { icon: <Video className="h-4 w-4" />, label: 'Video', onClick: handleVideo, shortcut: 'Embed URL' },
  ];

  // Calculate reading time estimate
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute

  return (
    <div className="space-y-2">
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/30 border border-border rounded-t-lg">
        <TooltipProvider delayDuration={300}>
          {formatButtons.map((btn, index) => (
            <Tooltip key={btn.label}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={btn.onClick}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  {btn.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p>{btn.label}</p>
                {btn.shortcut && (
                  <p className="text-muted-foreground font-mono">{btn.shortcut}</p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
        
        <Separator orientation="vertical" className="h-6 mx-2" />
        
        {/* Word count & reading time */}
        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span>{wordCount} words</span>
          <span>~{readingTime} min read</span>
        </div>
      </div>

      {/* Text Area */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-t-none border-t-0 focus-visible:ring-1 resize-y font-mono text-sm"
        style={{ minHeight }}
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Formatting Help */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Markdown supported:</strong> **bold**, *italic*, # heading, {'>'} quote, - list, [link](url), ![image](url)
        </p>
      </div>
    </div>
  );
}
