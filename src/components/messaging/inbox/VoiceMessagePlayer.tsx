import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VoiceMessagePlayerProps {
  url: string;
  duration?: number;
  isOwn: boolean;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  url,
  duration = 0,
  isOwn,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generate waveform data from audio
  const generateWaveform = useCallback(async () => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const rawData = audioBuffer.getChannelData(0);
      const samples = 35; // Number of bars in waveform
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData: number[] = [];
      
      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }
      
      // Normalize
      const multiplier = Math.max(...filteredData) ** -1;
      setWaveformData(filteredData.map(n => n * multiplier));
      
      audioContext.close();
    } catch (error) {
      console.error('Error generating waveform:', error);
      // Fallback to random-ish waveform
      setWaveformData(Array(35).fill(0).map(() => 0.3 + Math.random() * 0.7));
    }
  }, [url]);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    // Generate waveform
    generateWaveform();

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [url, generateWaveform]);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || audioDuration === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * audioDuration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `voice-message-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading voice message:', error);
    }
  };

  // Transcription temporarily disabled until OPENAI_API_KEY is configured
  const transcriptionEnabled = false;
  
  const handleTranscribe = async () => {
    if (transcript) {
      setShowTranscript(!showTranscript);
      return;
    }

    if (!transcriptionEnabled) {
      return;
    }

    setIsTranscribing(true);
    try {
      const { data, error } = await supabase.functions.invoke('transcribe-voice', {
        body: { audioUrl: url },
      });

      if (error) throw error;
      
      setTranscript(data.text);
      setShowTranscript(true);
    } catch (error) {
      console.error('Error transcribing:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;
  const progressIndex = Math.floor((progress / 100) * waveformData.length);

  return (
    <div className="flex flex-col gap-1.5 min-w-[180px]">
      {/* Main Player - Clean minimal design */}
      <div 
        className="flex items-center gap-3"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Circular Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={cn(
            "h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
            "border-2",
            isOwn 
              ? "border-white/60 hover:border-white text-white" 
              : "border-foreground/40 hover:border-foreground text-foreground"
          )}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </button>

        {/* Waveform Visualization with subtle wave animation */}
        <div 
          className="relative h-6 flex items-center gap-[2px] cursor-pointer flex-1"
          onClick={handleSeek}
        >
          {waveformData.map((amplitude, index) => (
            <div
              key={index}
              className={cn(
                "w-[3px] rounded-full transition-all duration-150",
                index < progressIndex
                  ? (isOwn ? "bg-white" : "bg-foreground")
                  : (isOwn ? "bg-white/80" : "bg-foreground/50"),
                // Add subtle wave animation when not playing
                !isPlaying && "animate-waveform-idle"
              )}
              style={{ 
                height: `${Math.max(20, amplitude * 100)}%`,
                minHeight: '3px',
                animationDelay: `${index * 50}ms`
              }}
            />
          ))}
        </div>
      </div>

      {/* Time and Controls Row */}
      <div className="flex items-center justify-between px-1">
        <span className={cn(
          "text-[10px] font-medium",
          isOwn ? "text-white/70" : "text-muted-foreground"
        )}>
          {formatTime(currentTime)} / {formatTime(audioDuration)}
        </span>
        
        <div className="flex items-center gap-1">
          {/* Speed Control */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors",
                  isOwn 
                    ? "text-white/70 hover:bg-white/20" 
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {playbackSpeed}x
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-0">
              {PLAYBACK_SPEEDS.map((speed) => (
                <DropdownMenuItem
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={cn(
                    "text-xs cursor-pointer",
                    playbackSpeed === speed && "bg-accent"
                  )}
                >
                  {speed}x
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className={cn(
              "p-1 rounded transition-colors",
              isOwn 
                ? "text-white/70 hover:bg-white/20" 
                : "text-muted-foreground hover:bg-muted"
            )}
            title="Download"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Transcript */}
      {showTranscript && transcript && (
        <div className={cn(
          "text-xs p-2 rounded-md",
          isOwn ? "bg-white/20 text-white" : "bg-muted text-foreground"
        )}>
          <p className="italic">"{transcript}"</p>
        </div>
      )}
    </div>
  );
};
