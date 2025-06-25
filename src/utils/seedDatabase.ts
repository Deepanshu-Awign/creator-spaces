
import { supabase } from "@/integrations/supabase/client";

export const seedSampleStudios = async () => {
  try {
    // Check if studios already exist to avoid duplicates
    const { data: existingStudios } = await supabase
      .from("studios")
      .select("id")
      .limit(1);

    if (existingStudios && existingStudios.length > 0) {
      console.log("Sample studios already exist");
      return;
    }

    // Add sample studios without host_id (they'll be null)
    const sampleStudios = [
      {
        title: "Downtown Podcast Studio",
        description: "Professional podcast recording studio with high-end equipment and acoustic treatment. Perfect for interviews, solo recordings, and collaborative projects.",
        location: "Mumbai, Maharashtra",
        price_per_hour: 250000, // 2500 rupees in paise
        amenities: ["Professional Microphones", "Audio Interface", "Headphones", "Acoustic Treatment", "Recording Software", "Soundproof Booth"],
        images: ["https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500", "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500"],
        rating: 4.8,
        total_reviews: 124,
        is_active: true
      },
      {
        title: "Creative Photography Loft",
        description: "Spacious photography studio with natural lighting and professional equipment. Ideal for portraits, product shoots, and creative sessions.",
        location: "Bangalore, Karnataka",
        price_per_hour: 320000, // 3200 rupees in paise
        amenities: ["Professional Lighting", "Multiple Backdrops", "Props Collection", "Changing Room", "High-Speed WiFi", "Editing Station"],
        images: ["https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500", "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500"],
        rating: 4.9,
        total_reviews: 89,
        is_active: true
      },
      {
        title: "Video Production House",
        description: "Complete video production setup with 4K cameras, professional lighting, and editing facilities. Perfect for commercials, interviews, and content creation.",
        location: "Delhi, NCR",
        price_per_hour: 450000, // 4500 rupees in paise
        amenities: ["4K Cameras", "Professional Lighting Kit", "Green Screen", "Editing Suite", "Audio Equipment", "Teleprompter"],
        images: ["https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=500", "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500"],
        rating: 4.7,
        total_reviews: 156,
        is_active: true
      },
      {
        title: "Music Recording Studio",
        description: "State-of-the-art music recording facility with premium instruments and mixing capabilities. Ideal for musicians, bands, and music producers.",
        location: "Chennai, Tamil Nadu",
        price_per_hour: 520000, // 5200 rupees in paise
        amenities: ["Premium Instruments", "Mixing Console", "Studio Monitors", "Vocal Booth", "Producer Services", "Mastering Suite"],
        images: ["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500", "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500"],
        rating: 4.6,
        total_reviews: 78,
        is_active: true
      },
      {
        title: "Coworking Creative Space",
        description: "Flexible creative workspace perfect for small productions and collaborative projects. Great for meetings, workshops, and brainstorming sessions.",
        location: "Pune, Maharashtra",
        price_per_hour: 180000, // 1800 rupees in paise
        amenities: ["Flexible Setup", "High-Speed WiFi", "Projector", "Whiteboard", "Coffee Station", "Meeting Rooms"],
        images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=500", "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500"],
        rating: 4.5,
        total_reviews: 92,
        is_active: true
      },
      {
        title: "Premium Photography Studio",
        description: "High-end photography studio with cyclorama wall and professional lighting setup. Perfect for fashion, commercial, and artistic photography.",
        location: "Mumbai, Maharashtra",
        price_per_hour: 380000, // 3800 rupees in paise
        amenities: ["Cyclorama Wall", "Professional Strobes", "Beauty Dish", "Softboxes", "Color Gels", "Tethering Station"],
        images: ["https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500", "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500"],
        rating: 4.9,
        total_reviews: 67,
        is_active: true
      }
    ];

    const { data, error } = await supabase
      .from("studios")
      .insert(sampleStudios);

    if (error) throw error;

    console.log("Sample studios added successfully:", data);
    return data;
  } catch (error) {
    console.error("Error seeding sample studios:", error);
    throw error;
  }
};
