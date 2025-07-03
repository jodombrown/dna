
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Paperclip, X, FileText, Image, Upload } from 'lucide-react';
import { toast } from 'sonner';

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

interface FileAttachmentUploadProps {
  onAttachmentsChange: (attachments: FileAttachment[]) => void;
  attachments: FileAttachment[];
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
}

const FileAttachmentUpload: React.FC<FileAttachmentUploadProps> = ({
  onAttachmentsChange,
  attachments,
  maxFiles = 5,
  maxSizePerFile = 10
}) => {
  const { uploadImage, uploading } = useImageUpload();
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const filesArray = Array.from(files);
    
    if (attachments.length + filesArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    for (const file of filesArray) {
      if (file.size > maxSizePerFile * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is ${maxSizePerFile}MB`);
        continue;
      }

      try {
        const url = await uploadImage(file, 'user-posts');
        if (url) {
          const newAttachment: FileAttachment = {
            id: crypto.randomUUID(),
            name: file.name,
            url,
            size: file.size,
            type: file.type
          };

          onAttachmentsChange([...attachments, newAttachment]);
        }
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const removeAttachment = (attachmentId: string) => {
    onAttachmentsChange(attachments.filter(att => att.id !== attachmentId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          dragOver
            ? 'border-dna-emerald bg-dna-emerald/5'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Input
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          id="file-upload"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <div className="text-sm text-gray-600">
              <span className="font-medium text-dna-emerald">Click to upload</span> or drag and drop
            </div>
            <div className="text-xs text-gray-500">
              Max {maxFiles} files, {maxSizePerFile}MB each
            </div>
          </div>
        </label>
      </div>

      {/* Attachment List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Attachments ({attachments.length}/{maxFiles})
          </div>
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
            >
              {getFileIcon(attachment.type)}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {attachment.name}
                </div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(attachment.size)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(attachment.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="text-sm text-dna-emerald">Uploading files...</div>
      )}
    </div>
  );
};

export default FileAttachmentUpload;
