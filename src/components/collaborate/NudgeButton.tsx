import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Bell, Loader2, Send } from 'lucide-react';
import { useSendNudge } from '@/hooks/useCollaborate';
import type { NudgeTone } from '@/types/collaborate';
import { cn } from '@/lib/utils';

interface NudgeButtonProps {
  spaceId: string;
  taskId?: string;
  targetUserId: string;
  targetUserName: string;
  disabled?: boolean;
}

const TONE_OPTIONS: { value: NudgeTone; label: string; description: string }[] = [
  { 
    value: 'gentle', 
    label: 'Gentle', 
    description: 'A friendly check-in' 
  },
  { 
    value: 'checkin', 
    label: 'Check-in', 
    description: 'Request a status update' 
  },
  { 
    value: 'urgent', 
    label: 'Urgent', 
    description: 'Time-sensitive reminder' 
  },
];

const DEFAULT_MESSAGES: Record<NudgeTone, string> = {
  gentle: "Hey! Just checking in on this task. Let me know if you need any help!",
  checkin: "Hi! Could you share a quick update on where things stand with this task?",
  urgent: "This task is overdue and blocking progress. Please prioritize and update the team.",
};

export function NudgeButton({ 
  spaceId, 
  taskId, 
  targetUserId, 
  targetUserName,
  disabled 
}: NudgeButtonProps) {
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<NudgeTone>('gentle');
  const [message, setMessage] = useState(DEFAULT_MESSAGES.gentle);
  const sendNudge = useSendNudge();

  const handleToneChange = (newTone: NudgeTone) => {
    setTone(newTone);
    setMessage(DEFAULT_MESSAGES[newTone]);
  };

  const handleSend = async () => {
    try {
      await sendNudge.mutateAsync({
        space_id: spaceId,
        task_id: taskId,
        target_user_id: targetUserId,
        type: 'manual',
        tone,
        message,
      });
      setOpen(false);
      setTone('gentle');
      setMessage(DEFAULT_MESSAGES.gentle);
    } catch (error) {
      console.error('Failed to send nudge:', error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          disabled={disabled}
          className="text-muted-foreground hover:text-primary"
        >
          <Bell className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm">Nudge {targetUserName}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Send a friendly reminder about this task
            </p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Tone</Label>
            <RadioGroup value={tone} onValueChange={(v) => handleToneChange(v as NudgeTone)}>
              <div className="flex gap-2">
                {TONE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex-1 p-2 rounded-lg border cursor-pointer transition-all text-center',
                      tone === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/30'
                    )}
                  >
                    <RadioGroupItem value={option.value} className="sr-only" />
                    <span className="text-sm font-medium block">{option.label}</span>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSend}
              disabled={sendNudge.isPending || !message.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {sendNudge.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
