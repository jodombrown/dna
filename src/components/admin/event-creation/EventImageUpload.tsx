
import React from 'react';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';

interface EventImageUploadProps {
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

const EventImageUpload: React.FC<EventImageUploadProps> = ({
  imagePreview,
  onImageChange,
  onRemoveImage
}) => {
  return (
    <div>
      <Label>Event Image</Label>
      <div className="mt-2">
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Event preview"
              className="w-32 h-32 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={onRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="text-xs text-gray-500">Upload Image</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={onImageChange}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default EventImageUpload;
