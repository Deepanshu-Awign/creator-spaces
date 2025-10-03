
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { toast } from 'sonner';

interface StudioImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const StudioImageUpload: React.FC<StudioImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 15
}) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, isUploading, uploadProgress } = useImageUpload();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    const newImages = [...images];

    for (const file of filesToUpload) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        continue;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        continue;
      }

      try {
        const result = await uploadImage(file);
        newImages.push(result.url);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    onImagesChange(newImages);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      <div>
        <Label>Studio Images</Label>
        <p className="text-sm text-gray-500 mt-1">
          Upload up to {maxImages} images (max 5 MB each). Drag and drop or click to select files.
        </p>
      </div>

      {/* Upload Area (always visible; disabled state when at max) */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${!canAddMore ? 'opacity-60' : ''}`}
        onDrop={canAddMore ? handleDrop : undefined}
        onDragOver={canAddMore ? handleDragOver : undefined}
        onDragLeave={canAddMore ? handleDragLeave : undefined}
        onClick={() => {
          if (canAddMore && !isUploading) fileInputRef.current?.click();
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && canAddMore && !isUploading) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-disabled={!canAddMore}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-gray-400" />
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={!canAddMore || isUploading}
            >
              {canAddMore ? 'Select Images' : 'Maximum images reached'}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              {canAddMore ? 'Or drag and drop images here' : 'Remove an image to add more'}
            </p>
          </div>
        </div>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          // Hint for mobile to use camera when available
          capture="environment"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Uploading...</span>
            <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={`Studio image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image load error:', e);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="w-3 h-3" />
              </Button>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Images Counter */}
      <div className="text-sm text-gray-500">
        {images.length} of {maxImages} images uploaded
      </div>
    </div>
  );
};

export default StudioImageUpload;
