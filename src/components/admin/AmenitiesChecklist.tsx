
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const AVAILABLE_AMENITIES = [
  'WiFi',
  'Air Conditioning',
  'Parking',
  'Security Camera',
  'Sound System',
  '24x7 Access',
  'Lighting Equipment',
  'Backdrop',
  'Makeup Room',
  'Waiting Area',
  'Refreshments',
  'Equipment Storage',
  'Wheelchair Accessible',
  'Bathroom Facilities',
  'Kitchen/Pantry',
  'Reception Area',
  'Conference Table',
  'Projector',
  'Whiteboard',
  'Natural Light'
];

interface AmenitiesChecklistProps {
  selectedAmenities: string[];
  onAmenitiesChange: (amenities: string[]) => void;
}

const AmenitiesChecklist: React.FC<AmenitiesChecklistProps> = ({
  selectedAmenities,
  onAmenitiesChange
}) => {
  const handleAmenityToggle = (amenity: string, checked: boolean) => {
    if (checked) {
      onAmenitiesChange([...selectedAmenities, amenity]);
    } else {
      onAmenitiesChange(selectedAmenities.filter(a => a !== amenity));
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {AVAILABLE_AMENITIES.map((amenity) => (
          <div key={amenity} className="flex items-center space-x-2">
            <Checkbox
              id={`amenity-${amenity}`}
              checked={selectedAmenities.includes(amenity)}
              onCheckedChange={(checked) => handleAmenityToggle(amenity, checked as boolean)}
            />
            <Label
              htmlFor={`amenity-${amenity}`}
              className="text-sm font-normal cursor-pointer"
            >
              {amenity}
            </Label>
          </div>
        ))}
      </div>
      
      {selectedAmenities.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <Label className="text-sm font-medium">Selected Amenities ({selectedAmenities.length}):</Label>
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedAmenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AmenitiesChecklist;
