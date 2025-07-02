
import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { toast } from 'sonner';

export const useMobileCamera = () => {
  const [isLoading, setIsLoading] = useState(false);

  const takePicture = async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      return image.dataUrl || null;
    } catch (error) {
      console.error('Error taking picture:', error);
      toast.error('Failed to take picture');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const selectFromGallery = async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      return image.dataUrl || null;
    } catch (error) {
      console.error('Error selecting image:', error);
      toast.error('Failed to select image');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    takePicture,
    selectFromGallery,
    isLoading,
  };
};
