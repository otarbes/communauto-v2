export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
      balance_summary: {
        Row: {
          created_at: string | null
          file_upload_id: string | null
          id: string
          late_interest: number | null
          new_balance: number | null
          new_period_total: number | null
          other_transactions: number | null
          payments: number | null
          previous_balance: number | null
          purchase_credits: number | null
          remaining_balance: number | null
          tps: number | null
          trips_total: number | null
          tvq: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_upload_id?: string | null
          id?: string
          late_interest?: number | null
          new_balance?: number | null
          new_period_total?: number | null
          other_transactions?: number | null
          payments?: number | null
          previous_balance?: number | null
          purchase_credits?: number | null
          remaining_balance?: number | null
          tps?: number | null
          trips_total?: number | null
          tvq?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_upload_id?: string | null
          id?: string
          late_interest?: number | null
          new_balance?: number | null
          new_period_total?: number | null
          other_transactions?: number | null
          payments?: number | null
          previous_balance?: number | null
          purchase_credits?: number | null
          remaining_balance?: number | null
          tps?: number | null
          trips_total?: number | null
          tvq?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "balance_summary_file_upload_id_fkey"
            columns: ["file_upload_id"]
            isOneToOne: false
            referencedRelation: "file_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balance_summary_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      file_uploads: {
        Row: {
          account_number: string | null
          billing_period: string | null
          created_at: string | null
          current_plan: string | null
          file_path: string
          filename: string
          id: string
          invoice_number: string | null
          plan_expiry: string | null
          processed: boolean | null
          processed_at: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_number?: string | null
          billing_period?: string | null
          created_at?: string | null
          current_plan?: string | null
          file_path: string
          filename: string
          id?: string
          invoice_number?: string | null
          plan_expiry?: string | null
          processed?: boolean | null
          processed_at?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_number?: string | null
          billing_period?: string | null
          created_at?: string | null
          current_plan?: string | null
          file_path?: string
          filename?: string
          id?: string
          invoice_number?: string | null
          plan_expiry?: string | null
          processed?: boolean | null
          processed_at?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_uploads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriber_groups: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          main_subscriber_id: string
          subscriber_number: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          main_subscriber_id: string
          subscriber_number: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          main_subscriber_id?: string
          subscriber_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriber_groups_main_subscriber_id_fkey"
            columns: ["main_subscriber_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          created_at: string
          done: boolean | null
          id: number
          label: string | null
        }
        Insert: {
          created_at?: string
          done?: boolean | null
          id?: number
          label?: string | null
        }
        Update: {
          created_at?: string
          done?: boolean | null
          id?: number
          label?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          cost: number
          created_at: string | null
          description: string | null
          file_upload_id: string | null
          id: string
          total: number
          tps: number | null
          transaction_date: string
          tvq: number | null
          type: string | null
          user_id: string
          user_number: string
        }
        Insert: {
          cost: number
          created_at?: string | null
          description?: string | null
          file_upload_id?: string | null
          id?: string
          total: number
          tps?: number | null
          transaction_date: string
          tvq?: number | null
          type?: string | null
          user_id: string
          user_number: string
        }
        Update: {
          cost?: number
          created_at?: string | null
          description?: string | null
          file_upload_id?: string | null
          id?: string
          total?: number
          tps?: number | null
          transaction_date?: string
          tvq?: number | null
          type?: string | null
          user_id?: string
          user_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_file_upload_id_fkey"
            columns: ["file_upload_id"]
            isOneToOne: false
            referencedRelation: "file_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          billing_period: string | null
          created_at: string | null
          days: string | null
          description: string | null
          end_datetime: string
          file_upload_id: string | null
          hours: string | null
          id: string
          invoice_number: string | null
          km: number
          km_price: number
          note: string | null
          other_fee_credit: number
          purchase_credit: number
          rate_applied: string | null
          reservation_fee: number
          start_datetime: string
          time_price: number
          total_due: number
          user_id: string
          user_number: string
          vehicle_number: string
        }
        Insert: {
          billing_period?: string | null
          created_at?: string | null
          days?: string | null
          description?: string | null
          end_datetime: string
          file_upload_id?: string | null
          hours?: string | null
          id?: string
          invoice_number?: string | null
          km: number
          km_price: number
          note?: string | null
          other_fee_credit: number
          purchase_credit: number
          rate_applied?: string | null
          reservation_fee: number
          start_datetime: string
          time_price: number
          total_due: number
          user_id: string
          user_number: string
          vehicle_number: string
        }
        Update: {
          billing_period?: string | null
          created_at?: string | null
          days?: string | null
          description?: string | null
          end_datetime?: string
          file_upload_id?: string | null
          hours?: string | null
          id?: string
          invoice_number?: string | null
          km?: number
          km_price?: number
          note?: string | null
          other_fee_credit?: number
          purchase_credit?: number
          rate_applied?: string | null
          reservation_fee?: number
          start_datetime?: string
          time_price?: number
          total_due?: number
          user_id?: string
          user_number?: string
          vehicle_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_file_upload_id_fkey"
            columns: ["file_upload_id"]
            isOneToOne: false
            referencedRelation: "file_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      upload_errors: {
        Row: {
          created_at: string | null
          error_details: Json | null
          error_message: string
          file_name: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_details?: Json | null
          error_message: string
          file_name?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_details?: Json | null
          error_message?: string
          file_name?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "upload_errors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          account_number: string | null
          created_at: string | null
          current_plan: string | null
          display_name: string | null
          id: string
          onboarding_completed: boolean | null
          plan_expiry: string | null
          updated_at: string | null
        }
        Insert: {
          account_number?: string | null
          created_at?: string | null
          current_plan?: string | null
          display_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          plan_expiry?: string | null
          updated_at?: string | null
        }
        Update: {
          account_number?: string | null
          created_at?: string | null
          current_plan?: string | null
          display_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          plan_expiry?: string | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

