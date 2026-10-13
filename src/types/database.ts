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
          decision_type: string | null
          enrollment_deadline: string | null
          fee_amount: number | null
          fee_currency_code: string | null
          fee_status: string | null
          id: string
          notes: string | null
          offer_aid_details: string | null
          offer_amount: number | null
          offer_currency_code: string | null
          offer_financial_aid: boolean | null
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
          decision_type?: string | null
          enrollment_deadline?: string | null
          fee_amount?: number | null
          fee_currency_code?: string | null
          fee_status?: string | null
          id?: string
          notes?: string | null
          offer_aid_details?: string | null
          offer_amount?: number | null
          offer_currency_code?: string | null
          offer_financial_aid?: boolean | null
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
          decision_type?: string | null
          enrollment_deadline?: string | null
          fee_amount?: number | null
          fee_currency_code?: string | null
          fee_status?: string | null
          id?: string
          notes?: string | null
          offer_aid_details?: string | null
          offer_amount?: number | null
          offer_currency_code?: string | null
          offer_financial_aid?: boolean | null
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
      contact_interactions: {
        Row: {
          contact_id: string
          created_at: string
          happened_at: string
          id: string
          interaction_type: string
          notes: string | null
          summary: string
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          happened_at?: string
          id?: string
          interaction_type?: string
          notes?: string | null
          summary: string
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          happened_at?: string
          id?: string
          interaction_type?: string
          notes?: string | null
          summary?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_interactions_contact_owner_fkey"
            columns: ["contact_id", "user_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      contacts: {
        Row: {
          archived_at: string | null
          created_at: string
          email: string | null
          id: string
          institution: string | null
          name: string
          notes: string | null
          phone: string | null
          program_id: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          email?: string | null
          id?: string
          institution?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          program_id?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          email?: string | null
          id?: string
          institution?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          program_id?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
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
          {
            foreignKeyName: "deadlines_scholarship_application_owner_fkey"
            columns: ["scholarship_application_id", "user_id"]
            isOneToOne: false
            referencedRelation: "scholarship_applications"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "deadlines_scholarship_owner_fkey"
            columns: ["scholarship_id", "user_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      document_requirements: {
        Row: {
          application_id: string | null
          created_at: string
          document_type: string
          due_at: string | null
          id: string
          is_required: boolean | null
          notes: string | null
          requirement_name: string
          satisfied_by_version_id: string | null
          scholarship_application_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          document_type?: string
          due_at?: string | null
          id?: string
          is_required?: boolean | null
          notes?: string | null
          requirement_name: string
          satisfied_by_version_id?: string | null
          scholarship_application_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          document_type?: string
          due_at?: string | null
          id?: string
          is_required?: boolean | null
          notes?: string | null
          requirement_name?: string
          satisfied_by_version_id?: string | null
          scholarship_application_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_requirements_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_requirements_application_owner_fkey"
            columns: ["application_id", "user_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "document_requirements_satisfied_by_version_id_fkey"
            columns: ["satisfied_by_version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_requirements_scholarship_application_id_fkey"
            columns: ["scholarship_application_id"]
            isOneToOne: false
            referencedRelation: "scholarship_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_requirements_scholarship_application_owner_fkey"
            columns: ["scholarship_application_id", "user_id"]
            isOneToOne: false
            referencedRelation: "scholarship_applications"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      document_versions: {
        Row: {
          created_at: string
          document_id: string
          file_name: string
          file_size: number
          id: string
          mime_type: string
          notes: string | null
          sha256_hash: string | null
          storage_path: string
          user_id: string
          version_number: number
        }
        Insert: {
          created_at?: string
          document_id: string
          file_name: string
          file_size: number
          id?: string
          mime_type: string
          notes?: string | null
          sha256_hash?: string | null
          storage_path: string
          user_id: string
          version_number?: number
        }
        Update: {
          created_at?: string
          document_id?: string
          file_name?: string
          file_size?: number
          id?: string
          mime_type?: string
          notes?: string | null
          sha256_hash?: string | null
          storage_path?: string
          user_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_document_owner_fkey"
            columns: ["document_id", "user_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      documents: {
        Row: {
          archived_at: string | null
          created_at: string
          current_version_id: string | null
          document_type: string
          id: string
          name: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          current_version_id?: string | null
          document_type?: string
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          current_version_id?: string | null
          document_type?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      essay_prompts: {
        Row: {
          application_id: string | null
          archived_at: string | null
          character_limit: number | null
          created_at: string
          current_version_id: string | null
          id: string
          notes: string | null
          prompt_text: string | null
          scholarship_application_id: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          word_limit: number | null
        }
        Insert: {
          application_id?: string | null
          archived_at?: string | null
          character_limit?: number | null
          created_at?: string
          current_version_id?: string | null
          id?: string
          notes?: string | null
          prompt_text?: string | null
          scholarship_application_id?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          word_limit?: number | null
        }
        Update: {
          application_id?: string | null
          archived_at?: string | null
          character_limit?: number | null
          created_at?: string
          current_version_id?: string | null
          id?: string
          notes?: string | null
          prompt_text?: string | null
          scholarship_application_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          word_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "essay_prompts_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "essay_prompts_application_owner_fkey"
            columns: ["application_id", "user_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "essay_prompts_scholarship_application_id_fkey"
            columns: ["scholarship_application_id"]
            isOneToOne: false
            referencedRelation: "scholarship_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "essay_prompts_scholarship_application_owner_fkey"
            columns: ["scholarship_application_id", "user_id"]
            isOneToOne: false
            referencedRelation: "scholarship_applications"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      essay_versions: {
        Row: {
          character_count: number | null
          content: string
          created_at: string
          essay_prompt_id: string
          id: string
          notes: string | null
          user_id: string
          version_number: number
          word_count: number | null
        }
        Insert: {
          character_count?: number | null
          content?: string
          created_at?: string
          essay_prompt_id: string
          id?: string
          notes?: string | null
          user_id: string
          version_number?: number
          word_count?: number | null
        }
        Update: {
          character_count?: number | null
          content?: string
          created_at?: string
          essay_prompt_id?: string
          id?: string
          notes?: string | null
          user_id?: string
          version_number?: number
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "essay_versions_essay_prompt_id_fkey"
            columns: ["essay_prompt_id"]
            isOneToOne: false
            referencedRelation: "essay_prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "essay_versions_prompt_owner_fkey"
            columns: ["essay_prompt_id", "user_id"]
            isOneToOne: false
            referencedRelation: "essay_prompts"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          application_id: string | null
          archived_at: string | null
          category: string
          created_at: string
          currency_code: string
          description: string
          due_on: string | null
          id: string
          notes: string | null
          paid_at: string | null
          scholarship_application_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          application_id?: string | null
          archived_at?: string | null
          category?: string
          created_at?: string
          currency_code: string
          description: string
          due_on?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          scholarship_application_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          application_id?: string | null
          archived_at?: string | null
          category?: string
          created_at?: string
          currency_code?: string
          description?: string
          due_on?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          scholarship_application_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_application_owner_fkey"
            columns: ["application_id", "user_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "expenses_scholarship_application_id_fkey"
            columns: ["scholarship_application_id"]
            isOneToOne: false
            referencedRelation: "scholarship_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_scholarship_application_owner_fkey"
            columns: ["scholarship_application_id", "user_id"]
            isOneToOne: false
            referencedRelation: "scholarship_applications"
            referencedColumns: ["id", "user_id"]
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
          field_of_study: string | null
          current_qualification: string | null
          academic_institution: string | null
          career_goal: string | null
          research_interests: string[]
          preferred_countries: string[]
          target_degrees: string[]
          preferred_languages: string[]
          delivery_preferences: string[]
          funding_preference: string
          annual_tuition_budget: number | null
          budget_currency: string
          study_start_term: string
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
          field_of_study?: string | null
          current_qualification?: string | null
          academic_institution?: string | null
          career_goal?: string | null
          research_interests?: string[]
          preferred_countries?: string[]
          target_degrees?: string[]
          preferred_languages?: string[]
          delivery_preferences?: string[]
          funding_preference?: string
          annual_tuition_budget?: number | null
          budget_currency?: string
          study_start_term?: string
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
          field_of_study?: string | null
          current_qualification?: string | null
          academic_institution?: string | null
          career_goal?: string | null
          research_interests?: string[]
          preferred_countries?: string[]
          target_degrees?: string[]
          preferred_languages?: string[]
          delivery_preferences?: string[]
          funding_preference?: string
          annual_tuition_budget?: number | null
          budget_currency?: string
          study_start_term?: string
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
      program_scholarships: {
        Row: {
          compatibility_status: string
          created_at: string
          id: string
          notes: string | null
          program_id: string
          scholarship_id: string
          user_id: string
        }
        Insert: {
          compatibility_status?: string
          created_at?: string
          id?: string
          notes?: string | null
          program_id: string
          scholarship_id: string
          user_id: string
        }
        Update: {
          compatibility_status?: string
          created_at?: string
          id?: string
          notes?: string | null
          program_id?: string
          scholarship_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_scholarships_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_scholarships_program_owner_fkey"
            columns: ["program_id", "user_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "program_scholarships_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_scholarships_scholarship_owner_fkey"
            columns: ["scholarship_id", "user_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id", "user_id"]
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
      recommendation_requests: {
        Row: {
          application_id: string | null
          created_at: string
          due_at: string | null
          id: string
          notes: string | null
          recommender_id: string
          scholarship_application_id: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          notes?: string | null
          recommender_id: string
          scholarship_application_id?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          notes?: string | null
          recommender_id?: string
          scholarship_application_id?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_requests_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_requests_application_owner_fkey"
            columns: ["application_id", "user_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "recommendation_requests_recommender_id_fkey"
            columns: ["recommender_id"]
            isOneToOne: false
            referencedRelation: "recommenders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_requests_recommender_owner_fkey"
            columns: ["recommender_id", "user_id"]
            isOneToOne: false
            referencedRelation: "recommenders"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "recommendation_requests_scholarship_application_id_fkey"
            columns: ["scholarship_application_id"]
            isOneToOne: false
            referencedRelation: "scholarship_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_requests_scholarship_application_owner_fkey"
            columns: ["scholarship_application_id", "user_id"]
            isOneToOne: false
            referencedRelation: "scholarship_applications"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      recommenders: {
        Row: {
          archived_at: string | null
          created_at: string
          email: string | null
          id: string
          institution: string | null
          name: string
          notes: string | null
          relationship: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          email?: string | null
          id?: string
          institution?: string | null
          name: string
          notes?: string | null
          relationship?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          email?: string | null
          id?: string
          institution?: string | null
          name?: string
          notes?: string | null
          relationship?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scholarship_applications: {
        Row: {
          application_id: string | null
          archived_at: string | null
          award_amount: number | null
          award_currency_code: string | null
          conditions: string | null
          created_at: string
          decision_at: string | null
          id: string
          nomination_required: boolean | null
          nomination_status: string | null
          notes: string | null
          scholarship_id: string
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          archived_at?: string | null
          award_amount?: number | null
          award_currency_code?: string | null
          conditions?: string | null
          created_at?: string
          decision_at?: string | null
          id?: string
          nomination_required?: boolean | null
          nomination_status?: string | null
          notes?: string | null
          scholarship_id: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          archived_at?: string | null
          award_amount?: number | null
          award_currency_code?: string | null
          conditions?: string | null
          created_at?: string
          decision_at?: string | null
          id?: string
          nomination_required?: boolean | null
          nomination_status?: string | null
          notes?: string | null
          scholarship_id?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_applications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholarship_applications_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholarship_applications_scholarship_owner_fkey"
            columns: ["scholarship_id", "user_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      scholarships: {
        Row: {
          amount: number | null
          application_mechanism: string
          archived_at: string | null
          coverage_notes: string | null
          created_at: string
          currency_code: string | null
          display_priority: number | null
          eligibility_notes: string | null
          eligibility_status: string
          funding_type: string
          id: string
          last_verified_at: string | null
          name: string
          official_url: string | null
          provider: string | null
          service_obligation_notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          application_mechanism?: string
          archived_at?: string | null
          coverage_notes?: string | null
          created_at?: string
          currency_code?: string | null
          display_priority?: number | null
          eligibility_notes?: string | null
          eligibility_status?: string
          funding_type?: string
          id?: string
          last_verified_at?: string | null
          name: string
          official_url?: string | null
          provider?: string | null
          service_obligation_notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          application_mechanism?: string
          archived_at?: string | null
          coverage_notes?: string | null
          created_at?: string
          currency_code?: string | null
          display_priority?: number | null
          eligibility_notes?: string | null
          eligibility_status?: string
          funding_type?: string
          id?: string
          last_verified_at?: string | null
          name?: string
          official_url?: string | null
          provider?: string | null
          service_obligation_notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          {
            foreignKeyName: "tasks_scholarship_application_owner_fkey"
            columns: ["scholarship_application_id", "user_id"]
            isOneToOne: false
            referencedRelation: "scholarship_applications"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tasks_scholarship_owner_fkey"
            columns: ["scholarship_id", "user_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_application_page: { Args: { p_query?: string; p_status?: string; p_page?: number }; Returns: Json };
      get_preparation_page: { Args: { p_kind: string; p_tab?: string; p_query?: string; p_application_id?: string | null; p_page?: number }; Returns: Json };
      create_scholarship_entry: { Args: { p_input: Json }; Returns: string };
      create_essay_revision: { Args: { p_prompt_id: string; p_content: string; p_notes?: string | null }; Returns: string }
      create_document_revision: { Args: { p_document_id: string; p_file_name: string; p_mime_type: string; p_file_size: number; p_storage_path: string; p_sha256?: string | null; p_notes?: string | null }; Returns: string }
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
