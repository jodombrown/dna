import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImagePlus, Crop, X, Move } from 'lucide-react';

interface CoverImageEditorProps {
  value?: string;
  onChange: (imageUrl: string, cropData?: CropData) => void;
  aspectRatio?: number;
}

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function CoverImageEditor({ 
  value, 
  onChange, 
  aspectRatio = 16 / 9 
}: CoverImageEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setIsOpen(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCrop = () => {
    if (imageSrc && croppedAreaPixels) {
      // For now, just pass the original image with crop data
      // In production, you'd create a cropped canvas and upload
      onChange(imageSrc, {
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
        width: croppedAreaPixels.width,
        height: croppedAreaPixels.height,
      });
      setIsOpen(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    setImageSrc(null);
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <ImagePlus className="h-4 w-4" />
        Cover Image
      </Label>
      
      {value ? (
        <div className="relative group">
          <div 
            className="w-full h-48 rounded-lg overflow-hidden bg-muted"
            style={{ aspectRatio: `${aspectRatio}` }}
          >
            <img 
              src={value} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setImageSrc(value);
                setIsOpen(true);
              }}
            >
              <Crop className="h-4 w-4 mr-1" />
              Adjust
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">Click to upload cover image</span>
          <span className="text-xs text-muted-foreground mt-1">Recommended: 1200×675 (16:9)</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crop className="h-5 w-5" />
              Crop & Position Cover Image
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative h-80 bg-muted rounded-lg overflow-hidden">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Move className="h-4 w-4" />
                Drag to reposition
              </div>
              <div className="flex items-center gap-4">
                <Label className="text-sm whitespace-nowrap">Zoom</Label>
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.1}
                  onValueChange={([val]) => setZoom(val)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleApplyCrop}>
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
