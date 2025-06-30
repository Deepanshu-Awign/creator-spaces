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
  });
  const [loading, setLoading] = useState(false);

  // Use the studio prop or initialData for backward compatibility
  const studioData = studio || initialData;

  useEffect(() => {
    if (studioData) {
      console.log('Loading studio data into form:', studioData);
      const loadedData = {
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
      };
      
      console.log('Setting form data to:', loadedData);
      setFormData(loadedData);
    }
  }, [studioData]);

  const handleInputChange = (field: string, value: string) => {
    console.log(`Updating field ${field} to:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationSelect = (locationData: any) => {
    console.log('Location selected in form:', locationData);
    
    // Clean up city name to remove "division" suffix
    const cleanCity = locationData.city?.replace(/\s+division$/i, '').trim() || '';
    
    setFormData(prev => ({
      ...prev,
      location: locationData.address || '',
      city: cleanCity,
      state: locationData.state || '',
      pincode: locationData.pincode || '',
      latitude: locationData.lat?.toString() || '',
      longitude: locationData.lng?.toString() || '',
    }));

    toast.success('Location updated successfully!');
  };

  const handleImagesChange = (images: string[]) => {
    console.log('Images updated:', images);
    setFormData(prev => ({
      ...prev,
      images
    }));
  };

  const handleAmenitiesChange = (amenities: string[]) => {
    console.log('Amenities updated:', amenities);
    setFormData(prev => ({
      ...prev,
      amenities
    }));
  };

  const validateFormData = () => {
    console.log('Validating form data:', formData);

    if (!formData.title.trim()) {
      toast.error('Studio title is required');
      return false;
    }

    if (!formData.price_per_hour || parseInt(formData.price_per_hour) <= 0) {
      toast.error('Valid price per hour is required');
      return false;
    }

    if (!formData.location.trim()) {
      toast.error('Location is required. Please select a location from the map.');
      return false;
    }

    if (!formData.city.trim() || !formData.state.trim()) {
      toast.error('City and state are required. Please select a complete location.');
      return false;
    }

    if (!formData.latitude || !formData.longitude) {
      toast.error('Coordinates are required. Please select a location from the map.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started with data:', formData);
    
    if (!user) {
      toast.error("You must be logged in to create a studio");
      return;
    }

    if (!validateFormData()) {
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
        host_id: user.id,
        is_active: true,
        approval_status: 'approved'
      };
      
      console.log('Submitting form data via external onSubmit:', submissionData);
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
            {formData.location && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                <strong>Selected Location:</strong> {formData.location}
                <br />
                <strong>City:</strong> {formData.city}, <strong>State:</strong> {formData.state}
                {formData.pincode && <><br /><strong>Pincode:</strong> {formData.pincode}</>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="City"
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="State"
                required
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
