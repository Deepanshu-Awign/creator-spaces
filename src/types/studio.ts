import { Database } from "@/integrations/supabase/types";

// Extended Studio type that includes the category field
// until the Supabase types are regenerated
export type Studio = Database['public']['Tables']['studios']['Row'] & {
  category?: string;
  profiles?: {
    full_name: string;
    email: string;
  };
};

export type StudioInsert = Database['public']['Tables']['studios']['Insert'] & {
  category?: string;
};

export type StudioUpdate = Database['public']['Tables']['studios']['Update'] & {
  category?: string;
};