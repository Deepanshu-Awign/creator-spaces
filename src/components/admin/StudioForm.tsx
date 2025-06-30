
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import GoogleMapsPicker from './GoogleMapsPicker';
import StudioImageUpload from './StudioImageUpload';
import AmenitiesChecklist from './AmenitiesChecklist';
import { supabase } from '@/integrations/supabase/client';

const studioSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price_per_hour: z.number().min(1, 'Price must be greater than 0'),
  location: z.string().min(1, 'Location is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().default('India'),
  pincode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  host_id: z.string().optional(),
});

export type StudioFormData = z.infer<typeof studioSchema>;

interface StudioFormProps {
  onSubmit: (data: StudioFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<StudioFormData>;
  submitLabel?: string;
}

const StudioForm: React.FC<StudioFormProps> = ({
  onSubmit,
  isLoading = false,
  initialData = {},
  submitLabel = 'Create Studio'
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger
  } = useForm<StudioFormData>({
    resolver: zodResolver(studioSchema),
    defaultValues: {
      title: '',
      description: '',
      price_per_hour: 0,
      location: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      latitude: undefined,
      longitude: undefined,
      amenities: [],
      images: [],
      host_id: '',
      ...initialData
    }
  });

  const watchedAmenities = watch('amenities');
  const watchedImages = watch('images');
  const watchedLocation = watch('location');
  const watchedCity = watch('city');
  const watchedState = watch('state');
  const watchedPincode = watch('pincode');
  const watchedLatitude = watch('latitude');
  const watchedLongitude = watch('longitude');

  const handleLocationSelect = (locationData: any) => {
    setValue('location', locationData.address);
    setValue('city', locationData.city);
    setValue('state', locationData.state);
    setValue('country', locationData.country);
    setValue('pincode', locationData.pincode);
    setValue('latitude', parseFloat(locationData.lat) || undefined);
    setValue('longitude', parseFloat(locationData.lng) || undefined);
    
    // Trigger validation for location fields
    trigger(['location', 'city', 'state']);
  };

  const handleFormSubmit = async (data: StudioFormData) => {
    // Ensure required location data is present
    if (!data.city || !data.state) {
      console.error('Missing required location data');
      return;
    }
    
    // Get current user to set as host_id
    const { data: { user } } = await supabase.auth.getUser();
    
    // Clean up the data - convert empty strings to null for UUID fields
    const cleanedData = {
      ...data,
      host_id: user?.id || null,
      pincode: data.pincode || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
    };
    
    console.log('Submitting studio data:', cleanedData);
    onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Studio Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter studio name"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="price_per_hour">Price per Hour *</Label>
            <Input
              id="price_per_hour"
              type="number"
              {...register('price_per_hour', { valueAsNumber: true })}
              placeholder="Enter hourly rate"
            />
            {errors.price_per_hour && (
              <p className="text-sm text-red-600 mt-1">{errors.price_per_hour.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Describe your studio..."
            rows={4}
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Location</h3>
        
        <div className="space-y-4">
          <GoogleMapsPicker
            onLocationSelect={handleLocationSelect}
            initialLocation={{
              address: watchedLocation,
              city: watchedCity,
              state: watchedState,
              pincode: watchedPincode,
              lat: watchedLatitude?.toString(),
              lng: watchedLongitude?.toString()
            }}
          />
          
          {/* Display selected location details */}
          {watchedLocation && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label>City</Label>
                <p className="text-sm text-gray-700">{watchedCity}</p>
              </div>
              <div>
                <Label>State</Label>
                <p className="text-sm text-gray-700">{watchedState}</p>
              </div>
              <div>
                <Label>Pincode</Label>
                <p className="text-sm text-gray-700">{watchedPincode || 'Not available'}</p>
              </div>
            </div>
          )}
          
          {errors.location && (
            <p className="text-sm text-red-600">{errors.location.message}</p>
          )}
          {errors.city && (
            <p className="text-sm text-red-600">{errors.city.message}</p>
          )}
          {errors.state && (
            <p className="text-sm text-red-600">{errors.state.message}</p>
          )}
        </div>
      </div>

      {/* Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Images</h3>
        <StudioImageUpload
          images={watchedImages}
          onImagesChange={(images) => setValue('images', images)}
          maxImages={5}
        />
      </div>

      {/* Amenities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Amenities</h3>
        <AmenitiesChecklist
          selectedAmenities={watchedAmenities}
          onAmenitiesChange={(amenities) => setValue('amenities', amenities)}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default StudioForm;
