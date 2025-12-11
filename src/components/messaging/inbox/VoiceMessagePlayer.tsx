import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceMessagePlayerProps {
  url: string;
  duration?: number;
  isOwn: boolean;
}

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  url,
  duration = 0,
  isOwn,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <div className={cn(
      "flex items-center gap-3 p-2 rounded-lg min-w-[180px]",
      isOwn ? "bg-primary-foreground/10" : "bg-background/50"
    )}>
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className={cn(
          "h-10 w-10 rounded-full",
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
        {/* Waveform visualization (simplified as progress bar) */}
        <div className={cn(
          "relative h-2 rounded-full overflow-hidden",
          isOwn ? "bg-primary-foreground/20" : "bg-muted"
        )}>
          <div
            className={cn(
              "absolute left-0 top-0 h-full rounded-full transition-all",
              isOwn ? "bg-primary-foreground" : "bg-primary"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Duration */}
        <div className={cn(
          "text-xs",
          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {formatTime(currentTime)} / {formatTime(audioDuration)}
        </div>
      </div>
    </div>
  );
};
