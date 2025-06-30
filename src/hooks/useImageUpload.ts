
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ImageUploadResult {
  url: string;
  fileName: string;
}

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file: File): Promise<ImageUploadResult> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('studio-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('studio-images')
        .getPublicUrl(fileName);

      setUploadProgress(100);
      toast.success('Image uploaded successfully!');

      return {
        url: publicUrl,
        fileName: fileName
      };
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadMultipleImages = async (files: File[]): Promise<ImageUploadResult[]> => {
    const results: ImageUploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(((i + 1) / files.length) * 100);
      
      try {
        const result = await uploadImage(file);
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Continue with other files even if one fails
      }
    }

    return results;
  };

  return {
    uploadImage,
    uploadMultipleImages,
    isUploading,
    uploadProgress
  };
};
