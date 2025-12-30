import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Trash2, Play, Pause, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackVoiceRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  disabled?: boolean;
  maxDurationSeconds?: number;
}

export function FeedbackVoiceRecorder({
  onRecordingComplete,
  disabled = false,
  maxDurationSeconds = 300, // 5 minutes
}: FeedbackVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 1;
          if (newDuration >= maxDurationSeconds) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);
    } catch (err) {
      setError('Could not access microphone. Please check permissions.');
    }
  }, [maxDurationSeconds]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setIsPaused(false);
  }, []);

  const cancelRecording = useCallback(() => {
    stopRecording();
    setAudioBlob(null);
    setDuration(0);
    chunksRef.current = [];
  }, [stopRecording]);

  const playPause = useCallback(() => {
    if (!audioBlob) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(URL.createObjectURL(audioBlob));
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioBlob, isPlaying]);

  const handleSend = useCallback(() => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, duration);
      setAudioBlob(null);
      setDuration(0);
    }
  }, [audioBlob, duration, onRecordingComplete]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Recording state
  if (isRecording) {
    return (
      <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium text-red-700">
          Recording... {formatDuration(duration)}
        </span>
        <div className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={cancelRecording}
          className="h-7 text-red-600 hover:text-red-700 hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={stopRecording}
          className="h-7 bg-red-600 hover:bg-red-700"
        >
          <Square className="h-4 w-4 mr-1" />
          Stop
        </Button>
      </div>
    );
  }

  // Preview state
  if (audioBlob) {
    return (
      <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg border">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={playPause}
          className="h-7 w-7 p-0"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <div className="flex-1">
          <div className="h-2 bg-primary/20 rounded-full">
            <div className="h-full w-full bg-primary rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
        <span className="text-sm text-muted-foreground">{formatDuration(duration)}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={cancelRecording}
          className="h-7 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={handleSend}
          className="h-7"
        >
          Send
        </Button>
      </div>
    );
  }

  // Default state - show record button
  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={startRecording}
        disabled={disabled}
        className="h-8 px-2"
        title="Record voice message"
      >
        <Mic className="h-4 w-4" />
      </Button>
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
