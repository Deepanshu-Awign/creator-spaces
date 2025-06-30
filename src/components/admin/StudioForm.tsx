
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
  onSuccess: () => void;
}

const StudioForm = ({ studio, onSuccess }: StudioFormProps) => {
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

  useEffect(() => {
    if (studio) {
      setFormData({
        title: studio.title || "",
        description: studio.description || "",
        location: studio.location || "",
        city: studio.city || "",
        state: studio.state || "",
        country: studio.country || "India",
        pincode: studio.pincode || "",
        price_per_hour: studio.price_per_hour?.toString() || "",
        amenities: studio.amenities || [],
        images: studio.images || [],
        latitude: studio.latitude?.toString() || "",
        longitude: studio.longitude?.toString() || "",
      });
    }
  }, [studio]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationSelect = (locationData: any) => {
    console.log('Location selected:', locationData);
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to create a studio");
      return;
    }

    setLoading(true);

    try {
      // Prepare data for submission, converting empty strings to null for UUID/numeric fields
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
        host_id: user.id, // Set host_id to current user
        is_active: true,
        approval_status: 'approved'
      };

      console.log('Submitting studio data:', submissionData);

      let result;
      if (studio?.id) {
        // Update existing studio
        result = await supabase
          .from("studios")
          .update(submissionData)
          .eq("id", studio.id)
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
      toast.success(studio?.id ? "Studio updated successfully!" : "Studio created successfully!");
      onSuccess();
    } catch (error: any) {
      console.error("Error saving studio:", error);
      toast.error(error.message || "Failed to save studio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
                      lat: parseFloat(formData.latitude),
                      lng: parseFloat(formData.longitude),
                      address: formData.location
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
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="State"
                readOnly
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
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : (studio?.id ? "Update Studio" : "Create Studio")}
        </Button>
      </div>
    </form>
  );
};

export default StudioForm;
