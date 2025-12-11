import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Send, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceMessageRecorderProps {
  onSendVoice: (audioBlob: Blob, duration: number) => Promise<void>;
  disabled?: boolean;
}

export const VoiceMessageRecorder: React.FC<VoiceMessageRecorderProps> = ({
  onSendVoice,
  disabled,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSending, setIsSending] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setAudioBlob(null);
    setRecordingTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const sendVoiceMessage = useCallback(async () => {
    if (!audioBlob) {
      console.error('[VoiceMessageRecorder] No audio blob to send');
      return;
    }
    
    console.log('[VoiceMessageRecorder] Sending voice message...', {
      blobSize: audioBlob.size,
      duration: recordingTime,
      type: audioBlob.type,
    });
    
    setIsSending(true);
    try {
      await onSendVoice(audioBlob, recordingTime);
      console.log('[VoiceMessageRecorder] Voice message sent successfully');
      setAudioBlob(null);
      setRecordingTime(0);
    } catch (error) {
      console.error('[VoiceMessageRecorder] Failed to send voice message:', error);
      // Don't clear the audio so user can retry
    } finally {
      setIsSending(false);
    }
  }, [audioBlob, recordingTime, onSendVoice]);

  // Not recording, no audio - show mic button
  if (!isRecording && !audioBlob) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={startRecording}
        disabled={disabled}
        className="h-10 w-10 rounded-full hover:bg-primary/10"
      >
        <Mic className="h-5 w-5 text-muted-foreground" />
      </Button>
    );
  }

  // Recording in progress
  if (isRecording) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 rounded-full animate-pulse">
        <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
        <span className="text-sm font-medium text-destructive">{formatTime(recordingTime)}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={stopRecording}
          className="h-8 w-8 rounded-full hover:bg-destructive/20"
        >
          <Square className="h-4 w-4 fill-destructive text-destructive" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={cancelRecording}
          className="h-8 w-8 rounded-full hover:bg-destructive/20"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    );
  }

  // Has recorded audio, ready to send
  if (audioBlob) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-full">
        <audio 
          src={URL.createObjectURL(audioBlob)} 
          controls 
          className="h-8 max-w-[150px]"
        />
        <span className="text-xs text-muted-foreground">{formatTime(recordingTime)}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={cancelRecording}
          className="h-8 w-8 rounded-full"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button
          variant="default"
          size="icon"
          onClick={sendVoiceMessage}
          disabled={isSending}
          className="h-8 w-8 rounded-full"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  return null;
};
