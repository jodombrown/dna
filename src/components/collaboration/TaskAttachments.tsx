import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Paperclip, Upload, X, Download, FileText } from 'lucide-react';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface TaskAttachmentsProps {
  taskId: string;
  spaceId: string;
  isLead: boolean;
}

interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string | null;
  uploaded_by: string;
  created_at: string;
  uploader?: {
    full_name: string;
    avatar_url?: string;
  };
}

export function TaskAttachments({ taskId, spaceId, isLead }: TaskAttachmentsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['task-attachments', taskId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('space_attachments')
        .select('*, uploader:profiles!uploaded_by(full_name, avatar_url)')
        .eq('attached_to_type', 'task')
        .eq('attached_to_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Attachment[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      const attachment = attachments.find(a => a.id === attachmentId);
      if (!attachment) return;

      // Delete from storage
      const { error: storageError } = await supabaseClient.storage
        .from('space-attachments')
        .remove([attachment.file_url]);

      if (storageError) throw storageError;

      // Delete metadata
      const { error } = await supabaseClient
        .from('space_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-attachments', taskId] });
      toast.success('Attachment deleted');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('Failed to delete attachment');
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Upload to storage
        const fileName = `${spaceId}/${taskId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabaseClient.storage
          .from('space-attachments')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Create metadata record
        const { error: dbError } = await supabaseClient
          .from('space_attachments')
          .insert({
            space_id: spaceId,
            attached_to_type: 'task',
            attached_to_id: taskId,
            file_name: file.name,
            file_url: fileName,
            file_size: file.size,
            file_type: file.type,
            uploaded_by: user.id,
          });

        if (dbError) throw dbError;
      }

      queryClient.invalidateQueries({ queryKey: ['task-attachments', taskId] });
      toast.success('Files uploaded successfully');
      e.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabaseClient.storage
        .from('space-attachments')
        .download(attachment.file_url);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Paperclip className="h-4 w-4" />
          <span>{attachments.length}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Attachments</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload button */}
          <div>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              id={`file-upload-${taskId}`}
            />
            <label htmlFor={`file-upload-${taskId}`}>
              <Button asChild disabled={isUploading}>
                <span className="gap-2 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  {isUploading ? 'Uploading...' : 'Upload Files'}
                </span>
              </Button>
            </label>
          </div>

          {/* Attachments list */}
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : attachments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No attachments yet
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent"
                >
                  <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{attachment.file_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(attachment.file_size)}</span>
                      <span>•</span>
                      <span>{attachment.uploader?.full_name || 'Unknown'}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(attachment.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(attachment)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {(isLead || attachment.uploaded_by === user?.id) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(attachment.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
