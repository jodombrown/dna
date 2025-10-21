import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BANNER_GRADIENTS, BannerGradientKey } from "@/lib/constants/bannerGradients";
import { Loader2, Upload, Check } from "lucide-react";

interface BannerUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentBanner: {
    type: 'gradient' | 'solid' | 'image';
    value: string;
    overlay: boolean;
  };
  onUploadComplete: () => void;
}

export function BannerUploadModal({
  open,
  onOpenChange,
  userId,
  currentBanner,
  onUploadComplete
}: BannerUploadModalProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'gradients' | 'upload'>('gradients');
  const [selectedGradient, setSelectedGradient] = useState<BannerGradientKey>(
    currentBanner.type === 'gradient' ? (currentBanner.value as BannerGradientKey) : 'dna'
  );
  const [overlay, setOverlay] = useState(currentBanner.overlay);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Error", description: "Max 10MB", variant: "destructive" });
      return;
    }

    setUploadedFile(file);
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      let bannerData: any = {
        type: selectedTab === 'gradients' ? 'gradient' : 'image',
        value: selectedTab === 'gradients' ? selectedGradient : '',
        overlay
      };

      if (selectedTab === 'upload' && uploadedFile) {
        const fileName = `${userId}/banner-${Date.now()}.${uploadedFile.name.split('.').pop()}`;

        const { error: uploadError } = await supabase.storage
          .from('banners')
          .upload(fileName, uploadedFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('banners')
          .getPublicUrl(fileName);

        bannerData.value = publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          banner_url: bannerData.type === 'image' ? bannerData.value : null,
          banner_type: bannerData.type,
          banner_gradient: bannerData.type === 'gradient' ? bannerData.value : null,
          banner_overlay: overlay
        })
        .eq('id', userId);

      if (error) throw error;

      onUploadComplete();
      toast({ title: "Success", description: "Banner updated!" });
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Your Banner</DialogTitle>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gradients">Gradient Templates</TabsTrigger>
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
          </TabsList>

          <TabsContent value="gradients" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(BANNER_GRADIENTS).map(([key, gradient]) => (
                <button
                  key={key}
                  onClick={() => setSelectedGradient(key as BannerGradientKey)}
                  className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedGradient === key 
                      ? 'border-dna-emerald ring-2 ring-dna-emerald/20' 
                      : 'border-warm-gray-200 hover:border-warm-gray-300'
                  }`}
                  style={{ background: gradient.css }}
                >
                  {selectedGradient === key && (
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                      <Check className="h-4 w-4 text-dna-emerald" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                    {gradient.name}
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="flex flex-col items-center py-12">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="banner-upload"
              />
              <label 
                htmlFor="banner-upload"
                className="cursor-pointer flex flex-col items-center gap-4 p-8 border-2 border-dashed border-warm-gray-300 rounded-lg hover:border-dna-emerald transition-colors w-full"
              >
                <Upload className="h-12 w-12 text-warm-gray-400" />
                <div className="text-center">
                  <p className="font-medium">
                    {uploadedFile ? uploadedFile.name : 'Click to upload'}
                  </p>
                  <p className="text-sm text-warm-gray-600 mt-1">
                    Recommended: 1500x500px • Max 10MB
                  </p>
                </div>
              </label>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between p-4 bg-warm-gray-50 rounded-lg">
          <div>
            <Label htmlFor="overlay" className="font-medium">Add Dark Overlay</Label>
            <p className="text-sm text-warm-gray-600">Better text contrast</p>
          </div>
          <Switch id="overlay" checked={overlay} onCheckedChange={setOverlay} />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={uploading || (selectedTab === 'upload' && !uploadedFile)}
            className="bg-dna-emerald hover:bg-dna-forest"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Banner'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
