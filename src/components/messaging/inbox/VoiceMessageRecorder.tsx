import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const updateWaveform = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Sample 20 bars from the frequency data
    const bars = 20;
    const step = Math.floor(dataArray.length / bars);
    const newData: number[] = [];
    
    for (let i = 0; i < bars; i++) {
      const value = dataArray[i * step] / 255;
      newData.push(value);
    }
    
    setWaveformData(newData);
    
    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    }
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio context and analyser for waveform
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
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
        
        // Generate static waveform for preview
        setWaveformData(Array(20).fill(0).map(() => 0.3 + Math.random() * 0.7));
        
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start waveform animation
      updateWaveform();

      timerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [updateWaveform]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
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
    setWaveformData([]);
    setIsPlaying(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }, []);

  const togglePreviewPlayback = useCallback(() => {
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
      setWaveformData([]);
      setIsPlaying(false);
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
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
      <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 rounded-full">
        {/* Animated recording indicator */}
        <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
        
        {/* Live Waveform */}
        <div className="flex items-center gap-[2px] h-6">
          {waveformData.map((amplitude, index) => (
            <div
              key={index}
              className="w-1 bg-destructive rounded-full transition-all duration-75"
              style={{ height: `${Math.max(20, amplitude * 100)}%` }}
            />
          ))}
        </div>
        
        <span className="text-sm font-medium text-destructive min-w-[40px]">
          {formatTime(recordingTime)}
        </span>
        
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
        {/* Play/Pause preview */}
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePreviewPlayback}
          className="h-8 w-8 rounded-full"
        >
          {isPlaying ? (
            <Square className="h-4 w-4 fill-foreground text-foreground" />
          ) : (
            <svg className="h-4 w-4 fill-foreground text-foreground" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </Button>
        
        {/* Static Waveform Preview */}
        <div className="flex items-center gap-[2px] h-6">
          {waveformData.map((amplitude, index) => (
            <div
              key={index}
              className="w-1 bg-foreground/50 rounded-full"
              style={{ height: `${Math.max(20, amplitude * 100)}%` }}
            />
          ))}
        </div>
        
        <span className="text-xs text-muted-foreground min-w-[40px]">
          {formatTime(recordingTime)}
        </span>
        
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
