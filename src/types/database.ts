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
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_events: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          summary: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          summary: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          summary?: string
          user_id?: string
        }
        Relationships: []
      }
      application_status_history: {
        Row: {
          application_id: string
          changed_at: string
          created_at: string
          from_status: string | null
          id: string
          note: string | null
          to_status: string
          user_id: string
        }
        Insert: {
          application_id: string
          changed_at?: string
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          to_status: string
          user_id: string
        }
        Update: {
          application_id?: string
          changed_at?: string
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          to_status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applicant_reference: string | null
          application_round: string | null
          archived_at: string | null
          created_at: string
          decision_at: string | null
          decision_conditions: string | null
          fee_amount: number | null
          fee_currency_code: string | null
          fee_status: string | null
          id: string
          notes: string | null
          portal_url: string | null
          priority: number | null
          program_id: string
          response_due_at: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          applicant_reference?: string | null
          application_round?: string | null
          archived_at?: string | null
          created_at?: string
          decision_at?: string | null
          decision_conditions?: string | null
          fee_amount?: number | null
          fee_currency_code?: string | null
          fee_status?: string | null
          id?: string
          notes?: string | null
          portal_url?: string | null
          priority?: number | null
          program_id: string
          response_due_at?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          applicant_reference?: string | null
          application_round?: string | null
          archived_at?: string | null
          created_at?: string
          decision_at?: string | null
          decision_conditions?: string | null
          fee_amount?: number | null
          fee_currency_code?: string | null
          fee_status?: string | null
          id?: string
          notes?: string | null
          portal_url?: string | null
          priority?: number | null
          program_id?: string
          response_due_at?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_program_owner_fkey"
            columns: ["program_id", "user_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      deadlines: {
        Row: {
          application_id: string | null
          archived_at: string | null
          completed_at: string | null
          created_at: string
          deadline_type: string
          due_at: string
          id: string
          is_date_only: boolean | null
          is_hard_deadline: boolean | null
          last_verified_at: string | null
          notes: string | null
          program_id: string | null
          scholarship_application_id: string | null
          scholarship_id: string | null
          source_url: string | null
          timezone: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          archived_at?: string | null
          completed_at?: string | null
          created_at?: string
          deadline_type?: string
          due_at: string
          id?: string
          is_date_only?: boolean | null
          is_hard_deadline?: boolean | null
          last_verified_at?: string | null
          notes?: string | null
          program_id?: string | null
          scholarship_application_id?: string | null
          scholarship_id?: string | null
          source_url?: string | null
          timezone?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          archived_at?: string | null
          completed_at?: string | null
          created_at?: string
          deadline_type?: string
          due_at?: string
          id?: string
          is_date_only?: boolean | null
          is_hard_deadline?: boolean | null
          last_verified_at?: string | null
          notes?: string | null
          program_id?: string | null
          scholarship_application_id?: string | null
          scholarship_id?: string | null
          source_url?: string | null
          timezone?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deadlines_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deadlines_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          archived_at: string | null
          city: string | null
          country_code: string | null
          country_name: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          archived_at?: string | null
          city?: string | null
          country_code?: string | null
          country_name?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          archived_at?: string | null
          city?: string | null
          country_code?: string | null
          country_name?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          daily_digest_time: string | null
          default_offsets_minutes: number[]
          email_enabled: boolean
          in_app_enabled: boolean
          privacy_level: string
          push_enabled: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_digest_time?: string | null
          default_offsets_minutes?: number[]
          email_enabled?: boolean
          in_app_enabled?: boolean
          privacy_level?: string
          push_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_digest_time?: string | null
          default_offsets_minutes?: number[]
          email_enabled?: boolean
          in_app_enabled?: boolean
          privacy_level?: string
          push_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          expected_graduation_date: string | null
          full_name: string
          graduation_month_label: string | null
          id: string
          onboarding_completed_at: string | null
          target_intake_year: number
          theme: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expected_graduation_date?: string | null
          full_name: string
          graduation_month_label?: string | null
          id: string
          onboarding_completed_at?: string | null
          target_intake_year?: number
          theme?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expected_graduation_date?: string | null
          full_name?: string
          graduation_month_label?: string | null
          id?: string
          onboarding_completed_at?: string | null
          target_intake_year?: number
          theme?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      program_evaluations: {
        Row: {
          academic_fit: number | null
          academic_weight: number | null
          admission_feasibility: number | null
          created_at: string
          feasibility_weight: number | null
          funding_strength: number | null
          funding_weight: number | null
          id: string
          location_personal_fit: number | null
          location_weight: number | null
          notes: string | null
          program_id: string
          research_career_fit: number | null
          research_weight: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_fit?: number | null
          academic_weight?: number | null
          admission_feasibility?: number | null
          created_at?: string
          feasibility_weight?: number | null
          funding_strength?: number | null
          funding_weight?: number | null
          id?: string
          location_personal_fit?: number | null
          location_weight?: number | null
          notes?: string | null
          program_id: string
          research_career_fit?: number | null
          research_weight?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_fit?: number | null
          academic_weight?: number | null
          admission_feasibility?: number | null
          created_at?: string
          feasibility_weight?: number | null
          funding_strength?: number | null
          funding_weight?: number | null
          id?: string
          location_personal_fit?: number | null
          location_weight?: number | null
          notes?: string | null
          program_id?: string
          research_career_fit?: number | null
          research_weight?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_evaluations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          application_portal_url: string | null
          archived_at: string | null
          created_at: string
          degree_type: string | null
          delivery_mode: string | null
          department: string | null
          display_priority: number | null
          duration_months: number | null
          field: string | null
          id: string
          institution_id: string
          intake_term: string | null
          intake_year: number | null
          last_verified_at: string | null
          name: string
          program_url: string | null
          requirements_summary: string | null
          research_notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_portal_url?: string | null
          archived_at?: string | null
          created_at?: string
          degree_type?: string | null
          delivery_mode?: string | null
          department?: string | null
          display_priority?: number | null
          duration_months?: number | null
          field?: string | null
          id?: string
          institution_id: string
          intake_term?: string | null
          intake_year?: number | null
          last_verified_at?: string | null
          name: string
          program_url?: string | null
          requirements_summary?: string | null
          research_notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_portal_url?: string | null
          archived_at?: string | null
          created_at?: string
          degree_type?: string | null
          delivery_mode?: string | null
          department?: string | null
          display_priority?: number | null
          duration_months?: number | null
          field?: string | null
          id?: string
          institution_id?: string
          intake_term?: string | null
          intake_year?: number | null
          last_verified_at?: string | null
          name?: string
          program_url?: string | null
          requirements_summary?: string | null
          research_notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_institution_owner_fkey"
            columns: ["institution_id", "user_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      tasks: {
        Row: {
          application_id: string | null
          archived_at: string | null
          blocking: boolean | null
          completed_at: string | null
          created_at: string
          description: string | null
          document_id: string | null
          due_at: string | null
          essay_prompt_id: string | null
          estimated_minutes: number | null
          id: string
          priority: number | null
          program_id: string | null
          recommendation_request_id: string | null
          scholarship_application_id: string | null
          scholarship_id: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          archived_at?: string | null
          blocking?: boolean | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          document_id?: string | null
          due_at?: string | null
          essay_prompt_id?: string | null
          estimated_minutes?: number | null
          id?: string
          priority?: number | null
          program_id?: string | null
          recommendation_request_id?: string | null
          scholarship_application_id?: string | null
          scholarship_id?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          archived_at?: string | null
          blocking?: boolean | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          document_id?: string | null
          due_at?: string | null
          essay_prompt_id?: string | null
          estimated_minutes?: number | null
          id?: string
          priority?: number | null
          program_id?: string | null
          recommendation_request_id?: string | null
          scholarship_application_id?: string | null
          scholarship_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
