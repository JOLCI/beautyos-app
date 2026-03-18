// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          canceled_by_client: boolean | null
          cancellation_reason: string | null
          client_id: string | null
          company_id: string | null
          created_at: string
          date: string
          duration_minutes: number | null
          end_time: string
          id: string
          professional_id: string | null
          service_id: string | null
          service_ids: string[] | null
          start_time: string
          status: string
        }
        Insert: {
          canceled_by_client?: boolean | null
          cancellation_reason?: string | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          date: string
          duration_minutes?: number | null
          end_time: string
          id?: string
          professional_id?: string | null
          service_id?: string | null
          service_ids?: string[] | null
          start_time: string
          status?: string
        }
        Update: {
          canceled_by_client?: boolean | null
          cancellation_reason?: string | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          date?: string
          duration_minutes?: number | null
          end_time?: string
          id?: string
          professional_id?: string | null
          service_id?: string | null
          service_ids?: string[] | null
          start_time?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'appointments_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_professional_id_fkey'
            columns: ['professional_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      client_custom_prices: {
        Row: {
          client_id: string | null
          company_id: string | null
          created_at: string
          id: string
          price: number
          service_id: string | null
        }
        Insert: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          price: number
          service_id?: string | null
        }
        Update: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          price?: number
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'client_custom_prices_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'client_custom_prices_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'client_custom_prices_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      clients: {
        Row: {
          anamnesis: Json | null
          birthday: string | null
          birthday_day: number | null
          birthday_month: number | null
          company_id: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string
          special_prices: Json | null
        }
        Insert: {
          anamnesis?: Json | null
          birthday?: string | null
          birthday_day?: number | null
          birthday_month?: number | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone: string
          special_prices?: Json | null
        }
        Update: {
          anamnesis?: Json | null
          birthday?: string | null
          birthday_day?: number | null
          birthday_month?: number | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string
          special_prices?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'clients_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      commission_rules: {
        Row: {
          company_id: string | null
          created_at: string
          fixed_value: number | null
          id: string
          percentage: number | null
          professional_id: string | null
          service_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          fixed_value?: number | null
          id?: string
          percentage?: number | null
          professional_id?: string | null
          service_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          fixed_value?: number | null
          id?: string
          percentage?: number | null
          professional_id?: string | null
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'commission_rules_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'commission_rules_professional_id_fkey'
            columns: ['professional_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'commission_rules_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      commissions: {
        Row: {
          amount: number
          appointment_id: string | null
          company_id: string | null
          created_at: string
          id: string
          professional_id: string | null
          status: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          professional_id?: string | null
          status?: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          professional_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'commissions_appointment_id_fkey'
            columns: ['appointment_id']
            isOneToOne: false
            referencedRelation: 'appointments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'commissions_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'commissions_professional_id_fkey'
            columns: ['professional_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          passkey: string
          primary_color: string | null
          secondary_color: string | null
          settings: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          passkey: string
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          passkey?: string
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
        }
        Relationships: []
      }
      financial_accounts: {
        Row: {
          amount: number
          company_id: string | null
          created_at: string
          description: string
          due_date: string
          id: string
          notes: string | null
          origin: string | null
          settled_at: string | null
          status: string
          sub_type: string | null
          transaction_id: string | null
          type: string
        }
        Insert: {
          amount: number
          company_id?: string | null
          created_at?: string
          description: string
          due_date: string
          id?: string
          notes?: string | null
          origin?: string | null
          settled_at?: string | null
          status?: string
          sub_type?: string | null
          transaction_id?: string | null
          type: string
        }
        Update: {
          amount?: number
          company_id?: string | null
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          notes?: string | null
          origin?: string | null
          settled_at?: string | null
          status?: string
          sub_type?: string | null
          transaction_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'financial_accounts_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'financial_accounts_transaction_id_fkey'
            columns: ['transaction_id']
            isOneToOne: false
            referencedRelation: 'transactions'
            referencedColumns: ['id']
          },
        ]
      }
      financial_audit_logs: {
        Row: {
          action: string
          company_id: string | null
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          company_id?: string | null
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          company_id?: string | null
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'financial_audit_logs_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      inventory: {
        Row: {
          company_id: string | null
          id: string
          min_quantity: number
          quantity: number
          service_id: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          id?: string
          min_quantity?: number
          quantity?: number
          service_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          id?: string
          min_quantity?: number
          quantity?: number
          service_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'inventory_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'inventory_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      inventory_movements: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          inventory_id: string | null
          quantity: number
          reason: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          inventory_id?: string | null
          quantity: number
          reason?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          inventory_id?: string | null
          quantity?: number
          reason?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'inventory_movements_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'inventory_movements_inventory_id_fkey'
            columns: ['inventory_id']
            isOneToOne: false
            referencedRelation: 'inventory'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'inventory_movements_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      pix_gateways: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          pix_key: string
          pix_key_type: string
          provider: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          pix_key: string
          pix_key_type: string
          provider: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          pix_key?: string
          pix_key_type?: string
          provider?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pix_gateways_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          role: string
          username: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id: string
          is_active?: boolean | null
          name: string
          role?: string
          username: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          role?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      purchases: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          notes: string | null
          purchase_date: string
          quantity: number
          service_id: string | null
          supplier_id: string | null
          total_cost: number
          unit_cost: number
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          purchase_date: string
          quantity: number
          service_id?: string | null
          supplier_id?: string | null
          total_cost: number
          unit_cost: number
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          purchase_date?: string
          quantity?: number
          service_id?: string | null
          supplier_id?: string | null
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: 'purchases_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'purchases_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'purchases_supplier_id_fkey'
            columns: ['supplier_id']
            isOneToOne: false
            referencedRelation: 'suppliers'
            referencedColumns: ['id']
          },
        ]
      }
      services: {
        Row: {
          code: string
          company_id: string | null
          composite_items: Json | null
          cost_price: number | null
          created_at: string
          duration: number
          id: string
          is_active: boolean | null
          is_composite: boolean | null
          name: string
          price: number
          type: string
          unit_of_measure: string | null
        }
        Insert: {
          code: string
          company_id?: string | null
          composite_items?: Json | null
          cost_price?: number | null
          created_at?: string
          duration?: number
          id?: string
          is_active?: boolean | null
          is_composite?: boolean | null
          name: string
          price: number
          type?: string
          unit_of_measure?: string | null
        }
        Update: {
          code?: string
          company_id?: string | null
          composite_items?: Json | null
          cost_price?: number | null
          created_at?: string
          duration?: number
          id?: string
          is_active?: boolean | null
          is_composite?: boolean | null
          name?: string
          price?: number
          type?: string
          unit_of_measure?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'services_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      suppliers: {
        Row: {
          company_id: string | null
          created_at: string
          document: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'suppliers_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          company_id: string | null
          created_at: string
          description: string
          id: string
          metadata: Json | null
          payment_method: string | null
          ref_id: string | null
          settled_at: string | null
          status: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          company_id?: string | null
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          ref_id?: string | null
          settled_at?: string | null
          status?: string
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          company_id?: string | null
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          ref_id?: string | null
          settled_at?: string | null
          status?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          body: string
          company_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          template_key: string
        }
        Insert: {
          body: string
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          template_key: string
        }
        Update: {
          body?: string
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          template_key?: string
        }
        Relationships: [
          {
            foreignKeyName: 'whatsapp_templates_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_company_id: { Args: never; Returns: string }
      get_email_for_login: {
        Args: { p_company_id: string; p_username: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: appointments
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   client_id: uuid (nullable)
//   service_id: uuid (nullable)
//   professional_id: uuid (nullable)
//   date: date (not null)
//   start_time: time without time zone (not null)
//   end_time: time without time zone (not null)
//   status: text (not null, default: 'agendado'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   service_ids: _uuid (nullable, default: '{}'::uuid[])
//   duration_minutes: integer (nullable, default: 0)
//   cancellation_reason: text (nullable)
//   canceled_by_client: boolean (nullable, default: false)
// Table: client_custom_prices
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   client_id: uuid (nullable)
//   service_id: uuid (nullable)
//   price: numeric (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: clients
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   name: text (not null)
//   phone: text (not null)
//   email: text (nullable)
//   anamnesis: jsonb (nullable, default: '{}'::jsonb)
//   special_prices: jsonb (nullable, default: '{}'::jsonb)
//   is_active: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   birthday: date (nullable)
//   notes: character varying (nullable)
//   birthday_day: integer (nullable)
//   birthday_month: integer (nullable)
// Table: commission_rules
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   professional_id: uuid (nullable)
//   service_id: uuid (nullable)
//   percentage: numeric (nullable)
//   fixed_value: numeric (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: commissions
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   professional_id: uuid (nullable)
//   appointment_id: uuid (nullable)
//   amount: numeric (not null)
//   status: text (not null, default: 'pending'::text)
//   created_at: timestamp with time zone (not null, default: now())
// Table: companies
//   id: uuid (not null, default: gen_random_uuid())
//   passkey: text (not null)
//   name: text (not null)
//   settings: jsonb (nullable, default: '{}'::jsonb)
//   primary_color: text (nullable, default: '#e11d48'::text)
//   logo_url: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   secondary_color: text (nullable, default: '#ffffff'::text)
// Table: financial_accounts
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   type: text (not null)
//   sub_type: text (nullable)
//   description: text (not null)
//   amount: numeric (not null)
//   due_date: date (not null)
//   settled_at: timestamp with time zone (nullable)
//   status: text (not null, default: 'pending'::text)
//   transaction_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   origin: text (nullable, default: 'manual'::text)
//   notes: text (nullable)
// Table: financial_audit_logs
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   user_id: uuid (nullable)
//   action: text (not null)
//   table_name: text (not null)
//   record_id: uuid (not null)
//   old_values: jsonb (nullable)
//   new_values: jsonb (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: inventory
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   service_id: uuid (nullable)
//   quantity: integer (not null, default: 0)
//   min_quantity: integer (not null, default: 5)
//   updated_at: timestamp with time zone (not null, default: now())
// Table: inventory_movements
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   inventory_id: uuid (nullable)
//   type: text (not null)
//   quantity: integer (not null)
//   reason: text (nullable)
//   user_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: pix_gateways
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   name: text (not null)
//   provider: text (not null)
//   pix_key: text (not null)
//   pix_key_type: text (not null)
//   is_active: boolean (nullable, default: false)
//   notes: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: profiles
//   id: uuid (not null)
//   company_id: uuid (nullable)
//   name: text (not null)
//   username: text (not null)
//   role: text (not null, default: 'atendimento'::text)
//   is_active: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
// Table: purchases
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   supplier_id: uuid (nullable)
//   service_id: uuid (nullable)
//   quantity: integer (not null)
//   unit_cost: numeric (not null)
//   total_cost: numeric (not null)
//   purchase_date: date (not null)
//   notes: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: services
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   code: text (not null)
//   name: text (not null)
//   type: text (not null, default: 'service'::text)
//   price: numeric (not null)
//   duration: integer (not null, default: 60)
//   cost_price: numeric (nullable)
//   is_composite: boolean (nullable, default: false)
//   is_active: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   composite_items: jsonb (nullable, default: '[]'::jsonb)
//   unit_of_measure: text (nullable, default: 'UN'::text)
// Table: suppliers
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   name: text (not null)
//   document: text (nullable)
//   phone: text (nullable)
//   email: text (nullable)
//   is_active: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   notes: character varying (nullable)
// Table: transactions
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   type: text (not null)
//   amount: numeric (not null)
//   description: text (not null)
//   payment_method: text (nullable)
//   status: text (not null, default: 'completed'::text)
//   ref_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   user_id: uuid (nullable)
//   settled_at: timestamp with time zone (nullable)
//   metadata: jsonb (nullable, default: '{}'::jsonb)
// Table: whatsapp_templates
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   name: text (not null)
//   template_key: text (not null)
//   body: text (not null)
//   is_active: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: appointments
//   FOREIGN KEY appointments_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   FOREIGN KEY appointments_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY appointments_pkey: PRIMARY KEY (id)
//   FOREIGN KEY appointments_professional_id_fkey: FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE
//   FOREIGN KEY appointments_service_id_fkey: FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
// Table: client_custom_prices
//   FOREIGN KEY client_custom_prices_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   UNIQUE client_custom_prices_client_id_service_id_key: UNIQUE (client_id, service_id)
//   FOREIGN KEY client_custom_prices_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY client_custom_prices_pkey: PRIMARY KEY (id)
//   FOREIGN KEY client_custom_prices_service_id_fkey: FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
// Table: clients
//   FOREIGN KEY clients_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY clients_pkey: PRIMARY KEY (id)
// Table: commission_rules
//   FOREIGN KEY commission_rules_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY commission_rules_pkey: PRIMARY KEY (id)
//   FOREIGN KEY commission_rules_professional_id_fkey: FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE
//   FOREIGN KEY commission_rules_service_id_fkey: FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
// Table: commissions
//   FOREIGN KEY commissions_appointment_id_fkey: FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
//   FOREIGN KEY commissions_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY commissions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY commissions_professional_id_fkey: FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: companies
//   UNIQUE companies_passkey_key: UNIQUE (passkey)
//   PRIMARY KEY companies_pkey: PRIMARY KEY (id)
// Table: financial_accounts
//   FOREIGN KEY financial_accounts_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY financial_accounts_pkey: PRIMARY KEY (id)
//   FOREIGN KEY financial_accounts_transaction_id_fkey: FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
// Table: financial_audit_logs
//   FOREIGN KEY financial_audit_logs_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY financial_audit_logs_pkey: PRIMARY KEY (id)
//   FOREIGN KEY financial_audit_logs_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: inventory
//   FOREIGN KEY inventory_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY inventory_pkey: PRIMARY KEY (id)
//   FOREIGN KEY inventory_service_id_fkey: FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
// Table: inventory_movements
//   FOREIGN KEY inventory_movements_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   FOREIGN KEY inventory_movements_inventory_id_fkey: FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
//   PRIMARY KEY inventory_movements_pkey: PRIMARY KEY (id)
//   FOREIGN KEY inventory_movements_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
// Table: pix_gateways
//   FOREIGN KEY pix_gateways_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY pix_gateways_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
//   UNIQUE profiles_username_key: UNIQUE (username)
// Table: purchases
//   FOREIGN KEY purchases_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY purchases_pkey: PRIMARY KEY (id)
//   FOREIGN KEY purchases_service_id_fkey: FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
//   FOREIGN KEY purchases_supplier_id_fkey: FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
// Table: services
//   FOREIGN KEY services_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY services_pkey: PRIMARY KEY (id)
// Table: suppliers
//   FOREIGN KEY suppliers_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY suppliers_pkey: PRIMARY KEY (id)
// Table: transactions
//   FOREIGN KEY transactions_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY transactions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY transactions_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
// Table: whatsapp_templates
//   FOREIGN KEY whatsapp_templates_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY whatsapp_templates_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: appointments
//   Policy "company_appointments" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
// Table: client_custom_prices
//   Policy "company_custom_prices_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = auth_company_id()) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'root'::text))
//   Policy "company_custom_prices_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
//   Policy "company_custom_prices_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (company_id = auth_company_id())
//   Policy "company_custom_prices_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
//   Policy "company_custom_prices_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
// Table: clients
//   Policy "company_clients" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
// Table: commission_rules
//   Policy "company_comm_rules" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
// Table: commissions
//   Policy "company_commissions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
// Table: companies
//   Policy "anon_select_companies" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "auth_all_companies" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = ANY (ARRAY['admin'::text, 'root'::text])) OR (id = ( SELECT profiles.company_id    FROM profiles   WHERE (profiles.id = auth.uid()))))
//   Policy "auth_select_companies" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: financial_accounts
//   Policy "company_financials" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = auth_company_id()) OR (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'root'::text))
// Table: financial_audit_logs
//   Policy "company_financial_audit_logs" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
// Table: inventory
//   Policy "company_inventory" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = auth_company_id()) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'root'::text))
// Table: inventory_movements
//   Policy "company_inventory_movements" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
// Table: pix_gateways
//   Policy "company_pix_gateways" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = auth_company_id()) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'root'::text))
// Table: profiles
//   Policy "auth_all_profiles" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = auth_company_id()) OR (id = auth.uid()) OR (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'root'::text))
// Table: purchases
//   Policy "company_purchases" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
// Table: services
//   Policy "company_services" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
// Table: suppliers
//   Policy "company_suppliers" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
// Table: transactions
//   Policy "company_transactions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = auth_company_id()) OR (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'root'::text))
// Table: whatsapp_templates
//   Policy "company_whatsapp_templates" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = auth_company_id()) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'root'::text))

// --- DATABASE FUNCTIONS ---
// FUNCTION auth_company_id()
//   CREATE OR REPLACE FUNCTION public.auth_company_id()
//    RETURNS uuid
//    LANGUAGE sql
//    STABLE
//   AS $function$
//     SELECT (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid;
//   $function$
//
// FUNCTION enforce_single_active_gateway()
//   CREATE OR REPLACE FUNCTION public.enforce_single_active_gateway()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       IF NEW.is_active = true THEN
//           UPDATE public.pix_gateways
//           SET is_active = false
//           WHERE company_id = NEW.company_id AND id != NEW.id;
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION get_email_for_login(text, uuid)
//   CREATE OR REPLACE FUNCTION public.get_email_for_login(p_username text, p_company_id uuid)
//    RETURNS text
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//   DECLARE
//     v_email TEXT;
//   BEGIN
//     SELECT au.email INTO v_email
//     FROM public.profiles p
//     JOIN auth.users au ON au.id = p.id
//     WHERE p.username ILIKE p_username
//       AND p.company_id = p_company_id
//       AND p.is_active = true
//     LIMIT 1;
//
//     RETURN v_email;
//   END;
//   $function$
//
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, company_id, name, username, role)
//     VALUES (
//       NEW.id,
//       (NEW.raw_user_meta_data->>'company_id')::uuid,
//       COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
//       COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
//       COALESCE(NEW.raw_user_meta_data->>'role', 'atendimento')
//     );
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION log_financial_changes()
//   CREATE OR REPLACE FUNCTION public.log_financial_changes()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_user_id UUID;
//       v_company_id UUID;
//   BEGIN
//       v_user_id := auth.uid();
//
//       IF TG_OP = 'INSERT' THEN
//           v_company_id := NEW.company_id;
//           INSERT INTO public.financial_audit_logs (company_id, user_id, action, table_name, record_id, new_values)
//           VALUES (v_company_id, v_user_id, TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
//           RETURN NEW;
//       ELSIF TG_OP = 'UPDATE' THEN
//           v_company_id := NEW.company_id;
//           INSERT INTO public.financial_audit_logs (company_id, user_id, action, table_name, record_id, old_values, new_values)
//           VALUES (v_company_id, v_user_id, TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
//           RETURN NEW;
//       ELSIF TG_OP = 'DELETE' THEN
//           v_company_id := OLD.company_id;
//           INSERT INTO public.financial_audit_logs (company_id, user_id, action, table_name, record_id, old_values)
//           VALUES (v_company_id, v_user_id, TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
//           RETURN OLD;
//       END IF;
//       RETURN NULL;
//   END;
//   $function$
//
// FUNCTION rls_auto_enable()
//   CREATE OR REPLACE FUNCTION public.rls_auto_enable()
//    RETURNS event_trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'pg_catalog'
//   AS $function$
//   DECLARE
//     cmd record;
//   BEGIN
//     FOR cmd IN
//       SELECT *
//       FROM pg_event_trigger_ddl_commands()
//       WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
//         AND object_type IN ('table','partitioned table')
//     LOOP
//        IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
//         BEGIN
//           EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
//           RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
//         EXCEPTION
//           WHEN OTHERS THEN
//             RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
//         END;
//        ELSE
//           RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
//        END IF;
//     END LOOP;
//   END;
//   $function$
//
// FUNCTION sync_financial_desc_fn()
//   CREATE OR REPLACE FUNCTION public.sync_financial_desc_fn()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       IF NEW.description IS DISTINCT FROM OLD.description AND NEW.transaction_id IS NOT NULL THEN
//           -- Update related transaction only if it actually differs to avoid infinite trigger loops
//           UPDATE public.transactions
//           SET description = NEW.description
//           WHERE id = NEW.transaction_id AND description IS DISTINCT FROM NEW.description;
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION sync_transaction_desc_fn()
//   CREATE OR REPLACE FUNCTION public.sync_transaction_desc_fn()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       IF NEW.description IS DISTINCT FROM OLD.description THEN
//           -- Update related financial accounts only if they actually differ to avoid infinite trigger loops
//           UPDATE public.financial_accounts
//           SET description = NEW.description
//           WHERE transaction_id = NEW.id AND description IS DISTINCT FROM NEW.description;
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: financial_accounts
//   audit_financial_accounts_changes: CREATE TRIGGER audit_financial_accounts_changes AFTER INSERT OR DELETE OR UPDATE ON public.financial_accounts FOR EACH ROW EXECUTE FUNCTION log_financial_changes()
//   trg_sync_financial_desc: CREATE TRIGGER trg_sync_financial_desc AFTER UPDATE OF description ON public.financial_accounts FOR EACH ROW EXECUTE FUNCTION sync_financial_desc_fn()
// Table: pix_gateways
//   trg_single_active_gateway: CREATE TRIGGER trg_single_active_gateway BEFORE INSERT OR UPDATE ON public.pix_gateways FOR EACH ROW EXECUTE FUNCTION enforce_single_active_gateway()
// Table: transactions
//   audit_transactions_changes: CREATE TRIGGER audit_transactions_changes AFTER INSERT OR DELETE OR UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION log_financial_changes()
//   trg_sync_transaction_desc: CREATE TRIGGER trg_sync_transaction_desc AFTER UPDATE OF description ON public.transactions FOR EACH ROW EXECUTE FUNCTION sync_transaction_desc_fn()

// --- INDEXES ---
// Table: client_custom_prices
//   CREATE UNIQUE INDEX client_custom_prices_client_id_service_id_key ON public.client_custom_prices USING btree (client_id, service_id)
// Table: companies
//   CREATE UNIQUE INDEX companies_passkey_key ON public.companies USING btree (passkey)
// Table: profiles
//   CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username)
