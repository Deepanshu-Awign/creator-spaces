import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, MapPin, Upload, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import GoogleMapsPicker from './GoogleMapsPicker';

const studioSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  price_per_hour: z.number().min(1, 'Price must be greater than 0'),
  amenities: z.array(z.string()).min(1, 'At least one amenity is required'),
  address: z.string().optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
});

type StudioFormData = z.infer<typeof studioSchema>;

interface StudioFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: {
    title?: string;
    description?: string;
    location?: string;
    price_per_hour?: number;
    amenities?: string[];
    images?: string[];
    is_active?: boolean;
    approval_status?: string;
    rules?: string;
    address?: string;
    lat?: string;
    lng?: string;
  };
  isLoading?: boolean;
}

const SERVICE_AMENITIES = ["Fast Wifi", "Streaming", "Post Production"];
const EQUIPMENT_AMENITIES = ["Audio", "Camera", "Lights", "Props"];
const FACILITY_AMENITIES = ["Washroom", "Tea/Coffee", "Waiting Area"];

const ALL_AMENITIES = [
  ...SERVICE_AMENITIES,
  ...EQUIPMENT_AMENITIES,
  ...FACILITY_AMENITIES
];

const StudioForm = ({ onSubmit, initialData, isLoading }: StudioFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [price, setPrice] = useState(initialData?.price_per_hour ? initialData.price_per_hour.toString() : "");
  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities || []);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialData?.images || []);
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [approvalStatus, setApprovalStatus] = useState(initialData?.approval_status || "pending");
  const [rules, setRules] = useState(initialData?.rules || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [lat, setLat] = useState(initialData?.lat || "");
  const [lng, setLng] = useState(initialData?.lng || "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<StudioFormData>({
    resolver: zodResolver(studioSchema),
    defaultValues: initialData,
  });

  React.useEffect(() => {
    setValue('amenities', amenities);
  }, [amenities, setValue]);

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setAmenities(prev => checked ? [...prev, amenity] : prev.filter(a => a !== amenity));
  };

  const validateImage = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    if (file.size > maxSize) {
      toast.error(`Image ${file.name} is too large. Maximum size is 5MB.`);
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Image ${file.name} is not supported. Please use JPG or PNG.`);
      return false;
    }
    
    return true;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate total number of images
    const totalImages = imagePreviews.length + existingImages.length + files.length;
    if (totalImages > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }
    
    // Validate each file
    const validFiles = files.filter(validateImage);
    
    setImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...validFiles.map(file => URL.createObjectURL(file))]);
  };

  const removeImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setImages(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => {
        const newPreviews = prev.filter((_, i) => i !== index);
        return newPreviews;
      });
    }
  };

  const uploadImagesToSupabase = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];
    
    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of files) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('studio-images')
          .upload(fileName, file);
        
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from('studio-images')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(publicUrl);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
      throw error;
    } finally {
      setUploadingImages(false);
    }
    
    return uploadedUrls;
  };

  const handleLocationSelect = (locationData: { address: string; lat: string; lng: string }) => {
    console.log('Location selected:', locationData);
    setAddress(locationData.address);
    setLat(locationData.lat);
    setLng(locationData.lng);
    
    // Also update the location field if it's empty
    if (!location) {
      setLocation(locationData.address);
    }
    
    toast.success('Location selected successfully');
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    
    try {
      // Validate required fields
      if (!title || !description || !location || !price || amenities.length === 0) {
        setError("Please fill all required fields and select at least one amenity.");
        return;
      }
      
      // Upload new images
      let uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        uploadedImageUrls = await uploadImagesToSupabase(images);
      }
      
      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedImageUrls];
      
      const data = {
        title,
        description,
        location,
        price_per_hour: Number(price),
        amenities,
        images: allImages,
        is_active: isActive,
        approval_status: approvalStatus,
        rules,
        address,
        lat,
        lng,
      };
      
      console.log('Submitting studio data:', data);
      await onSubmit(data);
    } catch (e) {
      setError("An error occurred while saving the studio.");
      console.error('Form submission error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmitForm} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Studio Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter studio title"
          required
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter studio description"
          rows={3}
          required
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter studio location (e.g., City, Area)"
          required
        />
        <p className="text-xs text-gray-500">
          This is the general location that will be displayed to users
        </p>
        {errors.location && (
          <p className="text-sm text-red-500">{errors.location.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Precise Address & Map Location</Label>
        <div className="flex gap-2">
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Full address will appear here after map selection"
            className="flex-1"
            readOnly
          />
          <GoogleMapsPicker
            onLocationSelect={handleLocationSelect}
            initialAddress={address}
            initialLat={lat}
            initialLng={lng}
          />
        </div>
        <p className="text-xs text-gray-500">
          Use the map picker to select the exact location of your studio
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="price_per_hour">Price per Hour (₹) *</Label>
        <Input
          id="price_per_hour"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Enter hourly rate"
          required
        />
        {errors.price_per_hour && (
          <p className="text-sm text-red-500">{errors.price_per_hour.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Amenities *</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="font-semibold mb-2 text-sm">Services</div>
            {SERVICE_AMENITIES.map(a => (
              <label key={a} className="flex items-center gap-2 text-sm mb-1">
                <input 
                  type="checkbox" 
                  checked={amenities.includes(a)} 
                  onChange={(e) => handleAmenityChange(a, e.target.checked)} 
                />
                {a}
              </label>
            ))}
          </div>
          <div>
            <div className="font-semibold mb-2 text-sm">Equipment</div>
            {EQUIPMENT_AMENITIES.map(a => (
              <label key={a} className="flex items-center gap-2 text-sm mb-1">
                <input 
                  type="checkbox" 
                  checked={amenities.includes(a)} 
                  onChange={(e) => handleAmenityChange(a, e.target.checked)} 
                />
                {a}
              </label>
            ))}
          </div>
          <div>
            <div className="font-semibold mb-2 text-sm">Facilities</div>
            {FACILITY_AMENITIES.map(a => (
              <label key={a} className="flex items-center gap-2 text-sm mb-1">
                <input 
                  type="checkbox" 
                  checked={amenities.includes(a)} 
                  onChange={(e) => handleAmenityChange(a, e.target.checked)} 
                />
                {a}
              </label>
            ))}
          </div>
        </div>
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {amenities.map(amenity => (
              <Badge key={amenity} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
          </div>
        )}
        {errors.amenities && (
          <p className="text-sm text-red-500">{errors.amenities.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Upload studio images (max 10, 5MB each, JPG/PNG)
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImages}
          >
            {uploadingImages ? 'Uploading...' : 'Choose Images'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
        
        {/* Image Previews */}
        {(imagePreviews.length > 0 || existingImages.length > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
            {/* Existing Images */}
            {existingImages.map((src, i) => (
              <div key={`existing-${i}`} className="relative group">
                <img 
                  src={src} 
                  alt={`Studio ${i + 1}`} 
                  className="w-full h-24 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i, true)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {/* New Images */}
            {imagePreviews.map((src, i) => (
              <div key={`new-${i}`} className="relative group">
                <img 
                  src={src} 
                  alt={`New ${i + 1}`} 
                  className="w-full h-24 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i, false)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Is Active</Label>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>

      <div className="space-y-2">
        <Label>Approval Status</Label>
        <Select value={approvalStatus} onValueChange={setApprovalStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Rules/Policies</Label>
        <Textarea
          id="rules"
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          rows={2}
          placeholder="e.g. No smoking, No pets, etc."
        />
      </div>

      <Button 
        type="submit" 
        disabled={submitting || isLoading || uploadingImages} 
        className="w-full"
      >
        {submitting || isLoading ? 'Saving...' : 'Save Studio'}
      </Button>
      
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </form>
  );
};

export default StudioForm;
