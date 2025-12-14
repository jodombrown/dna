import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Link,
  Code,
} from 'lucide-react';

interface FloatingToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onFormat: (type: string) => void;
  isVisible: boolean;
}

interface Position {
  top: number;
  left: number;
}

export function FloatingToolbar({ textareaRef, onFormat, isVisible }: FloatingToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [show, setShow] = useState(false);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !isVisible) {
      setShow(false);
      return;
    }

    const updatePosition = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setShow(false);
        return;
      }

      // For textarea, we need to calculate position differently
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      if (start === end) {
        setShow(false);
        return;
      }

      // Get textarea bounding rect
      const rect = textarea.getBoundingClientRect();
      
      // Estimate position based on text before selection
      const textBeforeSelection = textarea.value.substring(0, start);
      const lines = textBeforeSelection.split('\n');
      const lineHeight = 24; // Approximate line height
      const charWidth = 8; // Approximate char width for monospace
      
      const lineNumber = lines.length - 1;
      const charInLine = lines[lines.length - 1].length;
      
      // Calculate position relative to textarea
      const offsetTop = lineNumber * lineHeight;
      const offsetLeft = Math.min(charInLine * charWidth, rect.width / 2);
      
      setPosition({
        top: rect.top + window.scrollY + offsetTop - 45, // 45px above selection
        left: rect.left + window.scrollX + offsetLeft,
      });
      setShow(true);
    };

    // Listen for selection changes
    const handleSelectionChange = () => {
      if (document.activeElement === textarea) {
        const hasSelection = textarea.selectionStart !== textarea.selectionEnd;
        if (hasSelection) {
          updatePosition();
        } else {
          setShow(false);
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    textarea.addEventListener('mouseup', updatePosition);
    textarea.addEventListener('keyup', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      textarea.removeEventListener('mouseup', updatePosition);
      textarea.removeEventListener('keyup', handleSelectionChange);
    };
  }, [textareaRef, isVisible]);

  if (!show || !isVisible) return null;

  const formatButtons = [
    { icon: Bold, type: 'bold', label: 'Bold' },
    { icon: Italic, type: 'italic', label: 'Italic' },
    { icon: Underline, type: 'underline', label: 'Underline' },
    { icon: Strikethrough, type: 'strikethrough', label: 'Strikethrough' },
    { icon: Highlighter, type: 'highlight', label: 'Highlight' },
    { icon: Code, type: 'code', label: 'Code' },
    { icon: Link, type: 'link', label: 'Link' },
  ];

  const toolbar = (
    <div
      ref={toolbarRef}
      className="fixed z-50 flex items-center gap-0.5 p-1 bg-popover border border-border rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95 duration-150"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
    >
      {formatButtons.map(({ icon: Icon, type, label }) => (
        <Button
          key={type}
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          onClick={() => onFormat(type)}
          title={label}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );

  return createPortal(toolbar, document.body);
}
