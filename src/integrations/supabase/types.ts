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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      actions: {
        Row: {
          action: Database["public"]["Enums"]["user_action"]
          created_at: string
          id: string
          meta: Json
          recommendation_id: string
          user_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["user_action"]
          created_at?: string
          id?: string
          meta?: Json
          recommendation_id: string
          user_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["user_action"]
          created_at?: string
          id?: string
          meta?: Json
          recommendation_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          response_data: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          response_data?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          response_data?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      kalshi_events: {
        Row: {
          category: string | null
          created_at: string
          created_time: string | null
          description: string | null
          embedding: string | null
          event_json: Json
          external_event_id: string
          id: string
          keywords: string[]
          platform: string
          region: string | null
          series_ticker: string | null
          status: string | null
          strike_date: string | null
          subtitle: string | null
          tags: string[]
          title: string
          updated_at: string
          updated_time: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_time?: string | null
          description?: string | null
          embedding?: string | null
          event_json?: Json
          external_event_id: string
          id?: string
          keywords?: string[]
          platform?: string
          region?: string | null
          series_ticker?: string | null
          status?: string | null
          strike_date?: string | null
          subtitle?: string | null
          tags?: string[]
          title: string
          updated_at?: string
          updated_time?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          created_time?: string | null
          description?: string | null
          embedding?: string | null
          event_json?: Json
          external_event_id?: string
          id?: string
          keywords?: string[]
          platform?: string
          region?: string | null
          series_ticker?: string | null
          status?: string | null
          strike_date?: string | null
          subtitle?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          updated_time?: string | null
        }
        Relationships: []
      }
      market_outcomes: {
        Row: {
          created_at: string
          external_outcome_id: string | null
          id: string
          label: string
          market_id: string
          outcome_json: Json
        }
        Insert: {
          created_at?: string
          external_outcome_id?: string | null
          id?: string
          label: string
          market_id: string
          outcome_json?: Json
        }
        Update: {
          created_at?: string
          external_outcome_id?: string | null
          id?: string
          label?: string
          market_id?: string
          outcome_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "market_outcomes_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_prices: {
        Row: {
          ask: number | null
          bid: number | null
          id: string
          liquidity: number | null
          outcome_id: string
          price: number
          price_json: Json
          ts: string
        }
        Insert: {
          ask?: number | null
          bid?: number | null
          id?: string
          liquidity?: number | null
          outcome_id: string
          price: number
          price_json?: Json
          ts?: string
        }
        Update: {
          ask?: number | null
          bid?: number | null
          id?: string
          liquidity?: number | null
          outcome_id?: string
          price?: number
          price_json?: Json
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_prices_outcome_id_fkey"
            columns: ["outcome_id"]
            isOneToOne: false
            referencedRelation: "market_outcomes"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          category: string | null
          close_time: string | null
          created_at: string
          description: string | null
          embedding: string | null
          event_id: string | null
          external_market_id: string
          id: string
          is_active: boolean
          keywords: string[]
          market_json: Json
          market_type: string | null
          platform: string
          region: string | null
          resolve_time: string | null
          tags: string[]
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category?: string | null
          close_time?: string | null
          created_at?: string
          description?: string | null
          embedding?: string | null
          event_id?: string | null
          external_market_id: string
          id?: string
          is_active?: boolean
          keywords?: string[]
          market_json?: Json
          market_type?: string | null
          platform?: string
          region?: string | null
          resolve_time?: string | null
          tags?: string[]
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string | null
          close_time?: string | null
          created_at?: string
          description?: string | null
          embedding?: string | null
          event_id?: string | null
          external_market_id?: string
          id?: string
          is_active?: boolean
          keywords?: string[]
          market_json?: Json
          market_type?: string | null
          platform?: string
          region?: string | null
          resolve_time?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "markets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "kalshi_events"
            referencedColumns: ["id"]
          },
        ]
      }
      news_event_recommendations: {
        Row: {
          created_at: string | null
          id: string
          news_event_id: string | null
          recommendation_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          news_event_id?: string | null
          recommendation_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          news_event_id?: string | null
          recommendation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_event_recommendations_news_event_id_fkey"
            columns: ["news_event_id"]
            isOneToOne: false
            referencedRelation: "news_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_event_recommendations_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      news_events: {
        Row: {
          created_at: string | null
          description: string | null
          embedding: string | null
          id: string
          importance_score: number | null
          news_json: Json | null
          processed_at: string | null
          published_at: string
          source: string | null
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          id?: string
          importance_score?: number | null
          news_json?: Json | null
          processed_at?: string | null
          published_at: string
          source?: string | null
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          id?: string
          importance_score?: number | null
          news_json?: Json | null
          processed_at?: string | null
          published_at?: string
          source?: string | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          news_event_id: string | null
          read_at: string | null
          recommendation_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          news_event_id?: string | null
          read_at?: string | null
          recommendation_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          news_event_id?: string | null
          read_at?: string | null
          recommendation_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_news_event_id_fkey"
            columns: ["news_event_id"]
            isOneToOne: false
            referencedRelation: "news_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          hedge_budget_monthly: number
          id: string
          industry: string | null
          profile_json: Json
          profile_type: Database["public"]["Enums"]["profile_type"]
          region: string
          risk_horizon: string
          risk_style: Database["public"]["Enums"]["risk_style"]
          sensitivities: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hedge_budget_monthly?: number
          id?: string
          industry?: string | null
          profile_json?: Json
          profile_type: Database["public"]["Enums"]["profile_type"]
          region: string
          risk_horizon?: string
          risk_style?: Database["public"]["Enums"]["risk_style"]
          sensitivities?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hedge_budget_monthly?: number
          id?: string
          industry?: string | null
          profile_json?: Json
          profile_type?: Database["public"]["Enums"]["profile_type"]
          region?: string
          risk_horizon?: string
          risk_style?: Database["public"]["Enums"]["risk_style"]
          sensitivities?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          created_at: string
          estimated_loss: number | null
          estimated_recovery: number | null
          event_id: string | null
          id: string
          market_id: string | null
          match_score: number
          outcome_id: string | null
          price_now: number | null
          price_threshold: number | null
          profile_id: string
          rationale: string
          rec_json: Json
          status: Database["public"]["Enums"]["recommendation_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          estimated_loss?: number | null
          estimated_recovery?: number | null
          event_id?: string | null
          id?: string
          market_id?: string | null
          match_score?: number
          outcome_id?: string | null
          price_now?: number | null
          price_threshold?: number | null
          profile_id: string
          rationale?: string
          rec_json?: Json
          status?: Database["public"]["Enums"]["recommendation_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          estimated_loss?: number | null
          estimated_recovery?: number | null
          event_id?: string | null
          id?: string
          market_id?: string | null
          match_score?: number
          outcome_id?: string | null
          price_now?: number | null
          price_threshold?: number | null
          profile_id?: string
          rationale?: string
          rec_json?: Json
          status?: Database["public"]["Enums"]["recommendation_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "kalshi_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_outcome_id_fkey"
            columns: ["outcome_id"]
            isOneToOne: false
            referencedRelation: "market_outcomes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_latest_outcome_price: {
        Row: {
          ask: number | null
          bid: number | null
          liquidity: number | null
          outcome_id: string | null
          price: number | null
          ts: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_prices_outcome_id_fkey"
            columns: ["outcome_id"]
            isOneToOne: false
            referencedRelation: "market_outcomes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      match_kalshi_events: {
        Args: { match_count?: number; query_embedding: string }
        Returns: {
          category: string
          external_event_id: string
          id: string
          similarity: number
          strike_date: string
          subtitle: string
          title: string
        }[]
      }
      search_kalshi_events_with_markets: {
        Args: {
          markets_per_event?: number
          match_count?: number
          query_embedding: string
        }
        Returns: Json
      }
    }
    Enums: {
      profile_type: "person" | "business"
      recommendation_status: "hedge_now" | "wait" | "no_recommendation"
      risk_style: "conservative" | "balanced" | "opportunistic"
      user_action: "clicked" | "dismissed" | "saved" | "executed_elsewhere"
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
      profile_type: ["person", "business"],
      recommendation_status: ["hedge_now", "wait", "no_recommendation"],
      risk_style: ["conservative", "balanced", "opportunistic"],
      user_action: ["clicked", "dismissed", "saved", "executed_elsewhere"],
    },
  },
} as const
