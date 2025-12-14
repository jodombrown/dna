import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Code,
  Minus,
  Image,
  Video,
  Link,
  CheckSquare,
  Table,
} from 'lucide-react';

interface SlashCommandMenuProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  cursorPosition: number;
  onInsert: (command: SlashCommand) => void;
  onClose: () => void;
}

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'text' | 'list' | 'media' | 'other';
  insert: string;
  selectRange?: [number, number]; // Relative to insert start
}

const SLASH_COMMANDS: SlashCommand[] = [
  // Text
  { id: 'h1', label: 'Heading 1', description: 'Large section heading', icon: <Heading1 className="h-4 w-4" />, category: 'text', insert: '# ', selectRange: undefined },
  { id: 'h2', label: 'Heading 2', description: 'Medium section heading', icon: <Heading2 className="h-4 w-4" />, category: 'text', insert: '## ', selectRange: undefined },
  { id: 'h3', label: 'Heading 3', description: 'Small section heading', icon: <Heading3 className="h-4 w-4" />, category: 'text', insert: '### ', selectRange: undefined },
  { id: 'quote', label: 'Quote', description: 'Capture a quote', icon: <Quote className="h-4 w-4" />, category: 'text', insert: '> ', selectRange: undefined },
  { id: 'code', label: 'Code Block', description: 'Code snippet', icon: <Code className="h-4 w-4" />, category: 'text', insert: '```\n\n```', selectRange: [4, 4] },
  
  // Lists
  { id: 'bullet', label: 'Bullet List', description: 'Simple bullet list', icon: <List className="h-4 w-4" />, category: 'list', insert: '- ', selectRange: undefined },
  { id: 'numbered', label: 'Numbered List', description: 'Numbered list', icon: <ListOrdered className="h-4 w-4" />, category: 'list', insert: '1. ', selectRange: undefined },
  { id: 'todo', label: 'To-do List', description: 'Task with checkbox', icon: <CheckSquare className="h-4 w-4" />, category: 'list', insert: '- [ ] ', selectRange: undefined },
  
  // Media
  { id: 'image', label: 'Image', description: 'Upload or embed image', icon: <Image className="h-4 w-4" />, category: 'media', insert: '![Image description](image-url)', selectRange: [2, 19] },
  { id: 'video', label: 'Video', description: 'Embed YouTube or Vimeo', icon: <Video className="h-4 w-4" />, category: 'media', insert: '[Video](paste-url-here)', selectRange: [8, 22] },
  { id: 'link', label: 'Link', description: 'Web link', icon: <Link className="h-4 w-4" />, category: 'media', insert: '[Link text](url)', selectRange: [1, 10] },
  
  // Other
  { id: 'divider', label: 'Divider', description: 'Horizontal line', icon: <Minus className="h-4 w-4" />, category: 'other', insert: '\n---\n', selectRange: undefined },
];

export function SlashCommandMenu({ textareaRef, value, cursorPosition, onInsert, onClose }: SlashCommandMenuProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Filter commands based on query
  const filteredCommands = SLASH_COMMANDS.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  // Calculate position
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const rect = textarea.getBoundingClientRect();
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    const lineHeight = 24;
    const charWidth = 8;
    
    const lineNumber = lines.length - 1;
    const charInLine = lines[lines.length - 1].length;
    
    setPosition({
      top: rect.top + window.scrollY + Math.min(lineNumber * lineHeight + lineHeight + 10, rect.height - 200),
      left: rect.left + window.scrollX + Math.min(charInLine * charWidth, rect.width - 250),
    });
  }, [textareaRef, value, cursorPosition]);

  // Extract query from text after slash
  useEffect(() => {
    const slashIndex = value.lastIndexOf('/', cursorPosition);
    if (slashIndex >= 0 && slashIndex < cursorPosition) {
      const textAfterSlash = value.substring(slashIndex + 1, cursorPosition);
      // Only set query if no spaces (user is still typing command)
      if (!textAfterSlash.includes(' ') && !textAfterSlash.includes('\n')) {
        setQuery(textAfterSlash);
      } else {
        onClose();
      }
    }
  }, [value, cursorPosition, onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onInsert(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, onInsert, onClose]);

  // Reset selection when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (filteredCommands.length === 0) return null;

  const groupedCommands = {
    text: filteredCommands.filter(c => c.category === 'text'),
    list: filteredCommands.filter(c => c.category === 'list'),
    media: filteredCommands.filter(c => c.category === 'media'),
    other: filteredCommands.filter(c => c.category === 'other'),
  };

  const menu = (
    <div
      ref={menuRef}
      className="fixed z-50 w-64 max-h-80 overflow-y-auto bg-popover border border-border rounded-lg shadow-xl animate-in fade-in-0 slide-in-from-top-2 duration-150"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="p-2 border-b border-border">
        <p className="text-xs text-muted-foreground font-medium">Insert block</p>
      </div>
      
      <div className="p-1">
        {Object.entries(groupedCommands).map(([category, commands]) => {
          if (commands.length === 0) return null;
          
          return (
            <div key={category}>
              <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {category}
              </p>
              {commands.map((cmd) => {
                const globalIndex = filteredCommands.indexOf(cmd);
                const isSelected = globalIndex === selectedIndex;
                
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors ${
                      isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => onInsert(cmd)}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                  >
                    <span className="flex-shrink-0 text-muted-foreground">{cmd.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{cmd.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{cmd.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );

  return createPortal(menu, document.body);
}
