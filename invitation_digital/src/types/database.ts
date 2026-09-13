/**
 * Generated via Supabase MCP `generate_typescript_types` against project
 * kcmddkxpwhphyqynghsl (invitation-digital) after applying all migrations
 * in supabase/migrations/. Source of truth is the schema, not this file.
 *
 * Regenerate after any schema change:
 *   supabase gen types typescript --project-id kcmddkxpwhphyqynghsl > src/types/database.ts
 */

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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          guest_id: string | null
          id: number
          invitation_id: string
          metadata: Json
          session_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          guest_id?: string | null
          id?: never
          invitation_id: string
          metadata?: Json
          session_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          guest_id?: string | null
          id?: never
          invitation_id?: string
          metadata?: Json
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_items: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          id: string
          image_path: string
          invitation_id: string
          sort_order: number
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_path: string
          invitation_id: string
          sort_order?: number
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_path?: string
          invitation_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "gallery_items_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_accounts: {
        Row: {
          account_name: string
          account_number: string
          created_at: string
          id: string
          invitation_id: string
          logo_path: string | null
          provider_name: string
          provider_type: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          created_at?: string
          id?: string
          invitation_id: string
          logo_path?: string | null
          provider_name: string
          provider_type?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          created_at?: string
          id?: string
          invitation_id?: string
          logo_path?: string | null
          provider_name?: string
          provider_type?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_accounts_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          created_at: string
          display_name: string
          id: string
          invitation_id: string
          notes: string | null
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          invitation_id: string
          notes?: string | null
          token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          invitation_id?: string
          notes?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_events: {
        Row: {
          address: string | null
          created_at: string
          end_time: string | null
          event_date: string
          event_type: string | null
          id: string
          invitation_id: string
          livestream_url: string | null
          maps_url: string | null
          sort_order: number
          start_time: string | null
          title: string
          updated_at: string
          venue_name: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          end_time?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          invitation_id: string
          livestream_url?: string | null
          maps_url?: string | null
          sort_order?: number
          start_time?: string | null
          title: string
          updated_at?: string
          venue_name?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          end_time?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          invitation_id?: string
          livestream_url?: string | null
          maps_url?: string | null
          sort_order?: number
          start_time?: string | null
          title?: string
          updated_at?: string
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_events_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_people: {
        Row: {
          bio: string | null
          created_at: string
          father_name: string | null
          full_name: string
          id: string
          invitation_id: string
          mother_name: string | null
          nickname: string | null
          photo_path: string | null
          role: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          father_name?: string | null
          full_name: string
          id?: string
          invitation_id: string
          mother_name?: string | null
          nickname?: string | null
          photo_path?: string | null
          role: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          father_name?: string | null
          full_name?: string
          id?: string
          invitation_id?: string
          mother_name?: string | null
          nickname?: string | null
          photo_path?: string | null
          role?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_people_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_stories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_path: string | null
          invitation_id: string
          sort_order: number
          story_date: string | null
          title: string
          updated_at: string
          year_label: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          invitation_id: string
          sort_order?: number
          story_date?: string | null
          title: string
          updated_at?: string
          year_label?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          invitation_id?: string
          sort_order?: number
          story_date?: string | null
          title?: string
          updated_at?: string
          year_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_stories_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          closing_message: string | null
          cover_image_path: string | null
          created_at: string
          created_by: string | null
          event_date: string | null
          expires_at: string | null
          id: string
          music_path: string | null
          opening_message: string | null
          opening_quote: string | null
          published_at: string | null
          settings: Json
          slug: string
          status: string
          theme_id: string
          title: string
          type: string
          updated_at: string
          venue_summary: string | null
        }
        Insert: {
          closing_message?: string | null
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          event_date?: string | null
          expires_at?: string | null
          id?: string
          music_path?: string | null
          opening_message?: string | null
          opening_quote?: string | null
          published_at?: string | null
          settings?: Json
          slug: string
          status?: string
          theme_id: string
          title: string
          type: string
          updated_at?: string
          venue_summary?: string | null
        }
        Update: {
          closing_message?: string | null
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          event_date?: string | null
          expires_at?: string | null
          id?: string
          music_path?: string | null
          opening_message?: string | null
          opening_quote?: string | null
          published_at?: string | null
          settings?: Json
          slug?: string
          status?: string
          theme_id?: string
          title?: string
          type?: string
          updated_at?: string
          venue_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          attendance: string
          created_at: string
          guest_id: string | null
          guest_name: string | null
          id: string
          invitation_id: string
          updated_at: string
        }
        Insert: {
          attendance: string
          created_at?: string
          guest_id?: string | null
          guest_name?: string | null
          id?: string
          invitation_id: string
          updated_at?: string
        }
        Update: {
          attendance?: string
          created_at?: string
          guest_id?: string | null
          guest_name?: string | null
          id?: string
          invitation_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsvps_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          preview_image_path: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          preview_image_path?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          preview_image_path?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      wishes: {
        Row: {
          created_at: string
          guest_id: string | null
          guest_name: string
          id: string
          invitation_id: string
          is_visible: boolean
          message: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          guest_id?: string | null
          guest_name: string
          id?: string
          invitation_id: string
          is_visible?: boolean
          message: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          guest_id?: string | null
          guest_name?: string
          id?: string
          invitation_id?: string
          is_visible?: boolean
          message?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishes_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishes_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
