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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate waveform data from audio
  const generateWaveform = useCallback(async () => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const rawData = audioBuffer.getChannelData(0);
      const samples = 40; // Number of bars in waveform
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
      setWaveformData(Array(40).fill(0).map(() => 0.3 + Math.random() * 0.7));
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
      // Show coming soon message - feature ready but API key not configured
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
    <div className={cn(
      "flex flex-col gap-2 p-2 rounded-lg min-w-[200px]",
      isOwn ? "bg-primary-foreground/10" : "bg-background/50"
    )}>
      <div className="flex items-center gap-2">
        {/* Play/Pause Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          className={cn(
            "h-10 w-10 rounded-full flex-shrink-0",
            isOwn ? "hover:bg-primary-foreground/20" : "hover:bg-muted"
          )}
        >
          {isPlaying ? (
            <Pause className={cn("h-5 w-5", isOwn ? "text-primary-foreground" : "text-foreground")} />
          ) : (
            <Play className={cn("h-5 w-5", isOwn ? "text-primary-foreground" : "text-foreground")} />
          )}
        </Button>

        <div className="flex-1 flex flex-col gap-1">
          {/* Waveform Visualization */}
          <div 
            className="relative h-8 flex items-center gap-[2px] cursor-pointer"
            onClick={handleSeek}
          >
            {waveformData.map((amplitude, index) => (
              <div
                key={index}
                className={cn(
                  "flex-1 rounded-full transition-colors",
                  index < progressIndex
                    ? (isOwn ? "bg-primary-foreground" : "bg-primary")
                    : (isOwn ? "bg-primary-foreground/30" : "bg-muted-foreground/30")
                )}
                style={{ 
                  height: `${Math.max(15, amplitude * 100)}%`,
                  minHeight: '4px'
                }}
              />
            ))}
          </div>

          {/* Time and Speed */}
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-xs",
              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {formatTime(currentTime)} / {formatTime(audioDuration)}
            </span>
            
            {/* Speed Control */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-5 px-1.5 text-xs font-medium",
                    isOwn ? "text-primary-foreground/70 hover:bg-primary-foreground/20" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {playbackSpeed}x
                </Button>
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
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1">
          {/* Transcribe Button - Coming Soon */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleTranscribe}
            disabled={!transcriptionEnabled && !transcript}
            className={cn(
              "h-7 w-7 rounded-full",
              isOwn ? "hover:bg-primary-foreground/20" : "hover:bg-muted",
              transcript && showTranscript && "bg-accent",
              !transcriptionEnabled && !transcript && "opacity-50"
            )}
            title={transcriptionEnabled || transcript ? "Transcribe" : "Transcription coming soon"}
          >
            {isTranscribing ? (
              <Loader2 className={cn("h-4 w-4 animate-spin", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")} />
            ) : (
              <FileText className={cn("h-4 w-4", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")} />
            )}
          </Button>
          
          {/* Download Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className={cn(
              "h-7 w-7 rounded-full",
              isOwn ? "hover:bg-primary-foreground/20" : "hover:bg-muted"
            )}
            title="Download"
          >
            <Download className={cn("h-4 w-4", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")} />
          </Button>
        </div>
      </div>

      {/* Transcript */}
      {showTranscript && transcript && (
        <div className={cn(
          "text-xs p-2 rounded-md mt-1",
          isOwn ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-foreground"
        )}>
          <p className="italic">"{transcript}"</p>
        </div>
      )}
    </div>
  );
};
