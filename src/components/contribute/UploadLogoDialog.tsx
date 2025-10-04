import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Loader2 } from 'lucide-react';

interface UploadLogoDialogProps {
  organization: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UploadLogoDialog: React.FC<UploadLogoDialogProps> = ({
  organization,
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('No file selected');

      const fileExt = file.name.split('.').pop();
      const filePath = `${organization.id}/logo.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(filePath);

      // Update organization with new logo URL
      const { error: updateError } = await supabase
        .from('organizations')
        .update({ logo_url: data.publicUrl })
        .eq('id', organization.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast({
        title: 'Logo updated!',
        description: 'Your organization logo has been updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setFile(null);
      setPreview(null);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload logo',
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image under 5MB',
          variant: 'destructive',
        });
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Organization Logo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="logo">Choose Image</Label>
            <Input
              id="logo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleFileChange}
              disabled={uploadMutation.isPending}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, WEBP, or SVG. Max 5MB.
            </p>
          </div>

          {preview && (
            <div className="border rounded-lg p-4 flex justify-center">
              <img
                src={preview}
                alt="Logo preview"
                className="max-h-48 max-w-full object-contain"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploadMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => uploadMutation.mutate()}
              disabled={!file || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Logo
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadLogoDialog;
