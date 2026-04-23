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
      activity_events: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          brief: Json | null
          created_at: string
          description: string | null
          domain: string
          employee_count: number | null
          employee_range: string | null
          funding_stage: string | null
          hq_city: string | null
          hq_country: string
          hq_state: string | null
          id: string
          industry: string | null
          linkedin_url: string | null
          name: string
          tech_stack: string[]
          total_funding: number | null
          updated_at: string
        }
        Insert: {
          brief?: Json | null
          created_at?: string
          description?: string | null
          domain: string
          employee_count?: number | null
          employee_range?: string | null
          funding_stage?: string | null
          hq_city?: string | null
          hq_country?: string
          hq_state?: string | null
          id?: string
          industry?: string | null
          linkedin_url?: string | null
          name: string
          tech_stack?: string[]
          total_funding?: number | null
          updated_at?: string
        }
        Update: {
          brief?: Json | null
          created_at?: string
          description?: string | null
          domain?: string
          employee_count?: number | null
          employee_range?: string | null
          funding_stage?: string | null
          hq_city?: string | null
          hq_country?: string
          hq_state?: string | null
          id?: string
          industry?: string | null
          linkedin_url?: string | null
          name?: string
          tech_stack?: string[]
          total_funding?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          company_id: string
          created_at: string
          email: string | null
          first_name: string
          id: string
          is_enriched: boolean
          last_name: string
          linkedin_url: string | null
          phone: string | null
          signal_context: string | null
          title: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          is_enriched?: boolean
          last_name: string
          linkedin_url?: string | null
          phone?: string | null
          signal_context?: string | null
          title?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          is_enriched?: boolean
          last_name?: string
          linkedin_url?: string | null
          phone?: string | null
          signal_context?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      monitored_accounts: {
        Row: {
          company_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitored_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_drafts: {
        Row: {
          body: string
          contact_id: string | null
          created_at: string
          id: string
          persona: Database["public"]["Enums"]["outreach_persona"]
          signal_id: string
          status: Database["public"]["Enums"]["outreach_status"]
          subject: string
          tone: Database["public"]["Enums"]["outreach_tone"]
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          contact_id?: string | null
          created_at?: string
          id?: string
          persona?: Database["public"]["Enums"]["outreach_persona"]
          signal_id: string
          status?: Database["public"]["Enums"]["outreach_status"]
          subject: string
          tone?: Database["public"]["Enums"]["outreach_tone"]
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          contact_id?: string | null
          created_at?: string
          id?: string
          persona?: Database["public"]["Enums"]["outreach_persona"]
          signal_id?: string
          status?: Database["public"]["Enums"]["outreach_status"]
          subject?: string
          tone?: Database["public"]["Enums"]["outreach_tone"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outreach_drafts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_drafts_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_sequences: {
        Row: {
          contact_id: string | null
          created_at: string
          id: string
          name: string
          signal_id: string | null
          status: Database["public"]["Enums"]["sequence_status"]
          steps: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          id?: string
          name: string
          signal_id?: string | null
          status?: Database["public"]["Enums"]["sequence_status"]
          steps?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          id?: string
          name?: string
          signal_id?: string | null
          status?: Database["public"]["Enums"]["sequence_status"]
          steps?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revealed_contacts: {
        Row: {
          contact_id: string
          created_at: string
          field: string
          id: string
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          field: string
          id?: string
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          field?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revealed_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      signals: {
        Row: {
          ai_insight: string
          company_id: string
          confidence_score: number
          created_at: string
          hiring_manager_contact_id: string | null
          id: string
          is_read: boolean
          published_at: string
          role_category: string | null
          seniority_level: Database["public"]["Enums"]["seniority_level"] | null
          signal_type: Database["public"]["Enums"]["signal_type"]
          source: Database["public"]["Enums"]["signal_source"]
          spend_categories: string[]
          status: Database["public"]["Enums"]["signal_status"]
          title: string
          vendor_suggestions: string[]
        }
        Insert: {
          ai_insight: string
          company_id: string
          confidence_score?: number
          created_at?: string
          hiring_manager_contact_id?: string | null
          id?: string
          is_read?: boolean
          published_at?: string
          role_category?: string | null
          seniority_level?:
            | Database["public"]["Enums"]["seniority_level"]
            | null
          signal_type: Database["public"]["Enums"]["signal_type"]
          source: Database["public"]["Enums"]["signal_source"]
          spend_categories?: string[]
          status?: Database["public"]["Enums"]["signal_status"]
          title: string
          vendor_suggestions?: string[]
        }
        Update: {
          ai_insight?: string
          company_id?: string
          confidence_score?: number
          created_at?: string
          hiring_manager_contact_id?: string | null
          id?: string
          is_read?: boolean
          published_at?: string
          role_category?: string | null
          seniority_level?:
            | Database["public"]["Enums"]["seniority_level"]
            | null
          signal_type?: Database["public"]["Enums"]["signal_type"]
          source?: Database["public"]["Enums"]["signal_source"]
          spend_categories?: string[]
          status?: Database["public"]["Enums"]["signal_status"]
          title?: string
          vendor_suggestions?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "signals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signals_hiring_manager_fk"
            columns: ["hiring_manager_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      territories: {
        Row: {
          email_digest: string
          employee_max: number | null
          employee_min: number | null
          funding_stages: string[]
          geographies: string[]
          industries: string[]
          min_confidence: number
          named_domains: string[]
          notify_slack: boolean
          role_categories: string[]
          signal_types: string[]
          slack_channel: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          email_digest?: string
          employee_max?: number | null
          employee_min?: number | null
          funding_stages?: string[]
          geographies?: string[]
          industries?: string[]
          min_confidence?: number
          named_domains?: string[]
          notify_slack?: boolean
          role_categories?: string[]
          signal_types?: string[]
          slack_channel?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          email_digest?: string
          employee_max?: number | null
          employee_min?: number | null
          funding_stages?: string[]
          geographies?: string[]
          industries?: string[]
          min_confidence?: number
          named_domains?: string[]
          notify_slack?: boolean
          role_categories?: string[]
          signal_types?: string[]
          slack_channel?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      outreach_persona: "AE" | "SDR" | "VP_SALES" | "AGENCY"
      outreach_status: "PENDING" | "EDITED" | "SENT"
      outreach_tone: "PROFESSIONAL" | "DIRECT" | "CASUAL" | "FOLLOWUP"
      seniority_level: "C_LEVEL" | "VP" | "DIRECTOR" | "MANAGER" | "IC"
      sequence_status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED"
      signal_source:
        | "LINKEDIN"
        | "INDEED"
        | "CRUNCHBASE"
        | "SEC_EDGAR"
        | "BUSINESS_WIRE"
        | "GOOGLE_NEWS"
        | "SEEKING_ALPHA"
        | "GREENHOUSE"
        | "LEVER"
        | "ISACA"
        | "CYBERSEEK"
      signal_status: "NEW" | "CLAIMED" | "CONVERTED" | "DISMISSED"
      signal_type:
        | "GROWTH"
        | "COMPLIANCE"
        | "TECH_EXPANSION"
        | "SALES_OPS"
        | "LEADERSHIP"
        | "FUNDING"
        | "EARNINGS"
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
      app_role: ["admin", "moderator", "user"],
      outreach_persona: ["AE", "SDR", "VP_SALES", "AGENCY"],
      outreach_status: ["PENDING", "EDITED", "SENT"],
      outreach_tone: ["PROFESSIONAL", "DIRECT", "CASUAL", "FOLLOWUP"],
      seniority_level: ["C_LEVEL", "VP", "DIRECTOR", "MANAGER", "IC"],
      sequence_status: ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"],
      signal_source: [
        "LINKEDIN",
        "INDEED",
        "CRUNCHBASE",
        "SEC_EDGAR",
        "BUSINESS_WIRE",
        "GOOGLE_NEWS",
        "SEEKING_ALPHA",
        "GREENHOUSE",
        "LEVER",
        "ISACA",
        "CYBERSEEK",
      ],
      signal_status: ["NEW", "CLAIMED", "CONVERTED", "DISMISSED"],
      signal_type: [
        "GROWTH",
        "COMPLIANCE",
        "TECH_EXPANSION",
        "SALES_OPS",
        "LEADERSHIP",
        "FUNDING",
        "EARNINGS",
      ],
    },
  },
} as const
