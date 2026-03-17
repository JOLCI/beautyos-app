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
          client_id: string | null
          company_id: string | null
          created_at: string
          date: string
          end_time: string
          id: string
          professional_id: string | null
          service_id: string | null
          start_time: string
          status: string
        }
        Insert: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          date: string
          end_time: string
          id?: string
          professional_id?: string | null
          service_id?: string | null
          start_time: string
          status?: string
        }
        Update: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          professional_id?: string | null
          service_id?: string | null
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
      clients: {
        Row: {
          anamnesis: Json | null
          company_id: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string
          special_prices: Json | null
        }
        Insert: {
          anamnesis?: Json | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone: string
          special_prices?: Json | null
        }
        Update: {
          anamnesis?: Json | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
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
          settings: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          passkey: string
          primary_color?: string | null
          settings?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          passkey?: string
          primary_color?: string | null
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
      services: {
        Row: {
          code: string
          company_id: string | null
          cost_price: number | null
          created_at: string
          duration: number
          id: string
          is_active: boolean | null
          is_composite: boolean | null
          name: string
          price: number
          type: string
        }
        Insert: {
          code: string
          company_id?: string | null
          cost_price?: number | null
          created_at?: string
          duration?: number
          id?: string
          is_active?: boolean | null
          is_composite?: boolean | null
          name: string
          price: number
          type?: string
        }
        Update: {
          code?: string
          company_id?: string | null
          cost_price?: number | null
          created_at?: string
          duration?: number
          id?: string
          is_active?: boolean | null
          is_composite?: boolean | null
          name?: string
          price?: number
          type?: string
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
      transactions: {
        Row: {
          amount: number
          company_id: string | null
          created_at: string
          description: string
          id: string
          payment_method: string | null
          ref_id: string | null
          status: string
          type: string
        }
        Insert: {
          amount: number
          company_id?: string | null
          created_at?: string
          description: string
          id?: string
          payment_method?: string | null
          ref_id?: string | null
          status?: string
          type: string
        }
        Update: {
          amount?: number
          company_id?: string | null
          created_at?: string
          description?: string
          id?: string
          payment_method?: string | null
          ref_id?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_company_id_fkey'
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
// Table: profiles
//   id: uuid (not null)
//   company_id: uuid (nullable)
//   name: text (not null)
//   username: text (not null)
//   role: text (not null, default: 'atendimento'::text)
//   is_active: boolean (nullable, default: true)
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

// --- CONSTRAINTS ---
// Table: appointments
//   FOREIGN KEY appointments_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   FOREIGN KEY appointments_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY appointments_pkey: PRIMARY KEY (id)
//   FOREIGN KEY appointments_professional_id_fkey: FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE
//   FOREIGN KEY appointments_service_id_fkey: FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
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
// Table: inventory
//   FOREIGN KEY inventory_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY inventory_pkey: PRIMARY KEY (id)
//   FOREIGN KEY inventory_service_id_fkey: FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
// Table: inventory_movements
//   FOREIGN KEY inventory_movements_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   FOREIGN KEY inventory_movements_inventory_id_fkey: FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
//   PRIMARY KEY inventory_movements_pkey: PRIMARY KEY (id)
//   FOREIGN KEY inventory_movements_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
// Table: profiles
//   FOREIGN KEY profiles_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
//   UNIQUE profiles_username_key: UNIQUE (username)
// Table: services
//   FOREIGN KEY services_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY services_pkey: PRIMARY KEY (id)
// Table: transactions
//   FOREIGN KEY transactions_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY transactions_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: appointments
//   Policy "company_appointments" (ALL, PERMISSIVE) roles={authenticated}
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
//   Policy "auth_select_companies" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "auth_update_companies" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((id)::text = ((auth.jwt() -> 'user_metadata'::text) ->> 'company_id'::text))
// Table: financial_accounts
//   Policy "company_financials" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
// Table: inventory
//   Policy "company_inventory" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
// Table: inventory_movements
//   Policy "company_inventory_movements" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
// Table: profiles
//   Policy "auth_all_profiles" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (((company_id)::text = ((auth.jwt() -> 'user_metadata'::text) ->> 'company_id'::text)) OR (id = auth.uid()))
//   Policy "auth_select_profiles" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (((company_id)::text = ((auth.jwt() -> 'user_metadata'::text) ->> 'company_id'::text)) OR (id = auth.uid()))
// Table: services
//   Policy "company_services" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
// Table: transactions
//   Policy "company_transactions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())

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

// --- INDEXES ---
// Table: companies
//   CREATE UNIQUE INDEX companies_passkey_key ON public.companies USING btree (passkey)
// Table: profiles
//   CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username)
