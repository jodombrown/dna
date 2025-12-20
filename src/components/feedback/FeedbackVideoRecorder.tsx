import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Square, Trash2, Play, Pause, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackVideoRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  disabled?: boolean;
  maxDurationSeconds?: number;
}

export function FeedbackVideoRecorder({
  onRecordingComplete,
  disabled = false,
  maxDurationSeconds = 120, // 2 minutes
}: FeedbackVideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true,
      });
      streamRef.current = stream;

      // Show preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoBlob(blob);
        setIsPreviewing(true);
        stream.getTracks().forEach((track) => track.stop());

        // Set up preview video
        if (previewVideoRef.current) {
          previewVideoRef.current.src = URL.createObjectURL(blob);
        }
      };

      mediaRecorder.start(1000);
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
      console.error('Error starting video recording:', err);
      setError('Could not access camera. Please check permissions.');
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
  }, []);

  const cancelRecording = useCallback(() => {
    stopRecording();
    setVideoBlob(null);
    setIsPreviewing(false);
    setDuration(0);
    chunksRef.current = [];
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  }, [stopRecording]);

  const playPause = useCallback(() => {
    if (!previewVideoRef.current) return;

    if (isPlaying) {
      previewVideoRef.current.pause();
      setIsPlaying(false);
    } else {
      previewVideoRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleSend = useCallback(() => {
    if (videoBlob) {
      onRecordingComplete(videoBlob, duration);
      setVideoBlob(null);
      setIsPreviewing(false);
      setDuration(0);
    }
  }, [videoBlob, duration, onRecordingComplete]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Recording state
  if (isRecording) {
    return (
      <div className="space-y-2">
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-w-sm">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-600 text-white px-2 py-1 rounded text-sm">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            REC {formatDuration(duration)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={cancelRecording}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={stopRecording}
            className="bg-red-600 hover:bg-red-700"
          >
            <Square className="h-4 w-4 mr-1" />
            Stop Recording
          </Button>
        </div>
      </div>
    );
  }

  // Preview state
  if (isPreviewing && videoBlob) {
    return (
      <div className="space-y-2">
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-w-sm">
          <video
            ref={previewVideoRef}
            playsInline
            className="w-full h-full object-cover"
            onEnded={() => setIsPlaying(false)}
          />
          <button
            type="button"
            onClick={playPause}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
          >
            {isPlaying ? (
              <Pause className="h-12 w-12 text-white" />
            ) : (
              <Play className="h-12 w-12 text-white" />
            )}
          </button>
          <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
            {formatDuration(duration)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={cancelRecording}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Discard
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleSend}
          >
            Send Video
          </Button>
        </div>
      </div>
    );
  }

  // Default state
  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={startRecording}
        disabled={disabled}
        className="h-8 px-2"
        title="Record video"
      >
        <Video className="h-4 w-4" />
      </Button>
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
