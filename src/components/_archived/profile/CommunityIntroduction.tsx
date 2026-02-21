import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Video, Type, Upload, Trash2, Play, Pause } from 'lucide-react';

interface CommunityIntroductionProps {
  currentIntro?: {
    intro_text?: string;
    intro_audio_url?: string;
    intro_video_url?: string;
  };
  onComplete: () => void;
  onSkip: () => void;
}

export const CommunityIntroduction: React.FC<CommunityIntroductionProps> = ({ 
  currentIntro, 
  onComplete, 
  onSkip 
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'audio' | 'video'>('text');
  const [introText, setIntroText] = useState(currentIntro?.intro_text || '');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startRecording = async (type: 'audio' | 'video') => {
    try {
      const constraints = type === 'audio' 
        ? { audio: true } 
        : { video: true, audio: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = type === 'audio' ? 'audio/webm' : 'video/webm';
        const blob = new Blob(chunks, { type: mimeType });
        
        if (type === 'audio') {
          setAudioBlob(blob);
        } else {
          setVideoBlob(blob);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Could not access microphone/camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadMedia = async (blob: Blob, type: 'audio' | 'video'): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = type === 'audio' ? 'webm' : 'mp4';
      const fileName = `${user.id}/intro_${type}_${Date.now()}.${fileExt}`;
      const bucketName = 'profile-images';

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, blob, {
          contentType: blob.type,
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let updateData: any = {};

      // Handle text intro
      if (activeTab === 'text' && introText.trim()) {
        updateData.intro_text = introText.trim();
      }

      // Handle audio upload
      if (activeTab === 'audio' && audioBlob) {
        const audioUrl = await uploadMedia(audioBlob, 'audio');
        if (audioUrl) {
          updateData.intro_audio_url = audioUrl;
        }
      }

      // Handle video upload
      if (activeTab === 'video' && videoBlob) {
        const videoUrl = await uploadMedia(videoBlob, 'video');
        if (videoUrl) {
          updateData.intro_video_url = videoUrl;
        }
      }

      if (Object.keys(updateData).length === 0) {
        toast({
          title: "No Content",
          description: "Please add some content for your introduction",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Introduction Saved!",
        description: "Your community introduction has been saved to your profile",
      });

      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your introduction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const playPreview = (blob: Blob, type: 'audio' | 'video') => {
    const url = URL.createObjectURL(blob);
    
    if (type === 'audio') {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
        audioRef.current.onended = () => setIsPlaying(false);
      }
    } else {
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.play();
        setIsPlaying(true);
        videoRef.current.onended = () => setIsPlaying(false);
      }
    }
  };

  const canSubmit = 
    (activeTab === 'text' && introText.trim()) ||
    (activeTab === 'audio' && audioBlob) ||
    (activeTab === 'video' && videoBlob);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Introduce Yourself to the DNA Community</CardTitle>
        <p className="text-muted-foreground">
          Share a quick introduction that will be visible to communities and connections
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Video
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Write a brief introduction about yourself
              </label>
              <Textarea
                placeholder="Hi, I'm [Your Name]. I'm passionate about... I'm looking to connect with..."
                value={introText}
                onChange={(e) => setIntroText(e.target.value)}
                className="min-h-32"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {introText.length}/500 characters
              </p>
            </div>
          </TabsContent>

          <TabsContent value="audio" className="space-y-4">
            <div className="text-center space-y-4">
              {!audioBlob ? (
                <div className="space-y-4">
                  <Button
                    onClick={() => isRecording ? stopRecording() : startRecording('audio')}
                    variant={isRecording ? "destructive" : "default"}
                    size="lg"
                    className="h-16 w-16 rounded-full"
                  >
                    <Mic className={`h-6 w-6 ${isRecording ? 'animate-pulse' : ''}`} />
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    {isRecording ? 'Recording... Click to stop' : 'Click to start recording (60 seconds max)'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={() => playPreview(audioBlob, 'audio')}
                      variant="outline"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      onClick={() => setAudioBlob(null)}
                      variant="outline"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Audio recorded successfully! You can preview or delete to record again.
                  </p>
                </div>
              )}
            </div>
            <audio ref={audioRef} style={{ display: 'none' }} />
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <div className="text-center space-y-4">
              {!videoBlob ? (
                <div className="space-y-4">
                  <Button
                    onClick={() => isRecording ? stopRecording() : startRecording('video')}
                    variant={isRecording ? "destructive" : "default"}
                    size="lg"
                    className="h-16 w-16 rounded-full"
                  >
                    <Video className={`h-6 w-6 ${isRecording ? 'animate-pulse' : ''}`} />
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    {isRecording ? 'Recording... Click to stop' : 'Click to start recording (60 seconds max)'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={() => playPreview(videoBlob, 'video')}
                      variant="outline"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      onClick={() => setVideoBlob(null)}
                      variant="outline"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Video recorded successfully! You can preview or delete to record again.
                  </p>
                </div>
              )}
            </div>
            <video ref={videoRef} style={{ display: 'none' }} controls />
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-1"
            disabled={isUploading}
          >
            Skip for now
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isUploading}
            className="flex-1"
          >
            {isUploading ? 'Saving...' : 'Save Introduction'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};