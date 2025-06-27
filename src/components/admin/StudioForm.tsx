
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

const studioSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  price_per_hour: z.number().min(1, 'Price must be greater than 0'),
  amenities: z.array(z.string()).optional(),
});

type StudioFormData = z.infer<typeof studioSchema>;

interface StudioFormProps {
  onSubmit: (data: StudioFormData) => void;
  initialData?: Partial<StudioFormData>;
  isLoading?: boolean;
}

const StudioForm = ({ onSubmit, initialData, isLoading }: StudioFormProps) => {
  const [amenities, setAmenities] = React.useState<string[]>(initialData?.amenities || []);
  const [newAmenity, setNewAmenity] = React.useState('');

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

  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Studio Title</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Enter studio title"
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Enter studio description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          {...register('location')}
          placeholder="Enter studio location"
        />
        {errors.location && (
          <p className="text-sm text-red-500">{errors.location.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="price_per_hour">Price per Hour (₹)</Label>
        <Input
          id="price_per_hour"
          type="number"
          {...register('price_per_hour', { valueAsNumber: true })}
          placeholder="Enter hourly rate"
        />
        {errors.price_per_hour && (
          <p className="text-sm text-red-500">{errors.price_per_hour.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Amenities</Label>
        <div className="flex gap-2">
          <Input
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            placeholder="Add amenity"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
          />
          <Button type="button" onClick={addAmenity} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {amenities.map((amenity) => (
            <Badge key={amenity} variant="secondary" className="gap-1">
              {amenity}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => removeAmenity(amenity)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : 'Save Studio'}
      </Button>
    </form>
  );
};

export default StudioForm;
