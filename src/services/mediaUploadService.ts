/**
 * Media Upload Service for Messaging
 * 
 * Handles file uploads to the message-media Supabase Storage bucket.
 * Uses the existing uploadMedia pattern with messaging-specific paths.
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type { MediaItem } from '@/types/groupMessaging';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];

function sanitizeFilename(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '') || 'file';
}

export interface UploadProgress {
  status: 'validating' | 'uploading' | 'complete' | 'error';
  progress: number; // 0-100
  error?: string;
}

export const mediaUploadService = {
  /**
   * Validate a file before upload
   */
  validateFile(file: File): string | null {
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }
    if (!ALL_ALLOWED_TYPES.includes(file.type)) {
      return 'File type not supported. Please upload images, PDFs, or Office documents.';
    }
    return null;
  },

  /**
   * Check if a file is an image
   */
  isImage(file: File): boolean {
    return ALLOWED_IMAGE_TYPES.includes(file.type);
  },

  /**
   * Upload a file to message-media bucket
   */
  async uploadMessageMedia(
    file: File,
    conversationId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<MediaItem> {
    // Validate
    onProgress?.({ status: 'validating', progress: 0 });
    const validationError = this.validateFile(file);
    if (validationError) {
      onProgress?.({ status: 'error', progress: 0, error: validationError });
      throw new Error(validationError);
    }

    onProgress?.({ status: 'uploading', progress: 10 });

    // Build safe path
    const safeName = sanitizeFilename(file.name);
    const ext = safeName.split('.').pop() || 'bin';
    const baseName = safeName.replace(`.${ext}`, '');
    const filePath = `${conversationId}/${Date.now()}-${baseName}.${ext}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('message-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      logger.error('mediaUploadService', 'Upload failed', error);
      onProgress?.({ status: 'error', progress: 0, error: error.message });
      throw error;
    }

    onProgress?.({ status: 'uploading', progress: 80 });

    // Get public URL (or signed URL for private bucket)
    const { data: urlData } = supabase.storage
      .from('message-media')
      .getPublicUrl(filePath);

    onProgress?.({ status: 'complete', progress: 100 });

    const mediaItem: MediaItem = {
      url: urlData.publicUrl,
      type: this.isImage(file) ? 'image' : 'document',
      name: file.name,
      size: file.size,
      mimeType: file.type,
    };

    return mediaItem;
  },

  /**
   * Upload multiple files
   */
  async uploadMultiple(
    files: File[],
    conversationId: string,
    onProgress?: (index: number, progress: UploadProgress) => void
  ): Promise<MediaItem[]> {
    const results: MediaItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const item = await this.uploadMessageMedia(
        files[i],
        conversationId,
        (p) => onProgress?.(i, p)
      );
      results.push(item);
    }
    return results;
  },
};
