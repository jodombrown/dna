import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/utils/cropImage";

interface AvatarUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatarUrl?: string;
  userId: string;
  onUploadComplete: (url: string) => void;
}

export function AvatarUploadModal({
  open,
  onOpenChange,
  currentAvatarUrl,
  userId,
  onUploadComplete
}: AvatarUploadModalProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Max 5MB", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const fileName = `${userId}/avatar-${Date.now()}.png`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedBlob, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          avatar_position: { x: crop.x, y: crop.y, zoom }
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      onUploadComplete(publicUrl);
      toast({ title: "Success", description: "Avatar updated!" });
      onOpenChange(false);
      setImageSrc(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Profile Photo</DialogTitle>
        </DialogHeader>

        {!imageSrc ? (
          <div className="flex flex-col items-center py-12">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="avatar-upload"
            />
            <label 
              htmlFor="avatar-upload"
              className="cursor-pointer flex flex-col items-center gap-4 p-8 border-2 border-dashed border-warm-gray-300 rounded-lg hover:border-dna-emerald transition-colors"
            >
              <Upload className="h-12 w-12 text-warm-gray-400" />
              <div className="text-center">
                <p className="font-medium">Click to upload</p>
                <p className="text-sm text-warm-gray-600 mt-1">Max 5MB • JPG, PNG, WebP</p>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative h-96 bg-warm-gray-100 rounded-lg overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Zoom</label>
              <Slider
                value={[zoom]}
                onValueChange={([v]) => setZoom(v)}
                min={1}
                max={3}
                step={0.1}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setImageSrc(null)}>
                Choose Different
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={uploading}
                className="bg-dna-emerald hover:bg-dna-forest"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Photo'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
