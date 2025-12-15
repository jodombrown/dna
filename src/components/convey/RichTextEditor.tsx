import { useState, useRef, useCallback, useEffect } from 'react';
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
  Underline,
  Strikethrough,
  Highlighter,
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
  Code,
  Upload,
} from 'lucide-react';
import { FloatingToolbar } from './editor/FloatingToolbar';
import { SlashCommandMenu, type SlashCommand } from './editor/SlashCommandMenu';
import { MediaDropZone } from './editor/MediaDropZone';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  error?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your story... (type / for commands)",
  minHeight = "300px",
  error,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashPosition, setSlashPosition] = useState(0);
  const [hasTextSelection, setHasTextSelection] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Track text selection for floating toolbar
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const checkSelection = () => {
      const hasSelection = textarea.selectionStart !== textarea.selectionEnd;
      setHasTextSelection(hasSelection);
    };

    const handleBlur = () => setHasTextSelection(false);

    textarea.addEventListener('select', checkSelection);
    textarea.addEventListener('mouseup', checkSelection);
    textarea.addEventListener('keyup', checkSelection);
    textarea.addEventListener('blur', handleBlur);

    return () => {
      textarea.removeEventListener('select', checkSelection);
      textarea.removeEventListener('mouseup', checkSelection);
      textarea.removeEventListener('keyup', checkSelection);
      textarea.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Detect slash command trigger
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);

    // Check if user just typed a slash at start of line or after space/newline
    const charBefore = cursorPos > 1 ? newValue[cursorPos - 2] : '';
    const currentChar = newValue[cursorPos - 1];
    
    if (currentChar === '/' && (charBefore === '' || charBefore === ' ' || charBefore === '\n' || cursorPos === 1)) {
      setShowSlashMenu(true);
      setSlashPosition(cursorPos);
    }
  }, [onChange]);

  // Handle slash command insert
  const handleSlashInsert = useCallback((command: SlashCommand) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Find the slash position and remove slash + any query text
    const slashIndex = value.lastIndexOf('/', slashPosition);
    const textBeforeSlash = value.substring(0, slashIndex);
    const textAfterCursor = value.substring(textarea.selectionStart);
    
    const newValue = textBeforeSlash + command.insert + textAfterCursor;
    onChange(newValue);
    setShowSlashMenu(false);

    // Position cursor appropriately
    setTimeout(() => {
      textarea.focus();
      if (command.selectRange) {
        const selectStart = slashIndex + command.selectRange[0];
        const selectEnd = slashIndex + command.selectRange[1];
        textarea.setSelectionRange(selectStart, selectEnd);
      } else {
        const cursorPos = slashIndex + command.insert.length;
        textarea.setSelectionRange(cursorPos, cursorPos);
      }
    }, 0);
  }, [value, slashPosition, onChange]);

  // Format functions
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
      newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);
      newCursorPos = start + before.length + selectedText.length + after.length;
    } else if (action === 'prefix' && prefix) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const currentLinePrefix = value.substring(lineStart, start);
      
      if (currentLinePrefix.startsWith(prefix)) {
        newValue = value.substring(0, lineStart) + value.substring(lineStart + prefix.length);
        newCursorPos = start - prefix.length;
      } else {
        newValue = value.substring(0, lineStart) + prefix + value.substring(lineStart);
        newCursorPos = start + prefix.length;
      }
    } else if (action === 'insert' && insert) {
      newValue = value.substring(0, start) + insert + value.substring(end);
      newCursorPos = start + insert.length;
    }

    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  // Floating toolbar format handler
  const handleFloatingFormat = useCallback((type: string) => {
    const formatMap: Record<string, () => void> = {
      bold: () => insertFormatting('wrap', '**', '**'),
      italic: () => insertFormatting('wrap', '*', '*'),
      underline: () => insertFormatting('wrap', '<u>', '</u>'),
      strikethrough: () => insertFormatting('wrap', '~~', '~~'),
      highlight: () => insertFormatting('wrap', '==', '=='),
      code: () => insertFormatting('wrap', '`', '`'),
      link: () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        
        if (selectedText) {
          const linkText = `[${selectedText}](url)`;
          const newValue = value.substring(0, start) + linkText + value.substring(end);
          onChange(newValue);
          
          setTimeout(() => {
            textarea.focus();
            const urlStart = start + selectedText.length + 3;
            textarea.setSelectionRange(urlStart, urlStart + 3);
          }, 0);
        }
      },
    };

    formatMap[type]?.();
    setHasTextSelection(false);
  }, [insertFormatting, value, onChange]);

  // Fixed toolbar handlers
  const handleBold = () => insertFormatting('wrap', '**', '**');
  const handleItalic = () => insertFormatting('wrap', '*', '*');
  const handleUnderline = () => insertFormatting('wrap', '<u>', '</u>');
  const handleStrikethrough = () => insertFormatting('wrap', '~~', '~~');
  const handleHighlight = () => insertFormatting('wrap', '==', '==');
  const handleCode = () => insertFormatting('wrap', '`', '`');
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
      const linkText = `[${selectedText}](url)`;
      const newValue = value.substring(0, start) + linkText + value.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        textarea.focus();
        const urlStart = start + selectedText.length + 3;
        textarea.setSelectionRange(urlStart, urlStart + 3);
      }, 0);
    } else {
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

  // Handle media insert from drag & drop
  const handleMediaInsert = useCallback((markdown: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newValue = value.substring(0, start) + '\n' + markdown + '\n' + value.substring(start);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const cursorPos = start + markdown.length + 2;
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  }, [value, onChange]);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  // Detect paste of URLs for auto-embed
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Check if it's a video URL
    const videoPatterns = [
      /youtube\.com\/watch\?v=/i,
      /youtu\.be\//i,
      /vimeo\.com\//i,
      /tiktok\.com\//i,
    ];
    
    const isVideoUrl = videoPatterns.some(pattern => pattern.test(pastedText));
    
    if (isVideoUrl) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const videoEmbed = `\n[Video](${pastedText})\n`;
      
      const newValue = value.substring(0, start) + videoEmbed + value.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        textarea.focus();
        const cursorPos = start + videoEmbed.length;
        textarea.setSelectionRange(cursorPos, cursorPos);
      }, 0);
    }

    // Check if it's an image URL
    const imagePatterns = [
      /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i,
    ];
    
    const isImageUrl = imagePatterns.some(pattern => pattern.test(pastedText));
    
    if (isImageUrl) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const imageEmbed = `\n![Image](${pastedText})\n`;
      
      const newValue = value.substring(0, start) + imageEmbed + value.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        textarea.focus();
        const cursorPos = start + imageEmbed.length;
        textarea.setSelectionRange(cursorPos, cursorPos);
      }, 0);
    }
  }, [value, onChange]);

  const formatButtons = [
    { icon: <Bold className="h-4 w-4" />, label: 'Bold', onClick: handleBold, shortcut: '**text**' },
    { icon: <Italic className="h-4 w-4" />, label: 'Italic', onClick: handleItalic, shortcut: '*text*' },
    { icon: <Underline className="h-4 w-4" />, label: 'Underline', onClick: handleUnderline, shortcut: '<u>text</u>' },
    { icon: <Strikethrough className="h-4 w-4" />, label: 'Strikethrough', onClick: handleStrikethrough, shortcut: '~~text~~' },
    { icon: <Highlighter className="h-4 w-4" />, label: 'Highlight', onClick: handleHighlight, shortcut: '==text==' },
    { icon: <Code className="h-4 w-4" />, label: 'Code', onClick: handleCode, shortcut: '`code`' },
  ];

  const structureButtons = [
    { icon: <Heading1 className="h-4 w-4" />, label: 'Heading 1', onClick: handleH1, shortcut: '# ' },
    { icon: <Heading2 className="h-4 w-4" />, label: 'Heading 2', onClick: handleH2, shortcut: '## ' },
    { icon: <Heading3 className="h-4 w-4" />, label: 'Heading 3', onClick: handleH3, shortcut: '### ' },
    { icon: <Quote className="h-4 w-4" />, label: 'Block Quote', onClick: handleQuote, shortcut: '> ' },
    { icon: <List className="h-4 w-4" />, label: 'Bullet List', onClick: handleBulletList, shortcut: '- ' },
    { icon: <ListOrdered className="h-4 w-4" />, label: 'Numbered List', onClick: handleNumberedList, shortcut: '1. ' },
    { icon: <Minus className="h-4 w-4" />, label: 'Divider', onClick: handleDivider, shortcut: '---' },
  ];

  const mediaButtons = [
    { icon: <Link className="h-4 w-4" />, label: 'Link', onClick: handleLink, shortcut: '[text](url)' },
    { icon: <Image className="h-4 w-4" />, label: 'Image', onClick: handleImage, shortcut: '![alt](url)' },
    { icon: <Video className="h-4 w-4" />, label: 'Video', onClick: handleVideo, shortcut: 'Embed URL' },
  ];

  // Calculate reading time estimate
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="space-y-2 relative">
      {/* Fixed Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/30 border border-border rounded-t-lg">
        <TooltipProvider delayDuration={300}>
          {/* Text Formatting */}
          {formatButtons.map((btn) => (
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
                <p className="text-muted-foreground font-mono">{btn.shortcut}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          {/* Structure */}
          {structureButtons.map((btn) => (
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
                <p className="text-muted-foreground font-mono">{btn.shortcut}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          {/* Media */}
          {mediaButtons.map((btn) => (
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
                <p className="text-muted-foreground font-mono">{btn.shortcut}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {/* Upload Button */}
          <MediaDropZone 
            onMediaInsert={handleMediaInsert}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
          />
        </TooltipProvider>
        
        <Separator orientation="vertical" className="h-6 mx-2" />
        
        {/* Word count & reading time */}
        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span>{wordCount} words</span>
          <span>~{readingTime} min read</span>
        </div>
      </div>

      {/* Text Area with drag & drop support */}
      <div 
        className="relative"
        onDragEnter={handleDragEnter}
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onPaste={handlePaste}
          placeholder={placeholder}
          className="rounded-t-none border-t-0 focus-visible:ring-1 resize-y font-mono text-sm leading-relaxed"
          style={{ minHeight }}
        />

        {/* Drag overlay */}
        {isDragging && (
          <MediaDropZone 
            onMediaInsert={handleMediaInsert}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
          />
        )}
      </div>

      {/* Floating Toolbar (appears on text selection) */}
      <FloatingToolbar
        textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>}
        onFormat={handleFloatingFormat}
        isVisible={hasTextSelection}
      />

      {/* Slash Command Menu */}
      {showSlashMenu && (
        <SlashCommandMenu
          textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          cursorPosition={textareaRef.current?.selectionStart || slashPosition}
          onInsert={handleSlashInsert}
          onClose={() => setShowSlashMenu(false)}
        />
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Formatting Help */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Tip:</strong> Type <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">/</kbd> for quick commands, or select text for formatting options
        </p>
      </div>
    </div>
  );
}
