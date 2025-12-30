import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Send, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceMessageRecorderProps {
  onSendVoice: (audioBlob: Blob, duration: number) => Promise<void>;
  disabled?: boolean;
  onActiveStateChange?: (isActive: boolean) => void;
}

export const VoiceMessageRecorder: React.FC<VoiceMessageRecorderProps> = ({
  onSendVoice,
  disabled,
  onActiveStateChange,
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

  // Notify parent of active state changes
  useEffect(() => {
    const isActive = isRecording || !!audioBlob;
    onActiveStateChange?.(isActive);
  }, [isRecording, audioBlob, onActiveStateChange]);

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
      // Silent fail for recording errors
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
      return;
    }

    setIsSending(true);
    try {
      await onSendVoice(audioBlob, recordingTime);
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
      <div className="flex-1 min-w-0 max-w-full">
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-destructive/10 rounded-full">
          {/* Animated recording indicator */}
          <div className="h-2 w-2 rounded-full bg-destructive animate-pulse flex-shrink-0" />
          
          {/* Live Waveform - flexible width, limited bars */}
          <div className="flex items-center gap-[2px] h-5 flex-1 min-w-0 overflow-hidden justify-center">
            {waveformData.slice(0, 12).map((amplitude, index) => (
              <div
                key={index}
                className="w-[3px] bg-destructive rounded-full transition-all duration-75 flex-shrink-0"
                style={{ height: `${Math.max(20, amplitude * 100)}%` }}
              />
            ))}
          </div>
          
          <span className="text-xs font-medium text-destructive flex-shrink-0">
            {formatTime(recordingTime)}
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={stopRecording}
            className="h-7 w-7 rounded-full hover:bg-destructive/20 flex-shrink-0"
          >
            <Square className="h-3.5 w-3.5 fill-destructive text-destructive" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={cancelRecording}
            className="h-7 w-7 rounded-full hover:bg-destructive/20 flex-shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </div>
    );
  }

  // Has recorded audio, ready to send
  if (audioBlob) {
    return (
      <div className="flex-1 min-w-0 max-w-full">
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-muted rounded-full">
          {/* Play/Pause preview */}
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePreviewPlayback}
            className="h-7 w-7 rounded-full flex-shrink-0"
          >
            {isPlaying ? (
              <Square className="h-3.5 w-3.5 fill-foreground text-foreground" />
            ) : (
              <svg className="h-3.5 w-3.5 fill-foreground text-foreground" viewBox="0 0 24 24">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </Button>
          
          {/* Static Waveform Preview - flexible width, limited bars */}
          <div className="flex items-center gap-[2px] h-5 flex-1 min-w-0 overflow-hidden justify-center">
            {waveformData.slice(0, 12).map((amplitude, index) => (
              <div
                key={index}
                className="w-[3px] bg-foreground/50 rounded-full flex-shrink-0"
                style={{ height: `${Math.max(20, amplitude * 100)}%` }}
              />
            ))}
          </div>
          
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatTime(recordingTime)}
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={cancelRecording}
            className="h-7 w-7 rounded-full flex-shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={sendVoiceMessage}
            disabled={isSending}
            className="h-7 w-7 rounded-full flex-shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
