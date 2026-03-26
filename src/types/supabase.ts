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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          cache_read_tokens: number | null
          content: string
          created_at: string | null
          event_id: string | null
          id: string
          input_tokens: number | null
          insight_type: string
          is_read: boolean | null
          model_used: string
          output_tokens: number | null
          severity: string | null
          user_id: string | null
          via_batch: boolean | null
        }
        Insert: {
          cache_read_tokens?: number | null
          content: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          input_tokens?: number | null
          insight_type: string
          is_read?: boolean | null
          model_used: string
          output_tokens?: number | null
          severity?: string | null
          user_id?: string | null
          via_batch?: boolean | null
        }
        Update: {
          cache_read_tokens?: number | null
          content?: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          input_tokens?: number | null
          insight_type?: string
          is_read?: boolean | null
          model_used?: string
          output_tokens?: number | null
          severity?: string | null
          user_id?: string | null
          via_batch?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "pending_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_theses: {
        Row: {
          created_at: string | null
          id: string
          input_snapshot: Json | null
          is_bookmarked: boolean | null
          model_version: string | null
          recommendations: Json | null
          thesis_content: string | null
          thesis_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          input_snapshot?: Json | null
          is_bookmarked?: boolean | null
          model_version?: string | null
          recommendations?: Json | null
          thesis_content?: string | null
          thesis_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          input_snapshot?: Json | null
          is_bookmarked?: boolean | null
          model_version?: string | null
          recommendations?: Json | null
          thesis_content?: string | null
          thesis_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_theses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_log: {
        Row: {
          call_type: string
          created_at: string | null
          estimated_cost_inr: number | null
          estimated_input_tokens: number | null
          estimated_output_tokens: number | null
          id: string
          model_used: string
          user_id: string | null
        }
        Insert: {
          call_type: string
          created_at?: string | null
          estimated_cost_inr?: number | null
          estimated_input_tokens?: number | null
          estimated_output_tokens?: number | null
          id?: string
          model_used: string
          user_id?: string | null
        }
        Update: {
          call_type?: string
          created_at?: string | null
          estimated_cost_inr?: number | null
          estimated_input_tokens?: number | null
          estimated_output_tokens?: number | null
          id?: string
          model_used?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          alert_type: string | null
          body: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_read: boolean | null
          related_symbol: string | null
          title: string
          trigger_value: number | null
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          alert_type?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_read?: boolean | null
          related_symbol?: string | null
          title: string
          trigger_value?: number | null
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_read?: boolean | null
          related_symbol?: string | null
          title?: string
          trigger_value?: number | null
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_jobs: {
        Row: {
          batch_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          job_type: string
          status: string | null
          user_count: number
          user_ids: string[]
        }
        Insert: {
          batch_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          job_type: string
          status?: string | null
          user_count: number
          user_ids: string[]
        }
        Update: {
          batch_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          job_type?: string
          status?: string | null
          user_count?: number
          user_ids?: string[]
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          date: string | null
          description: string | null
          frequency: string | null
          id: string
          is_recurring: boolean | null
          sub_category: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          frequency?: string | null
          id?: string
          is_recurring?: boolean | null
          sub_category?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          frequency?: string | null
          id?: string
          is_recurring?: boolean | null
          sub_category?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string | null
          current_amount: number | null
          goal_type: string | null
          id: string
          is_completed: boolean | null
          name: string
          priority: number | null
          target_amount: number
          target_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_amount?: number | null
          goal_type?: string | null
          id?: string
          is_completed?: boolean | null
          name: string
          priority?: number | null
          target_amount: number
          target_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_amount?: number | null
          goal_type?: string | null
          id?: string
          is_completed?: boolean | null
          name?: string
          priority?: number | null
          target_amount?: number
          target_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      market_prices: {
        Row: {
          current_price: number
          day_change_percent: number | null
          fetched_at: string | null
          fetched_date: string | null
          id: string
          previous_close: number | null
          price_30d_ago: number | null
          price_90d_ago: number | null
          symbol: string
        }
        Insert: {
          current_price: number
          day_change_percent?: number | null
          fetched_at?: string | null
          fetched_date?: string | null
          id?: string
          previous_close?: number | null
          price_30d_ago?: number | null
          price_90d_ago?: number | null
          symbol: string
        }
        Update: {
          current_price?: number
          day_change_percent?: number | null
          fetched_at?: string | null
          fetched_date?: string | null
          id?: string
          previous_close?: number | null
          price_30d_ago?: number | null
          price_90d_ago?: number | null
          symbol?: string
        }
        Relationships: []
      }
      pending_events: {
        Row: {
          ai_processed: boolean | null
          context: Json
          created_at: string | null
          event_type: string
          id: string
          processed_at: string | null
          severity: string
          user_id: string | null
        }
        Insert: {
          ai_processed?: boolean | null
          context: Json
          created_at?: string | null
          event_type: string
          id?: string
          processed_at?: string | null
          severity: string
          user_id?: string | null
        }
        Update: {
          ai_processed?: boolean | null
          context?: Json
          created_at?: string | null
          event_type?: string
          id?: string
          processed_at?: string | null
          severity?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_holdings: {
        Row: {
          asset_type: string | null
          avg_buy_price: number | null
          current_price: number | null
          current_value: number | null
          day_change_percent: number | null
          id: string
          invested_amount: number | null
          last_updated: string | null
          name: string | null
          pnl: number | null
          pnl_percent: number | null
          previous_close: number | null
          quantity: number | null
          symbol: string | null
          user_id: string
        }
        Insert: {
          asset_type?: string | null
          avg_buy_price?: number | null
          current_price?: number | null
          current_value?: number | null
          day_change_percent?: number | null
          id?: string
          invested_amount?: number | null
          last_updated?: string | null
          name?: string | null
          pnl?: number | null
          pnl_percent?: number | null
          previous_close?: number | null
          quantity?: number | null
          symbol?: string | null
          user_id: string
        }
        Update: {
          asset_type?: string | null
          avg_buy_price?: number | null
          current_price?: number | null
          current_value?: number | null
          day_change_percent?: number | null
          id?: string
          invested_amount?: number | null
          last_updated?: string | null
          name?: string | null
          pnl?: number | null
          pnl_percent?: number | null
          previous_close?: number | null
          quantity?: number | null
          symbol?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_holdings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      real_estate_data: {
        Row: {
          city: string
          data_source: string | null
          id: string
          last_updated: string | null
          locality: string
          price_per_sqft_avg: number | null
          price_per_sqft_max: number | null
          price_per_sqft_min: number | null
          rental_yield_percent: number | null
          state: string | null
          yoy_appreciation_percent: number | null
        }
        Insert: {
          city: string
          data_source?: string | null
          id?: string
          last_updated?: string | null
          locality: string
          price_per_sqft_avg?: number | null
          price_per_sqft_max?: number | null
          price_per_sqft_min?: number | null
          rental_yield_percent?: number | null
          state?: string | null
          yoy_appreciation_percent?: number | null
        }
        Update: {
          city?: string
          data_source?: string | null
          id?: string
          last_updated?: string | null
          locality?: string
          price_per_sqft_avg?: number | null
          price_per_sqft_max?: number | null
          price_per_sqft_min?: number | null
          rental_yield_percent?: number | null
          state?: string | null
          yoy_appreciation_percent?: number | null
        }
        Relationships: []
      }
      sip_plans: {
        Row: {
          created_at: string | null
          fund_name: string
          id: string
          is_active: boolean | null
          monthly_amount: number
          scheme_code: string | null
          start_date: string | null
          step_up_percent: number | null
          target_amount: number | null
          tenure_years: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fund_name: string
          id?: string
          is_active?: boolean | null
          monthly_amount: number
          scheme_code?: string | null
          start_date?: string | null
          step_up_percent?: number | null
          target_amount?: number | null
          tenure_years?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          fund_name?: string
          id?: string
          is_active?: boolean | null
          monthly_amount?: number
          scheme_code?: string | null
          start_date?: string | null
          step_up_percent?: number | null
          target_amount?: number | null
          tenure_years?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sip_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sip_schedules: {
        Row: {
          created_at: string | null
          fund_name: string
          fund_symbol: string | null
          id: string
          is_active: boolean | null
          last_stepped_up_at: string | null
          monthly_amount: number
          started_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          fund_name: string
          fund_symbol?: string | null
          id?: string
          is_active?: boolean | null
          last_stepped_up_at?: string | null
          monthly_amount: number
          started_at: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          fund_name?: string
          fund_symbol?: string | null
          id?: string
          is_active?: boolean | null
          last_stepped_up_at?: string | null
          monthly_amount?: number
          started_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sip_schedules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          annual_income: number | null
          avatar_url: string | null
          city: string | null
          created_at: string | null
          date_of_birth: string | null
          full_name: string | null
          id: string
          monthly_income: number | null
          occupation: string | null
          onboarding_complete: boolean | null
          phone: string | null
          plan: string | null
          risk_profile: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          annual_income?: number | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          full_name?: string | null
          id: string
          monthly_income?: number | null
          occupation?: string | null
          onboarding_complete?: boolean | null
          phone?: string | null
          plan?: string | null
          risk_profile?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          annual_income?: number | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          full_name?: string | null
          id?: string
          monthly_income?: number | null
          occupation?: string | null
          onboarding_complete?: boolean | null
          phone?: string | null
          plan?: string | null
          risk_profile?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
  public: {
    Enums: {},
  },
} as const
