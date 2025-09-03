export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          booking_date: string
          created_at: string
          duration_hours: number
          guest_count: number | null
          id: string
          payment_id: string | null
          payment_status: string | null
          special_requests: string | null
          start_time: string
          status: string
          studio_id: string
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          booking_date: string
          created_at?: string
          duration_hours: number
          guest_count?: number | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          special_requests?: string | null
          start_time: string
          status?: string
          studio_id: string
          total_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          booking_date?: string
          created_at?: string
          duration_hours?: number
          guest_count?: number | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          special_requests?: string | null
          start_time?: string
          status?: string
          studio_id?: string
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cs_addon_services: {
        Row: {
          created_at: string | null
          description: string | null
          duration_hours: number | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          studio_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          studio_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cs_addon_services_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "cs_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      cs_availability: {
        Row: {
          created_at: string | null
          date: string
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
          studio_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
          studio_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cs_availability_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "cs_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      cs_booking_addons: {
        Row: {
          addon_id: string
          booking_id: string
          created_at: string | null
          id: string
          price: number
          quantity: number | null
        }
        Insert: {
          addon_id: string
          booking_id: string
          created_at?: string | null
          id?: string
          price: number
          quantity?: number | null
        }
        Update: {
          addon_id?: string
          booking_id?: string
          created_at?: string | null
          id?: string
          price?: number
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cs_booking_addons_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "cs_addon_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cs_booking_addons_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "cs_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      cs_bookings: {
        Row: {
          addon_price: number | null
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          base_price: number
          booking_date: string
          created_at: string | null
          discount_amount: number | null
          duration_hours: number
          end_time: string
          guest_count: number | null
          id: string
          payment_id: string | null
          payment_status:
            | Database["public"]["Enums"]["cs_payment_status"]
            | null
          promo_code: string | null
          special_requests: string | null
          start_time: string
          status: Database["public"]["Enums"]["cs_booking_status"] | null
          studio_id: string
          total_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          addon_price?: number | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          base_price: number
          booking_date: string
          created_at?: string | null
          discount_amount?: number | null
          duration_hours: number
          end_time: string
          guest_count?: number | null
          id?: string
          payment_id?: string | null
          payment_status?:
            | Database["public"]["Enums"]["cs_payment_status"]
            | null
          promo_code?: string | null
          special_requests?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["cs_booking_status"] | null
          studio_id: string
          total_price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          addon_price?: number | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          base_price?: number
          booking_date?: string
          created_at?: string | null
          discount_amount?: number | null
          duration_hours?: number
          end_time?: string
          guest_count?: number | null
          id?: string
          payment_id?: string | null
          payment_status?:
            | Database["public"]["Enums"]["cs_payment_status"]
            | null
          promo_code?: string | null
          special_requests?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["cs_booking_status"] | null
          studio_id?: string
          total_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cs_bookings_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "cs_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      cs_favorites: {
        Row: {
          created_at: string | null
          id: string
          studio_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          studio_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          studio_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cs_favorites_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "cs_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      cs_messages: {
        Row: {
          booking_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          recipient_id: string
          sender_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          recipient_id: string
          sender_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cs_messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "cs_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      cs_payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          currency: string | null
          failure_reason: string | null
          gateway_order_id: string | null
          gateway_payment_id: string | null
          id: string
          payment_gateway: string | null
          payment_method: string | null
          status: Database["public"]["Enums"]["cs_payment_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          id?: string
          payment_gateway?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["cs_payment_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          id?: string
          payment_gateway?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["cs_payment_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cs_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "cs_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      cs_reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string | null
          host_replied_at: string | null
          host_reply: string | null
          id: string
          is_verified: boolean | null
          rating: number
          studio_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string | null
          host_replied_at?: string | null
          host_reply?: string | null
          id?: string
          is_verified?: boolean | null
          rating: number
          studio_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string | null
          host_replied_at?: string | null
          host_reply?: string | null
          id?: string
          is_verified?: boolean | null
          rating?: number
          studio_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cs_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "cs_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cs_reviews_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "cs_studios"
            referencedColumns: ["id"]
          },
        ]
      }
      cs_studios: {
        Row: {
          admin_notes: string | null
          amenities: string[] | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          city: string
          country: string | null
          created_at: string | null
          description: string | null
          equipment: string[] | null
          host_id: string
          id: string
          images: string[] | null
          is_active: boolean | null
          is_approved: boolean | null
          latitude: number | null
          location: string
          longitude: number | null
          max_capacity: number | null
          price_per_hour: number
          rating: number | null
          state: string
          studio_type: Database["public"]["Enums"]["cs_studio_type"]
          tags: string[] | null
          title: string
          total_reviews: number | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          amenities?: string[] | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          equipment?: string[] | null
          host_id: string
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_approved?: boolean | null
          latitude?: number | null
          location: string
          longitude?: number | null
          max_capacity?: number | null
          price_per_hour: number
          rating?: number | null
          state: string
          studio_type: Database["public"]["Enums"]["cs_studio_type"]
          tags?: string[] | null
          title: string
          total_reviews?: number | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          amenities?: string[] | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city?: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          equipment?: string[] | null
          host_id?: string
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_approved?: boolean | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          max_capacity?: number | null
          price_per_hour?: number
          rating?: number | null
          state?: string
          studio_type?: Database["public"]["Enums"]["cs_studio_type"]
          tags?: string[] | null
          title?: string
          total_reviews?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          studio_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          studio_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          studio_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          studio_id: string
          user_full_name: string | null
          user_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          studio_id: string
          user_full_name?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          studio_id?: string
          user_full_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      studios: {
        Row: {
          admin_notes: string | null
          amenities: string[] | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          category: Database["public"]["Enums"]["studio_category"] | null
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          host_id: string | null
          host_name: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          latitude: number | null
          location: string
          longitude: number | null
          pincode: string | null
          price_per_hour: number
          rating: number | null
          state: string | null
          tags: string[] | null
          title: string
          total_reviews: number | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          amenities?: string[] | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: Database["public"]["Enums"]["studio_category"] | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          host_id?: string | null
          host_name?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          latitude?: number | null
          location: string
          longitude?: number | null
          pincode?: string | null
          price_per_hour: number
          rating?: number | null
          state?: string | null
          tags?: string[] | null
          title: string
          total_reviews?: number | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          amenities?: string[] | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: Database["public"]["Enums"]["studio_category"] | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          host_id?: string | null
          host_name?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          pincode?: string | null
          price_per_hour?: number
          rating?: number | null
          state?: string | null
          tags?: string[] | null
          title?: string
          total_reviews?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "studios_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          category?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      log_admin_activity: {
        Args: {
          _action: string
          _details?: Json
          _target_id?: string
          _target_type?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "user"
      cs_booking_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "rejected"
      cs_payment_status: "pending" | "completed" | "failed" | "refunded"
      cs_studio_type:
        | "podcast"
        | "audio"
        | "video"
        | "photography"
        | "music"
        | "livestream"
        | "content_creation"
      studio_category:
        | "Photography"
        | "Music Recording"
        | "Podcast"
        | "Video Production"
        | "Coworking"
        | "Event Spaces"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "user"],
      cs_booking_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "rejected",
      ],
      cs_payment_status: ["pending", "completed", "failed", "refunded"],
      cs_studio_type: [
        "podcast",
        "audio",
        "video",
        "photography",
        "music",
        "livestream",
        "content_creation",
      ],
      studio_category: [
        "Photography",
        "Music Recording",
        "Podcast",
        "Video Production",
        "Coworking",
        "Event Spaces",
      ],
    },
  },
} as const
