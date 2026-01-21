// Types de base de données pour Deno Edge Function
// Copie simplifiée des types essentiels pour l'extraction PDF

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          account_number: string | null
          display_name: string | null
          current_plan: string | null
          plan_expiry: string | null
          onboarding_completed: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          account_number?: string | null
          display_name?: string | null
          current_plan?: string | null
          plan_expiry?: string | null
          onboarding_completed?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          account_number?: string | null
          display_name?: string | null
          current_plan?: string | null
          plan_expiry?: string | null
          onboarding_completed?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      file_uploads: {
        Row: {
          id: string
          user_id: string
          filename: string
          file_path: string
          account_number: string | null
          billing_period: string | null
          invoice_number: string | null
          current_plan: string | null
          plan_expiry: string | null
          total_amount: number | null
          processed: boolean | null
          processed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          file_path: string
          account_number?: string | null
          billing_period?: string | null
          invoice_number?: string | null
          current_plan?: string | null
          plan_expiry?: string | null
          total_amount?: number | null
          processed?: boolean | null
          processed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          file_path?: string
          account_number?: string | null
          billing_period?: string | null
          invoice_number?: string | null
          current_plan?: string | null
          plan_expiry?: string | null
          total_amount?: number | null
          processed?: boolean | null
          processed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      trips: {
        Row: {
          id: string
          file_upload_id: string | null
          user_id: string
          vehicle_number: string
          user_number: string
          start_datetime: string
          end_datetime: string
          days: string | null
          hours: string | null
          time_price: number
          km: number
          km_price: number
          reservation_fee: number
          other_fee_credit: number
          description: string | null
          total_due: number
          rate_applied: string | null
          purchase_credit: number
          note: string | null
          billing_period: string | null
          invoice_number: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          file_upload_id?: string | null
          user_id: string
          vehicle_number: string
          user_number: string
          start_datetime: string
          end_datetime: string
          days?: string | null
          hours?: string | null
          time_price: number
          km: number
          km_price: number
          reservation_fee: number
          other_fee_credit: number
          description?: string | null
          total_due: number
          rate_applied?: string | null
          purchase_credit: number
          note?: string | null
          billing_period?: string | null
          invoice_number?: string | null
          created_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          file_upload_id: string | null
          user_id: string
          user_number: string
          transaction_date: string
          type: string | null
          description: string | null
          cost: number
          tps: number | null
          tvq: number | null
          total: number
          created_at: string | null
        }
        Insert: {
          id?: string
          file_upload_id?: string | null
          user_id: string
          user_number: string
          transaction_date: string
          type?: string | null
          description?: string | null
          cost: number
          tps?: number | null
          tvq?: number | null
          total: number
          created_at?: string | null
        }
      }
      balance_summary: {
        Row: {
          id: string
          file_upload_id: string | null
          user_id: string
          previous_balance: number | null
          payments: number | null
          remaining_balance: number | null
          late_interest: number | null
          trips_total: number | null
          tps: number | null
          tvq: number | null
          purchase_credits: number | null
          other_transactions: number | null
          new_period_total: number | null
          new_balance: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          file_upload_id?: string | null
          user_id: string
          previous_balance?: number | null
          payments?: number | null
          remaining_balance?: number | null
          late_interest?: number | null
          trips_total?: number | null
          tps?: number | null
          tvq?: number | null
          purchase_credits?: number | null
          other_transactions?: number | null
          new_period_total?: number | null
          new_balance?: number | null
          created_at?: string | null
        }
      }
      upload_errors: {
        Row: {
          id: string
          user_id: string | null
          file_name: string | null
          error_message: string
          error_details: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          file_name?: string | null
          error_message: string
          error_details?: Json | null
          created_at?: string | null
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
