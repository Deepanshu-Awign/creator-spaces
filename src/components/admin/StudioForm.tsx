import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import GoogleMapsPicker from "./GoogleMapsPicker";
import StudioImageUpload from "./StudioImageUpload";
import AmenitiesChecklist from "./AmenitiesChecklist";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STUDIO_TAGS = [
  { value: 'hot-selling', label: 'Hot Selling', color: 'bg-red-100 text-red-800' },
  { value: 'featured', label: 'Featured', color: 'bg-blue-100 text-blue-800' },
  { value: 'premium', label: 'Premium', color: 'bg-purple-100 text-purple-800' },
  { value: 'new', label: 'New', color: 'bg-green-100 text-green-800' },
  { value: 'popular', label: 'Popular', color: 'bg-orange-100 text-orange-800' },
];

interface StudioFormProps {
  studio?: any;
  onSuccess?: () => void;
  onSubmit?: (data: any) => Promise<void>;
  initialData?: any;
  isLoading?: boolean;
}

const StudioForm = ({ studio, onSuccess, onSubmit, initialData, isLoading: externalLoading }: StudioFormProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    price_per_hour: "",
    amenities: [] as string[],
    images: [] as string[],
    latitude: "",
    longitude: "",
    tags: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  // Use the studio prop or initialData for backward compatibility
  const studioData = studio || initialData;

  useEffect(() => {
    if (studioData) {
      console.log('Loading studio data into form:', studioData);
      setFormData({
        title: studioData.title || "",
        description: studioData.description || "",
        location: studioData.location || "",
        city: studioData.city || "",
        state: studioData.state || "",
        country: studioData.country || "India",
        pincode: studioData.pincode || "",
        price_per_hour: studioData.price_per_hour?.toString() || "",
        amenities: studioData.amenities || [],
        images: studioData.images || [],
        latitude: studioData.latitude?.toString() || "",
        longitude: studioData.longitude?.toString() || "",
        tags: studioData.tags || [],
      });
    }
  }, [studioData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationSelect = (locationData: any) => {
    console.log('Location selected in form:', locationData);
    
    // Clean up city name to remove "division" suffix
    const cleanCity = locationData.city?.replace(/\s+division$/i, '').trim() || '';
    
    const updatedFormData = {
      ...formData,
      location: locationData.address || '',
      city: cleanCity,
      state: locationData.state || '',
      pincode: locationData.pincode || '',
      latitude: locationData.lat?.toString() || '',
      longitude: locationData.lng?.toString() || '',
    };

    console.log('Updated form data with location:', updatedFormData);
    setFormData(updatedFormData);

    // Call onSuccess to notify parent component if needed
    if (onSuccess) {
      console.log('Calling onSuccess after location update');
      onSuccess();
    }
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
  };

  const handleAmenitiesChange = (amenities: string[]) => {
    setFormData(prev => ({
      ...prev,
      amenities
    }));
  };

  const handleTagToggle = (tagValue: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagValue)
        ? prev.tags.filter(tag => tag !== tagValue)
        : [...prev.tags, tagValue]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to create a studio");
      return;
    }

    // If external onSubmit is provided, use it (for modal usage)
    if (onSubmit) {
      const submissionData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode || null,
        price_per_hour: parseInt(formData.price_per_hour),
        amenities: formData.amenities,
        images: formData.images,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        tags: formData.tags,
        host_id: user.id,
        is_active: true,
        approval_status: 'approved'
      };
      
      console.log('Submitting form data:', submissionData);
      await onSubmit(submissionData);
      return;
    }

    // Otherwise use the original logic
    setLoading(true);

    try {
      const submissionData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode || null,
        price_per_hour: parseInt(formData.price_per_hour),
        amenities: formData.amenities,
        images: formData.images,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        tags: formData.tags,
        host_id: user.id,
        is_active: true,
        approval_status: 'approved'
      };

      console.log('Submitting studio data:', submissionData);

      let result;
      if (studioData?.id) {
        // Update existing studio
        result = await supabase
          .from("studios")
          .update(submissionData)
          .eq("id", studioData.id)
          .select()
          .single();
      } else {
        // Create new studio
        result = await supabase
          .from("studios")
          .insert([submissionData])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Supabase error:', result.error);
        throw result.error;
      }

      console.log('Studio saved successfully:', result.data);
      toast.success(studioData?.id ? "Studio updated successfully!" : "Studio created successfully!");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error saving studio:", error);
      toast.error(error.message || "Failed to save studio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isSubmitting = externalLoading || loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Studio Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter studio title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your studio..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="price_per_hour">Price per Hour (₹) *</Label>
            <Input
              id="price_per_hour"
              type="number"
              value={formData.price_per_hour}
              onChange={(e) => handleInputChange("price_per_hour", e.target.value)}
              placeholder="Enter hourly rate"
              required
            />
          </div>

          {/* Studio Tags */}
          <div>
            <Label className="mb-3 block">Studio Tags</Label>
            <div className="flex flex-wrap gap-2">
              {STUDIO_TAGS.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => handleTagToggle(tag.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    formData.tags.includes(tag.value)
                      ? `${tag.color} border-2 border-current`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
            {formData.tags.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Selected: {formData.tags.map(tag => STUDIO_TAGS.find(t => t.value === tag)?.label).join(', ')}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Location *</Label>
            <GoogleMapsPicker
              onLocationSelect={handleLocationSelect}
              initialLocation={
                formData.latitude && formData.longitude
                  ? {
                      lat: formData.latitude,
                      lng: formData.longitude,
                      address: formData.location,
                      city: formData.city,
                      state: formData.state,
                      pincode: formData.pincode
                    }
                  : undefined
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="State"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              value={formData.pincode}
              onChange={(e) => handleInputChange("pincode", e.target.value)}
              placeholder="Pincode"
            />
          </div>
        </div>
      </div>

      <div>
        <Label>Studio Images</Label>
        <StudioImageUpload
          images={formData.images}
          onImagesChange={handleImagesChange}
        />
      </div>

      <div>
        <Label>Amenities</Label>
        <AmenitiesChecklist
          selectedAmenities={formData.amenities}
          onAmenitiesChange={handleAmenitiesChange}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : (studioData?.id ? "Update Studio" : "Create Studio")}
        </Button>
      </div>
    </form>
  );
};

export default StudioForm;
