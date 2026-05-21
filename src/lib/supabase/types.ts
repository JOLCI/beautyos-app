// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
      agenda_blockers: {
        Row: {
          company_id: string | null
          created_at: string | null
          days_of_week: Json | null
          end_date: string | null
          end_time: string | null
          id: string
          is_active: boolean | null
          professional_id: string | null
          reason: string | null
          start_date: string | null
          start_time: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          days_of_week?: Json | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          professional_id?: string | null
          reason?: string | null
          start_date?: string | null
          start_time?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          days_of_week?: Json | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          professional_id?: string | null
          reason?: string | null
          start_date?: string | null
          start_time?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agenda_blockers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_blockers_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          canceled_by_client: boolean | null
          cancellation_reason: string | null
          client_id: string | null
          company_id: string | null
          created_at: string
          data_processamento_pdv: string | null
          date: string
          duration_minutes: number | null
          end_time: string
          id: string
          processado_pdv: boolean | null
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
          data_processamento_pdv?: string | null
          date: string
          duration_minutes?: number | null
          end_time: string
          id?: string
          processado_pdv?: boolean | null
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
          data_processamento_pdv?: string | null
          date?: string
          duration_minutes?: number | null
          end_time?: string
          id?: string
          processado_pdv?: boolean | null
          professional_id?: string | null
          service_id?: string | null
          service_ids?: string[] | null
          start_time?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "v_client_service_intervals"
            referencedColumns: ["service_id"]
          },
        ]
      }
      cash_balance_history: {
        Row: {
          atualizado_em: string | null
          company_id: string | null
          criado_em: string | null
          data: string
          data_transferencia: string | null
          fechado_por: string | null
          id: string
          id_transacao_transferencia: string | null
          observacoes: string | null
          saldo_final: number
          saldo_inicial: number
          saldo_movimentacoes: number
          transferido_proximo_dia: boolean | null
        }
        Insert: {
          atualizado_em?: string | null
          company_id?: string | null
          criado_em?: string | null
          data: string
          data_transferencia?: string | null
          fechado_por?: string | null
          id?: string
          id_transacao_transferencia?: string | null
          observacoes?: string | null
          saldo_final?: number
          saldo_inicial?: number
          saldo_movimentacoes?: number
          transferido_proximo_dia?: boolean | null
        }
        Update: {
          atualizado_em?: string | null
          company_id?: string | null
          criado_em?: string | null
          data?: string
          data_transferencia?: string | null
          fechado_por?: string | null
          id?: string
          id_transacao_transferencia?: string | null
          observacoes?: string | null
          saldo_final?: number
          saldo_inicial?: number
          saldo_movimentacoes?: number
          transferido_proximo_dia?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_balance_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_balance_history_fechado_por_fkey"
            columns: ["fechado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_balance_history_id_transacao_transferencia_fkey"
            columns: ["id_transacao_transferencia"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_closures: {
        Row: {
          closed_by: string | null
          closure_date: string
          company_id: string | null
          created_at: string
          details: Json
          id: string
          notes: string | null
        }
        Insert: {
          closed_by?: string | null
          closure_date: string
          company_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          notes?: string | null
        }
        Update: {
          closed_by?: string | null
          closure_date?: string
          company_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_closures_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_body_map: {
        Row: {
          checklist_response_id: string | null
          criado_em: string | null
          descricao_texto: string | null
          id: string
          posicao_x: number | null
          posicao_y: number | null
          tipo_alteracao: string | null
          tipo_corpo: Database["public"]["Enums"]["checklist_body_type_enum"]
          ungueal_numero: number | null
        }
        Insert: {
          checklist_response_id?: string | null
          criado_em?: string | null
          descricao_texto?: string | null
          id?: string
          posicao_x?: number | null
          posicao_y?: number | null
          tipo_alteracao?: string | null
          tipo_corpo: Database["public"]["Enums"]["checklist_body_type_enum"]
          ungueal_numero?: number | null
        }
        Update: {
          checklist_response_id?: string | null
          criado_em?: string | null
          descricao_texto?: string | null
          id?: string
          posicao_x?: number | null
          posicao_y?: number | null
          tipo_alteracao?: string | null
          tipo_corpo?: Database["public"]["Enums"]["checklist_body_type_enum"]
          ungueal_numero?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_body_map_checklist_response_id_fkey"
            columns: ["checklist_response_id"]
            isOneToOne: false
            referencedRelation: "checklist_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          checklist_id: string | null
          criado_em: string | null
          id: string
          obrigatoria: boolean | null
          pergunta: string
          tipo_resposta: Database["public"]["Enums"]["checklist_item_type_enum"]
        }
        Insert: {
          checklist_id?: string | null
          criado_em?: string | null
          id?: string
          obrigatoria?: boolean | null
          pergunta: string
          tipo_resposta?: Database["public"]["Enums"]["checklist_item_type_enum"]
        }
        Update: {
          checklist_id?: string | null
          criado_em?: string | null
          id?: string
          obrigatoria?: boolean | null
          pergunta?: string
          tipo_resposta?: Database["public"]["Enums"]["checklist_item_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_responses: {
        Row: {
          appointment_id: string | null
          checklist_id: string | null
          cliente_id: string | null
          id: string
          respondido_em: string | null
          respondido_por: string | null
          resposta_item: Json | null
        }
        Insert: {
          appointment_id?: string | null
          checklist_id?: string | null
          cliente_id?: string | null
          id?: string
          respondido_em?: string | null
          respondido_por?: string | null
          resposta_item?: Json | null
        }
        Update: {
          appointment_id?: string | null
          checklist_id?: string | null
          cliente_id?: string | null
          id?: string
          respondido_em?: string | null
          respondido_por?: string | null
          resposta_item?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_responses_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_responses_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_client_service_intervals"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "checklist_responses_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_responses_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_responses_respondido_por_fkey"
            columns: ["respondido_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          ativo: boolean | null
          company_id: string | null
          criado_em: string | null
          id: string
          nome: string
          tipo: Database["public"]["Enums"]["checklist_type_enum"]
        }
        Insert: {
          ativo?: boolean | null
          company_id?: string | null
          criado_em?: string | null
          id?: string
          nome: string
          tipo?: Database["public"]["Enums"]["checklist_type_enum"]
        }
        Update: {
          ativo?: boolean | null
          company_id?: string | null
          criado_em?: string | null
          id?: string
          nome?: string
          tipo?: Database["public"]["Enums"]["checklist_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "checklists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      client_custom_prices: {
        Row: {
          client_id: string | null
          company_id: string | null
          created_at: string
          id: string
          observacoes: string | null
          preco_padrao_original: number | null
          price: number
          service_id: string | null
          tipo_ajuste:
            | Database["public"]["Enums"]["special_price_adj_enum"]
            | null
          tipo_especial:
            | Database["public"]["Enums"]["special_price_type_enum"]
            | null
          valor_ajuste: number | null
        }
        Insert: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          observacoes?: string | null
          preco_padrao_original?: number | null
          price: number
          service_id?: string | null
          tipo_ajuste?:
            | Database["public"]["Enums"]["special_price_adj_enum"]
            | null
          tipo_especial?:
            | Database["public"]["Enums"]["special_price_type_enum"]
            | null
          valor_ajuste?: number | null
        }
        Update: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          observacoes?: string | null
          preco_padrao_original?: number | null
          price?: number
          service_id?: string | null
          tipo_ajuste?:
            | Database["public"]["Enums"]["special_price_adj_enum"]
            | null
          tipo_especial?:
            | Database["public"]["Enums"]["special_price_type_enum"]
            | null
          valor_ajuste?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_custom_prices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_custom_prices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_custom_prices_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_custom_prices_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "v_client_service_intervals"
            referencedColumns: ["service_id"]
          },
        ]
      }
      clients: {
        Row: {
          anamnesis: Json | null
          avatar_url: string | null
          birthday: string | null
          birthday_day: number | null
          birthday_month: number | null
          company_id: string | null
          created_at: string
          email: string | null
          gender: string | null
          id: string
          is_active: boolean | null
          name: string
          nome_preferido: string | null
          notes: string | null
          phone: string
          special_prices: Json | null
        }
        Insert: {
          anamnesis?: Json | null
          avatar_url?: string | null
          birthday?: string | null
          birthday_day?: number | null
          birthday_month?: number | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          nome_preferido?: string | null
          notes?: string | null
          phone: string
          special_prices?: Json | null
        }
        Update: {
          anamnesis?: Json | null
          avatar_url?: string | null
          birthday?: string | null
          birthday_day?: number | null
          birthday_month?: number | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          nome_preferido?: string | null
          notes?: string | null
          phone?: string
          special_prices?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
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
            foreignKeyName: "commission_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_rules_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_rules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_rules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "v_client_service_intervals"
            referencedColumns: ["service_id"]
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
            foreignKeyName: "commissions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_client_service_intervals"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "commissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
            foreignKeyName: "financial_audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_titles: {
        Row: {
          client_id: string | null
          company_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string
          id: string
          open_amount: number | null
          original_amount: number
          paid_amount: number
          status: string
          supplier_id: string | null
          type: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date: string
          id?: string
          open_amount?: number | null
          original_amount?: number
          paid_amount?: number
          status?: string
          supplier_id?: string | null
          type: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string
          id?: string
          open_amount?: number | null
          original_amount?: number
          paid_amount?: number
          status?: string
          supplier_id?: string | null
          type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_titles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_titles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_titles_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
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
            foreignKeyName: "inventory_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "v_client_service_intervals"
            referencedColumns: ["service_id"]
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
            foreignKeyName: "inventory_movements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          baixa_automatica: boolean | null
          company_id: string | null
          criado_em: string | null
          descricao: string | null
          descricao_visivel: boolean | null
          exige_data: boolean | null
          id: string
          nome: string
          tipo: Database["public"]["Enums"]["payment_method_type_enum"]
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          baixa_automatica?: boolean | null
          company_id?: string | null
          criado_em?: string | null
          descricao?: string | null
          descricao_visivel?: boolean | null
          exige_data?: boolean | null
          id?: string
          nome: string
          tipo?: Database["public"]["Enums"]["payment_method_type_enum"]
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          baixa_automatica?: boolean | null
          company_id?: string | null
          criado_em?: string | null
          descricao?: string | null
          descricao_visivel?: boolean | null
          exige_data?: boolean | null
          id?: string
          nome?: string
          tipo?: Database["public"]["Enums"]["payment_method_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
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
            foreignKeyName: "pix_gateways_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          is_attendant: boolean | null
          name: string
          role: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          id: string
          is_active?: boolean | null
          is_attendant?: boolean | null
          name: string
          role?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_attendant?: boolean | null
          name?: string
          role?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
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
            foreignKeyName: "purchases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "v_client_service_intervals"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          checklist_id: string | null
          code: string
          company_id: string | null
          composite_items: Json | null
          cost_price: number | null
          created_at: string
          duration: number
          id: string
          image_url: string | null
          is_active: boolean | null
          is_composite: boolean | null
          name: string
          price: number
          recurrence_days: number | null
          type: string
          unit_of_measure: string | null
        }
        Insert: {
          checklist_id?: string | null
          code: string
          company_id?: string | null
          composite_items?: Json | null
          cost_price?: number | null
          created_at?: string
          duration?: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_composite?: boolean | null
          name: string
          price: number
          recurrence_days?: number | null
          type?: string
          unit_of_measure?: string | null
        }
        Update: {
          checklist_id?: string | null
          code?: string
          company_id?: string | null
          composite_items?: Json | null
          cost_price?: number | null
          created_at?: string
          duration?: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_composite?: boolean | null
          name?: string
          price?: number
          recurrence_days?: number | null
          type?: string
          unit_of_measure?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
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
            foreignKeyName: "suppliers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          company_id: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          is_active: boolean | null
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          company_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          company_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          client_id: string | null
          company_id: string | null
          confirmed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          financial_title_id: string | null
          id: string
          metadata: Json | null
          origin: string
          payment_method: string
          ref_id: string | null
          referencia_caixa_anterior: string | null
          status: string
          supplier_id: string | null
          ticket_id: string
          tipo_transacao:
            | Database["public"]["Enums"]["transaction_type_enum"]
            | null
          transaction_date: string
          type: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount?: number
          client_id?: string | null
          company_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          financial_title_id?: string | null
          id?: string
          metadata?: Json | null
          origin: string
          payment_method: string
          ref_id?: string | null
          referencia_caixa_anterior?: string | null
          status?: string
          supplier_id?: string | null
          ticket_id?: string
          tipo_transacao?:
            | Database["public"]["Enums"]["transaction_type_enum"]
            | null
          transaction_date?: string
          type: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          company_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          financial_title_id?: string | null
          id?: string
          metadata?: Json | null
          origin?: string
          payment_method?: string
          ref_id?: string | null
          referencia_caixa_anterior?: string | null
          status?: string
          supplier_id?: string | null
          ticket_id?: string
          tipo_transacao?:
            | Database["public"]["Enums"]["transaction_type_enum"]
            | null
          transaction_date?: string
          type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_financial_title_id_fkey"
            columns: ["financial_title_id"]
            isOneToOne: false
            referencedRelation: "financial_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          client_id: string
          company_id: string | null
          created_at: string | null
          end_time: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          preferred_days: Json | null
          professional_id: string | null
          service_id: string
          start_time: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          company_id?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          preferred_days?: Json | null
          professional_id?: string | null
          service_id: string
          start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          company_id?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          preferred_days?: Json | null
          professional_id?: string | null
          service_id?: string
          start_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "v_client_service_intervals"
            referencedColumns: ["service_id"]
          },
        ]
      }
      whatsapp_message_schedules: {
        Row: {
          client_id: string | null
          company_id: string | null
          created_at: string
          id: string
          phone_number: string
          related_title_id: string | null
          related_transaction_id: string | null
          rendered_message: string
          scheduled_at_datetime: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          phone_number: string
          related_title_id?: string | null
          related_transaction_id?: string | null
          rendered_message: string
          scheduled_at_datetime: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          phone_number?: string
          related_title_id?: string | null
          related_transaction_id?: string | null
          rendered_message?: string
          scheduled_at_datetime?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_message_schedules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_message_schedules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_message_schedules_related_title_id_fkey"
            columns: ["related_title_id"]
            isOneToOne: false
            referencedRelation: "financial_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_message_schedules_related_transaction_id_fkey"
            columns: ["related_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_tags: {
        Row: {
          company_id: string | null
          created_at: string
          formatter: string | null
          id: string
          is_active: boolean | null
          source_field: string | null
          source_table: string | null
          tag_name: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          formatter?: string | null
          id?: string
          is_active?: boolean | null
          source_field?: string | null
          source_table?: string | null
          tag_name: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          formatter?: string | null
          id?: string
          is_active?: boolean | null
          source_field?: string | null
          source_table?: string | null
          tag_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_tags_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
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
            foreignKeyName: "whatsapp_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_client_service_intervals: {
        Row: {
          appointment_id: string | null
          client_id: string | null
          company_id: string | null
          date: string | null
          days_interval: number | null
          previous_date: string | null
          service_id: string | null
          service_name: string | null
          service_price: number | null
          start_time: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      v_cliente_timeline_360: {
        Row: {
          client_id: string | null
          company_id: string | null
          data_ref: string | null
          evento_datetime: string | null
          id: string | null
          sequencia_tipo: number | null
          status_evento: string | null
          tipo_evento: string | null
          valor: number | null
        }
        Relationships: []
      }
      v_financial_inconsistencies: {
        Row: {
          company_id: string | null
          error_desc: string | null
          id: string | null
          source: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      auth_company_id: { Args: never; Returns: string }
      cleanup_inconsistent_financial_data: { Args: never; Returns: undefined }
      get_email_for_login: {
        Args: { p_company_id: string; p_username: string }
        Returns: string
      }
      resolve_login_identifier: {
        Args: { p_company_id: string; p_identifier: string }
        Returns: Json
      }
      seed_basic_wa_tags: { Args: never; Returns: undefined }
      seed_payment_methods_for_company: {
        Args: { p_company_id: string }
        Returns: undefined
      }
    }
    Enums: {
      checklist_body_type_enum:
        | "mao_esquerda"
        | "mao_direita"
        | "pe_esquerdo"
        | "pe_direito"
      checklist_item_type_enum:
        | "texto"
        | "numero"
        | "data"
        | "sim_nao"
        | "produto"
      checklist_type_enum: "cliente" | "servico"
      payment_method_type_enum:
        | "dinheiro"
        | "cartao_credito"
        | "cartao_debito"
        | "pix"
        | "convenio"
        | "cheque"
      special_price_adj_enum: "reais" | "percentual"
      special_price_type_enum: "acrescimo" | "desconto" | "promocao" | "manual"
      transaction_type_enum:
        | "receita"
        | "despesa"
        | "transferencia_interna"
        | "ajuste_caixa"
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
      checklist_body_type_enum: [
        "mao_esquerda",
        "mao_direita",
        "pe_esquerdo",
        "pe_direito",
      ],
      checklist_item_type_enum: [
        "texto",
        "numero",
        "data",
        "sim_nao",
        "produto",
      ],
      checklist_type_enum: ["cliente", "servico"],
      payment_method_type_enum: [
        "dinheiro",
        "cartao_credito",
        "cartao_debito",
        "pix",
        "convenio",
        "cheque",
      ],
      special_price_adj_enum: ["reais", "percentual"],
      special_price_type_enum: ["acrescimo", "desconto", "promocao", "manual"],
      transaction_type_enum: [
        "receita",
        "despesa",
        "transferencia_interna",
        "ajuste_caixa",
      ],
    },
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
// Table: agenda_blockers
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   professional_id: uuid (nullable)
//   type: text (nullable)
//   start_date: date (nullable)
//   end_date: date (nullable)
//   start_time: time without time zone (nullable)
//   end_time: time without time zone (nullable)
//   days_of_week: jsonb (nullable)
//   reason: text (nullable)
//   is_active: boolean (nullable, default: true)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
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
//   processado_pdv: boolean (nullable, default: false)
//   data_processamento_pdv: timestamp with time zone (nullable)
// Table: cash_balance_history
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   data: date (not null)
//   saldo_inicial: numeric (not null, default: 0)
//   saldo_movimentacoes: numeric (not null, default: 0)
//   saldo_final: numeric (not null, default: 0)
//   transferido_proximo_dia: boolean (nullable, default: false)
//   data_transferencia: date (nullable)
//   id_transacao_transferencia: uuid (nullable)
//   observacoes: text (nullable)
//   fechado_por: uuid (nullable)
//   criado_em: timestamp with time zone (nullable, default: now())
//   atualizado_em: timestamp with time zone (nullable, default: now())
// Table: cash_closures
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   closed_by: uuid (nullable)
//   closure_date: date (not null)
//   details: jsonb (not null, default: '[]'::jsonb)
//   notes: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: checklist_body_map
//   id: uuid (not null, default: gen_random_uuid())
//   checklist_response_id: uuid (nullable)
//   tipo_corpo: checklist_body_type_enum (not null)
//   ungueal_numero: integer (nullable)
//   posicao_x: numeric (nullable)
//   posicao_y: numeric (nullable)
//   tipo_alteracao: character varying (nullable)
//   descricao_texto: text (nullable)
//   criado_em: timestamp with time zone (nullable, default: now())
// Table: checklist_items
//   id: uuid (not null, default: gen_random_uuid())
//   checklist_id: uuid (nullable)
//   pergunta: text (not null)
//   tipo_resposta: checklist_item_type_enum (not null, default: 'texto'::checklist_item_type_enum)
//   obrigatoria: boolean (nullable, default: false)
//   criado_em: timestamp with time zone (nullable, default: now())
// Table: checklist_responses
//   id: uuid (not null, default: gen_random_uuid())
//   checklist_id: uuid (nullable)
//   cliente_id: uuid (nullable)
//   appointment_id: uuid (nullable)
//   resposta_item: jsonb (nullable, default: '{}'::jsonb)
//   respondido_em: timestamp with time zone (nullable, default: now())
//   respondido_por: uuid (nullable)
// Table: checklists
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   nome: character varying (not null)
//   tipo: checklist_type_enum (not null, default: 'cliente'::checklist_type_enum)
//   ativo: boolean (nullable, default: true)
//   criado_em: timestamp with time zone (nullable, default: now())
// Table: client_custom_prices
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   client_id: uuid (nullable)
//   service_id: uuid (nullable)
//   price: numeric (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   preco_padrao_original: numeric (nullable)
//   tipo_especial: special_price_type_enum (nullable, default: 'manual'::special_price_type_enum)
//   valor_ajuste: numeric (nullable)
//   tipo_ajuste: special_price_adj_enum (nullable, default: 'reais'::special_price_adj_enum)
//   observacoes: text (nullable)
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
//   avatar_url: text (nullable)
//   gender: text (nullable, default: 'female'::text)
//   nome_preferido: character varying (nullable)
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
// Table: financial_titles
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   type: text (not null)
//   status: text (not null, default: 'open'::text)
//   original_amount: numeric (not null, default: 0)
//   paid_amount: numeric (not null, default: 0)
//   open_amount: numeric (nullable)
//   due_date: date (not null)
//   description: text (nullable)
//   client_id: uuid (nullable)
//   supplier_id: uuid (nullable)
//   created_by: uuid (nullable)
//   updated_by: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
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
// Table: payment_methods
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   nome: character varying (not null)
//   tipo: payment_method_type_enum (not null, default: 'dinheiro'::payment_method_type_enum)
//   baixa_automatica: boolean (nullable, default: true)
//   exige_data: boolean (nullable, default: false)
//   descricao_visivel: boolean (nullable, default: true)
//   descricao: text (nullable)
//   ativo: boolean (nullable, default: true)
//   criado_em: timestamp with time zone (nullable, default: now())
//   atualizado_em: timestamp with time zone (nullable, default: now())
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
//   avatar_url: text (nullable)
//   is_attendant: boolean (nullable, default: false)
//   email: text (nullable)
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
//   recurrence_days: integer (nullable, default: 0)
//   image_url: text (nullable)
//   checklist_id: uuid (nullable)
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
// Table: tasks
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   title: text (not null)
//   description: text (nullable)
//   assigned_to: uuid (nullable)
//   created_by: uuid (nullable)
//   due_date: date (nullable)
//   completed_at: timestamp with time zone (nullable)
//   status: text (nullable, default: 'pending'::text)
//   priority: text (nullable, default: 'medium'::text)
//   is_active: boolean (nullable, default: true)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: transactions
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   ticket_id: text (not null, default: upper(SUBSTRING(replace((gen_random_uuid())::text, '-'::text, ''::text) FROM 1 FOR 8)))
//   type: text (not null)
//   origin: text (not null)
//   amount: numeric (not null, default: 0)
//   status: text (not null, default: 'pending'::text)
//   payment_method: text (not null)
//   due_date: date (nullable)
//   transaction_date: date (not null, default: CURRENT_DATE)
//   confirmed_at: timestamp with time zone (nullable)
//   description: text (nullable)
//   client_id: uuid (nullable)
//   supplier_id: uuid (nullable)
//   financial_title_id: uuid (nullable)
//   ref_id: uuid (nullable)
//   metadata: jsonb (nullable, default: '{}'::jsonb)
//   created_by: uuid (nullable)
//   updated_by: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   tipo_transacao: transaction_type_enum (nullable, default: 'receita'::transaction_type_enum)
//   referencia_caixa_anterior: uuid (nullable)
// Table: v_client_service_intervals
//   appointment_id: uuid (nullable)
//   company_id: uuid (nullable)
//   client_id: uuid (nullable)
//   service_id: uuid (nullable)
//   service_name: text (nullable)
//   service_price: numeric (nullable)
//   date: date (nullable)
//   start_time: time without time zone (nullable)
//   status: text (nullable)
//   previous_date: date (nullable)
//   days_interval: integer (nullable)
// Table: v_cliente_timeline_360
//   id: uuid (nullable)
//   company_id: uuid (nullable)
//   evento_datetime: timestamp with time zone (nullable)
//   tipo_evento: text (nullable)
//   data_ref: date (nullable)
//   valor: numeric (nullable)
//   status_evento: text (nullable)
//   client_id: uuid (nullable)
//   sequencia_tipo: integer (nullable)
// Table: v_financial_inconsistencies
//   source: text (nullable)
//   id: uuid (nullable)
//   company_id: uuid (nullable)
//   error_desc: text (nullable)
// Table: waitlist
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   client_id: uuid (not null)
//   service_id: uuid (not null)
//   professional_id: uuid (nullable)
//   preferred_days: jsonb (nullable)
//   start_time: time without time zone (nullable)
//   end_time: time without time zone (nullable)
//   notes: text (nullable)
//   is_active: boolean (nullable, default: true)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: whatsapp_message_schedules
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   client_id: uuid (nullable)
//   phone_number: text (not null)
//   rendered_message: text (not null)
//   scheduled_at_datetime: timestamp with time zone (not null)
//   status: text (not null, default: 'pending'::text)
//   related_title_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   related_transaction_id: uuid (nullable)
// Table: whatsapp_tags
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   tag_name: text (not null)
//   source_table: text (nullable)
//   source_field: text (nullable)
//   formatter: text (nullable)
//   is_active: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
// Table: whatsapp_templates
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (nullable)
//   name: text (not null)
//   template_key: text (not null)
//   body: text (not null)
//   is_active: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: agenda_blockers
//   FOREIGN KEY agenda_blockers_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY agenda_blockers_pkey: PRIMARY KEY (id)
//   FOREIGN KEY agenda_blockers_professional_id_fkey: FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE
//   CHECK agenda_blockers_type_check: CHECK ((type = ANY (ARRAY['single_date'::text, 'interval'::text])))
// Table: appointments
//   FOREIGN KEY appointments_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   FOREIGN KEY appointments_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY appointments_pkey: PRIMARY KEY (id)
//   FOREIGN KEY appointments_professional_id_fkey: FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE CASCADE
//   FOREIGN KEY appointments_service_id_fkey: FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
// Table: cash_balance_history
//   UNIQUE cash_balance_history_company_id_data_key: UNIQUE (company_id, data)
//   FOREIGN KEY cash_balance_history_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   FOREIGN KEY cash_balance_history_fechado_por_fkey: FOREIGN KEY (fechado_por) REFERENCES profiles(id) ON DELETE SET NULL
//   FOREIGN KEY cash_balance_history_id_transacao_transferencia_fkey: FOREIGN KEY (id_transacao_transferencia) REFERENCES transactions(id) ON DELETE SET NULL
//   PRIMARY KEY cash_balance_history_pkey: PRIMARY KEY (id)
// Table: cash_closures
//   FOREIGN KEY cash_closures_closed_by_fkey: FOREIGN KEY (closed_by) REFERENCES auth.users(id) ON DELETE SET NULL
//   FOREIGN KEY cash_closures_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY cash_closures_pkey: PRIMARY KEY (id)
// Table: checklist_body_map
//   FOREIGN KEY checklist_body_map_checklist_response_id_fkey: FOREIGN KEY (checklist_response_id) REFERENCES checklist_responses(id) ON DELETE CASCADE
//   PRIMARY KEY checklist_body_map_pkey: PRIMARY KEY (id)
//   CHECK checklist_body_map_ungueal_numero_check: CHECK (((ungueal_numero >= 1) AND (ungueal_numero <= 5)))
// Table: checklist_items
//   FOREIGN KEY checklist_items_checklist_id_fkey: FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE
//   PRIMARY KEY checklist_items_pkey: PRIMARY KEY (id)
// Table: checklist_responses
//   FOREIGN KEY checklist_responses_appointment_id_fkey: FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
//   FOREIGN KEY checklist_responses_checklist_id_fkey: FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE
//   FOREIGN KEY checklist_responses_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clients(id) ON DELETE CASCADE
//   PRIMARY KEY checklist_responses_pkey: PRIMARY KEY (id)
//   FOREIGN KEY checklist_responses_respondido_por_fkey: FOREIGN KEY (respondido_por) REFERENCES profiles(id) ON DELETE SET NULL
// Table: checklists
//   FOREIGN KEY checklists_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY checklists_pkey: PRIMARY KEY (id)
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
// Table: financial_audit_logs
//   FOREIGN KEY financial_audit_logs_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY financial_audit_logs_pkey: PRIMARY KEY (id)
//   FOREIGN KEY financial_audit_logs_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: financial_titles
//   CHECK check_title_entity: CHECK ((((type = 'receivable'::text) AND (client_id IS NOT NULL)) OR ((type = 'payable'::text) AND (supplier_id IS NOT NULL))))
//   FOREIGN KEY financial_titles_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT
//   FOREIGN KEY financial_titles_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   FOREIGN KEY financial_titles_created_by_fkey: FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
//   PRIMARY KEY financial_titles_pkey: PRIMARY KEY (id)
//   CHECK financial_titles_status_check: CHECK ((status = ANY (ARRAY['open'::text, 'partial'::text, 'paid'::text, 'cancelled'::text])))
//   FOREIGN KEY financial_titles_supplier_id_fkey: FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT
//   CHECK financial_titles_type_check: CHECK ((type = ANY (ARRAY['receivable'::text, 'payable'::text])))
//   FOREIGN KEY financial_titles_updated_by_fkey: FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: inventory
//   FOREIGN KEY inventory_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY inventory_pkey: PRIMARY KEY (id)
//   FOREIGN KEY inventory_service_id_fkey: FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
// Table: inventory_movements
//   FOREIGN KEY inventory_movements_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   FOREIGN KEY inventory_movements_inventory_id_fkey: FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
//   PRIMARY KEY inventory_movements_pkey: PRIMARY KEY (id)
//   FOREIGN KEY inventory_movements_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
// Table: payment_methods
//   FOREIGN KEY payment_methods_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   UNIQUE payment_methods_company_id_nome_key: UNIQUE (company_id, nome)
//   PRIMARY KEY payment_methods_pkey: PRIMARY KEY (id)
// Table: pix_gateways
//   FOREIGN KEY pix_gateways_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY pix_gateways_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
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
// Table: tasks
//   FOREIGN KEY tasks_assigned_to_fkey: FOREIGN KEY (assigned_to) REFERENCES profiles(id) ON DELETE SET NULL
//   FOREIGN KEY tasks_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   FOREIGN KEY tasks_created_by_fkey: FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
//   PRIMARY KEY tasks_pkey: PRIMARY KEY (id)
//   CHECK tasks_priority_check: CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])))
//   CHECK tasks_status_check: CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text])))
// Table: transactions
//   CHECK check_tx_entity: CHECK ((((origin = 'receivable_settlement'::text) AND (client_id IS NOT NULL)) OR ((origin = 'payable_settlement'::text) AND (supplier_id IS NOT NULL)) OR (origin <> ALL (ARRAY['receivable_settlement'::text, 'payable_settlement'::text]))))
//   FOREIGN KEY transactions_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT
//   FOREIGN KEY transactions_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   FOREIGN KEY transactions_created_by_fkey: FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
//   FOREIGN KEY transactions_financial_title_id_fkey: FOREIGN KEY (financial_title_id) REFERENCES financial_titles(id) ON DELETE SET NULL
//   CHECK transactions_origin_check: CHECK ((origin = ANY (ARRAY['manual_entry'::text, 'automatic_entry'::text, 'receivable_settlement'::text, 'payable_settlement'::text, 'adjustment'::text, 'transfer'::text])))
//   PRIMARY KEY transactions_pkey: PRIMARY KEY (id)
//   CHECK transactions_status_check: CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text])))
//   FOREIGN KEY transactions_supplier_id_fkey: FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT
//   UNIQUE transactions_ticket_id_key: UNIQUE (ticket_id)
//   CHECK transactions_type_check: CHECK ((type = ANY (ARRAY['inflow'::text, 'outflow'::text])))
//   FOREIGN KEY transactions_updated_by_fkey: FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: waitlist
//   FOREIGN KEY waitlist_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   FOREIGN KEY waitlist_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY waitlist_pkey: PRIMARY KEY (id)
//   FOREIGN KEY waitlist_professional_id_fkey: FOREIGN KEY (professional_id) REFERENCES profiles(id) ON DELETE SET NULL
//   FOREIGN KEY waitlist_service_id_fkey: FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
// Table: whatsapp_message_schedules
//   FOREIGN KEY whatsapp_message_schedules_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   FOREIGN KEY whatsapp_message_schedules_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY whatsapp_message_schedules_pkey: PRIMARY KEY (id)
//   FOREIGN KEY whatsapp_message_schedules_related_title_id_fkey: FOREIGN KEY (related_title_id) REFERENCES financial_titles(id) ON DELETE CASCADE
//   FOREIGN KEY whatsapp_message_schedules_related_transaction_id_fkey: FOREIGN KEY (related_transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
//   CHECK whatsapp_message_schedules_status_check: CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'cancelled'::text, 'failed'::text])))
// Table: whatsapp_tags
//   FOREIGN KEY whatsapp_tags_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   UNIQUE whatsapp_tags_company_id_tag_name_key: UNIQUE (company_id, tag_name)
//   PRIMARY KEY whatsapp_tags_pkey: PRIMARY KEY (id)
// Table: whatsapp_templates
//   FOREIGN KEY whatsapp_templates_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY whatsapp_templates_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: agenda_blockers
//   Policy "company_agenda_blockers" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
// Table: appointments
//   Policy "company_appointments" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
// Table: cash_balance_history
//   Policy "company_cash_balance" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
// Table: cash_closures
//   Policy "company_cash_closures_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = COALESCE(( SELECT profiles.company_id    FROM profiles   WHERE (profiles.id = auth.uid())), (((auth.jwt() -> 'user_metadata'::text) ->> 'company_id'::text))::uuid)) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'root'::text))
// Table: checklist_body_map
//   Policy "company_checklist_body_map" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM (checklist_responses cr      JOIN checklists c ON ((c.id = cr.checklist_id)))   WHERE ((cr.id = checklist_body_map.checklist_response_id) AND (c.company_id = auth_company_id()))))
// Table: checklist_items
//   Policy "company_checklist_items" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM checklists c   WHERE ((c.id = checklist_items.checklist_id) AND (c.company_id = auth_company_id()))))
// Table: checklist_responses
//   Policy "company_checklist_responses" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM checklists c   WHERE ((c.id = checklist_responses.checklist_id) AND (c.company_id = auth_company_id()))))
// Table: checklists
//   Policy "company_checklists" (ALL, PERMISSIVE) roles={authenticated}
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
//   Policy "company_clients_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = auth_company_id()) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'root'::text))
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
// Table: financial_audit_logs
//   Policy "company_financial_audit_logs" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
// Table: financial_titles
//   Policy "company_titles_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = auth_company_id()) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'root'::text))
// Table: inventory
//   Policy "company_inventory" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = auth_company_id()) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'root'::text))
// Table: inventory_movements
//   Policy "company_inventory_movements" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (company_id = auth_company_id())
// Table: payment_methods
//   Policy "company_payment_methods" (ALL, PERMISSIVE) roles={authenticated}
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
// Table: tasks
//   Policy "company_tasks_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((created_by = auth.uid()) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'root'::text))
//   Policy "company_tasks_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((company_id = auth_company_id()) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'root'::text))
//   Policy "company_tasks_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = auth_company_id()) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'root'::text))
//   Policy "company_tasks_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = auth_company_id()) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'root'::text))
// Table: transactions
//   Policy "company_transactions_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = auth_company_id()) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'root'::text))
// Table: waitlist
//   Policy "company_waitlist" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = auth_company_id()) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'root'::text))
// Table: whatsapp_message_schedules
//   Policy "company_wa_schedules" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = auth_company_id()) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'root'::text))
// Table: whatsapp_tags
//   Policy "company_wa_tags_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = auth_company_id()) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'root'::text))
// Table: whatsapp_templates
//   Policy "company_whatsapp_templates" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = auth_company_id()) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = 'root'::text))
//   Policy "company_whatsapp_templates_select" (SELECT, PERMISSIVE) roles={authenticated}
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
// FUNCTION cancel_related_wa_schedules()
//   CREATE OR REPLACE FUNCTION public.cancel_related_wa_schedules()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       IF TG_OP = 'UPDATE' AND NEW.status IN ('cancelled', 'paid') AND OLD.status NOT IN ('cancelled', 'paid') THEN
//           UPDATE public.whatsapp_message_schedules 
//           SET status = 'cancelled', updated_at = NOW()
//           WHERE related_title_id = NEW.id AND status = 'pending';
//       ELSIF TG_OP = 'DELETE' THEN
//           UPDATE public.whatsapp_message_schedules 
//           SET status = 'cancelled', updated_at = NOW()
//           WHERE related_title_id = OLD.id AND status = 'pending';
//       END IF;
//       RETURN NULL;
//   END;
//   $function$
//   
// FUNCTION cancel_related_wa_schedules_tx()
//   CREATE OR REPLACE FUNCTION public.cancel_related_wa_schedules_tx()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       IF TG_OP = 'UPDATE' AND NEW.status IN ('cancelled') AND OLD.status NOT IN ('cancelled') THEN
//           UPDATE public.whatsapp_message_schedules 
//           SET status = 'cancelled', updated_at = NOW()
//           WHERE related_transaction_id = NEW.id AND status = 'pending';
//       ELSIF TG_OP = 'DELETE' THEN
//           UPDATE public.whatsapp_message_schedules 
//           SET status = 'cancelled', updated_at = NOW()
//           WHERE related_transaction_id = OLD.id AND status = 'pending';
//       END IF;
//       RETURN NULL;
//   END;
//   $function$
//   
// FUNCTION cleanup_inconsistent_financial_data()
//   CREATE OR REPLACE FUNCTION public.cleanup_inconsistent_financial_data()
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       -- Delete transactions that are settlements but lack client/supplier
//       DELETE FROM public.transactions 
//       WHERE (origin = 'receivable_settlement' AND client_id IS NULL)
//          OR (origin = 'payable_settlement' AND supplier_id IS NULL);
//          
//       -- Mark titles as cancelled if they have no entity
//       UPDATE public.financial_titles
//       SET status = 'cancelled', description = COALESCE(description, '') || ' (Auto-cancelado: sem entidade vinculada)'
//       WHERE (type = 'receivable' AND client_id IS NULL)
//          OR (type = 'payable' AND supplier_id IS NULL);
//   END;
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
//     RAISE LOG 'get_email_for_login: Resolving identifier "%" for company "%"', p_username, p_company_id;
//     
//     SELECT au.email INTO v_email
//     FROM public.profiles p
//     JOIN auth.users au ON au.id = p.id
//     WHERE lower(p.username) = lower(p_username)
//       AND p.company_id = p_company_id 
//       AND p.is_active = true
//     LIMIT 1;
//   
//     IF v_email IS NOT NULL THEN
//       RAISE LOG 'get_email_for_login: Found email for username "%"', p_username;
//     ELSE
//       RAISE LOG 'get_email_for_login: Username "%" not found', p_username;
//     END IF;
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
// FUNCTION recalculate_financial_title()
//   CREATE OR REPLACE FUNCTION public.recalculate_financial_title()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_title_id UUID;
//     v_total_paid NUMERIC;
//   BEGIN
//     IF TG_OP = 'DELETE' THEN
//       v_title_id := OLD.financial_title_id;
//     ELSE
//       v_title_id := NEW.financial_title_id;
//     END IF;
//   
//     IF v_title_id IS NOT NULL THEN
//       -- Calculate total paid amount from confirmed transactions ONLY
//       SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
//       FROM public.transactions
//       WHERE financial_title_id = v_title_id AND status = 'confirmed';
//   
//       -- Update title, ensuring 'cancelled' status is sticky
//       UPDATE public.financial_titles
//       SET 
//         paid_amount = v_total_paid,
//         status = CASE 
//                    WHEN status = 'cancelled' THEN 'cancelled'
//                    WHEN v_total_paid >= original_amount THEN 'paid'
//                    WHEN v_total_paid > 0 THEN 'partial'
//                    ELSE 'open'
//                  END
//       WHERE id = v_title_id;
//     END IF;
//   
//     IF TG_OP = 'DELETE' THEN 
//       RETURN OLD; 
//     ELSE 
//       RETURN NEW; 
//     END IF;
//   END;
//   $function$
//   
// FUNCTION resolve_login_identifier(text, uuid)
//   CREATE OR REPLACE FUNCTION public.resolve_login_identifier(p_identifier text, p_company_id uuid)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//   DECLARE
//       v_clean_identifier TEXT;
//       v_user_count INT;
//       v_resolved_email TEXT;
//   BEGIN
//       -- Normalize the identifier
//       v_clean_identifier := lower(trim(p_identifier));
//   
//       -- 1. Try Email Match
//       SELECT au.email INTO v_resolved_email
//       FROM auth.users au
//       JOIN public.profiles p ON p.id = au.id
//       WHERE lower(au.email) = v_clean_identifier
//         AND p.company_id = p_company_id
//         AND p.is_active = true
//       LIMIT 1;
//   
//       IF v_resolved_email IS NOT NULL THEN
//           RETURN jsonb_build_object('status', 'success', 'email', v_resolved_email, 'match_type', 'email');
//       END IF;
//   
//       -- 2. Try Username Match
//       SELECT au.email INTO v_resolved_email
//       FROM auth.users au
//       JOIN public.profiles p ON p.id = au.id
//       WHERE lower(p.username) = v_clean_identifier
//         AND p.company_id = p_company_id
//         AND p.is_active = true
//       LIMIT 1;
//   
//       IF v_resolved_email IS NOT NULL THEN
//           RETURN jsonb_build_object('status', 'success', 'email', v_resolved_email, 'match_type', 'username');
//       END IF;
//   
//       -- 3. Try Name Match
//       SELECT count(*), max(au.email) INTO v_user_count, v_resolved_email
//       FROM auth.users au
//       JOIN public.profiles p ON p.id = au.id
//       WHERE lower(p.name) = v_clean_identifier
//         AND p.company_id = p_company_id
//         AND p.is_active = true;
//   
//       IF v_user_count = 1 THEN
//           RETURN jsonb_build_object('status', 'success', 'email', v_resolved_email, 'match_type', 'name');
//       ELSIF v_user_count > 1 THEN
//           RETURN jsonb_build_object('status', 'ambiguous', 'message', 'Múltiplos usuários encontrados com este nome.');
//       END IF;
//   
//       -- 4. Not found
//       RETURN jsonb_build_object('status', 'not_found');
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
// FUNCTION rollback_appointment_status()
//   CREATE OR REPLACE FUNCTION public.rollback_appointment_status()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF TG_OP = 'DELETE' THEN
//       IF OLD.ref_id IS NOT NULL THEN
//         UPDATE public.appointments
//         SET status = 'agendado'
//         WHERE id = OLD.ref_id AND status = 'finalizado';
//       END IF;
//       RETURN OLD;
//     ELSIF TG_OP = 'UPDATE' THEN
//       IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
//         IF NEW.ref_id IS NOT NULL THEN
//           UPDATE public.appointments
//           SET status = 'agendado'
//           WHERE id = NEW.ref_id AND status = 'finalizado';
//         END IF;
//       END IF;
//       RETURN NEW;
//     END IF;
//     RETURN NULL;
//   END;
//   $function$
//   
// FUNCTION seed_basic_wa_tags()
//   CREATE OR REPLACE FUNCTION public.seed_basic_wa_tags()
//    RETURNS void
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//       rec RECORD;
//   BEGIN
//       FOR rec IN SELECT id FROM public.companies LOOP
//           INSERT INTO public.whatsapp_tags (company_id, tag_name, source_table, source_field) VALUES
//           (rec.id, '[NOME_CLIENTE]', 'clients', 'name'),
//           (rec.id, '[DATA]', 'appointments', 'date'),
//           (rec.id, '[VALOR]', 'financial_titles', 'original_amount'),
//           (rec.id, '[PIX]', 'pix_gateways', 'pix_key'),
//           (rec.id, '[SERVICOS]', 'services', 'name')
//           ON CONFLICT DO NOTHING;
//       END LOOP;
//   END;
//   $function$
//   
// FUNCTION seed_payment_methods_for_company(uuid)
//   CREATE OR REPLACE FUNCTION public.seed_payment_methods_for_company(p_company_id uuid)
//    RETURNS void
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     INSERT INTO public.payment_methods (company_id, nome, tipo, baixa_automatica, exige_data, descricao_visivel) VALUES
//     (p_company_id, 'Dinheiro', 'dinheiro', true, false, true),
//     (p_company_id, 'Cartão Crédito', 'cartao_credito', true, false, true),
//     (p_company_id, 'Cartão Débito', 'cartao_debito', true, false, true),
//     (p_company_id, 'PIX', 'pix', true, false, true),
//     (p_company_id, 'PIX Agendado', 'pix', false, true, true),
//     (p_company_id, 'Convênio', 'convenio', false, true, true),
//     (p_company_id, 'Cheque', 'cheque', false, true, true)
//     ON CONFLICT (company_id, nome) DO NOTHING;
//   END;
//   $function$
//   
// FUNCTION set_financial_audit_fields()
//   CREATE OR REPLACE FUNCTION public.set_financial_audit_fields()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF TG_OP = 'INSERT' THEN
//       NEW.created_by = auth.uid();
//       NEW.updated_by = auth.uid();
//     ELSIF TG_OP = 'UPDATE' THEN
//       NEW.updated_by = auth.uid();
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION set_financial_audit_v2()
//   CREATE OR REPLACE FUNCTION public.set_financial_audit_v2()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       NEW.updated_at = NOW();
//       IF TG_OP = 'INSERT' THEN
//           NEW.created_by = auth.uid();
//           NEW.updated_by = auth.uid();
//       ELSIF TG_OP = 'UPDATE' THEN
//           NEW.updated_by = auth.uid();
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION set_tasks_created_by()
//   CREATE OR REPLACE FUNCTION public.set_tasks_created_by()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF NEW.created_by IS NULL THEN
//       NEW.created_by := auth.uid();
//     END IF;
//     RETURN NEW;
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
// FUNCTION sync_financial_transactions()
//   CREATE OR REPLACE FUNCTION public.sync_financial_transactions()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//      IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
//         UPDATE public.transactions 
//         SET status = 'confirmed', confirmed_at = NOW() 
//         WHERE financial_title_id = NEW.id AND status != 'confirmed';
//      END IF;
//      RETURN NEW;
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
// FUNCTION sync_transaction_on_title_paid()
//   CREATE OR REPLACE FUNCTION public.sync_transaction_on_title_paid()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
//       UPDATE public.transactions
//       SET status = 'confirmed', confirmed_at = NOW()
//       WHERE financial_title_id = NEW.id AND status != 'confirmed';
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//   

// --- TRIGGERS ---
// Table: financial_titles
//   trg_cancel_wa_on_title: CREATE TRIGGER trg_cancel_wa_on_title AFTER DELETE OR UPDATE ON public.financial_titles FOR EACH ROW EXECUTE FUNCTION cancel_related_wa_schedules()
//   trg_sync_financial_transactions: CREATE TRIGGER trg_sync_financial_transactions AFTER UPDATE ON public.financial_titles FOR EACH ROW EXECUTE FUNCTION sync_financial_transactions()
//   trg_sync_transaction_on_title_paid: CREATE TRIGGER trg_sync_transaction_on_title_paid AFTER UPDATE ON public.financial_titles FOR EACH ROW EXECUTE FUNCTION sync_transaction_on_title_paid()
//   trg_titles_audit: CREATE TRIGGER trg_titles_audit BEFORE INSERT OR UPDATE ON public.financial_titles FOR EACH ROW EXECUTE FUNCTION set_financial_audit_v2()
// Table: pix_gateways
//   trg_single_active_gateway: CREATE TRIGGER trg_single_active_gateway BEFORE INSERT OR UPDATE ON public.pix_gateways FOR EACH ROW EXECUTE FUNCTION enforce_single_active_gateway()
// Table: tasks
//   trg_tasks_set_created_by: CREATE TRIGGER trg_tasks_set_created_by BEFORE INSERT ON public.tasks FOR EACH ROW EXECUTE FUNCTION set_tasks_created_by()
// Table: transactions
//   on_transaction_cancelled_rollback_appointment: CREATE TRIGGER on_transaction_cancelled_rollback_appointment AFTER DELETE OR UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION rollback_appointment_status()
//   trg_cancel_wa_on_tx: CREATE TRIGGER trg_cancel_wa_on_tx AFTER DELETE OR UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION cancel_related_wa_schedules_tx()
//   trg_recalculate_title: CREATE TRIGGER trg_recalculate_title AFTER INSERT OR DELETE OR UPDATE OF status, amount, financial_title_id ON public.transactions FOR EACH ROW EXECUTE FUNCTION recalculate_financial_title()
//   trg_transactions_audit: CREATE TRIGGER trg_transactions_audit BEFORE INSERT OR UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION set_financial_audit_v2()

// --- INDEXES ---
// Table: cash_balance_history
//   CREATE UNIQUE INDEX cash_balance_history_company_id_data_key ON public.cash_balance_history USING btree (company_id, data)
// Table: client_custom_prices
//   CREATE UNIQUE INDEX client_custom_prices_client_id_service_id_key ON public.client_custom_prices USING btree (client_id, service_id)
// Table: companies
//   CREATE UNIQUE INDEX companies_passkey_key ON public.companies USING btree (passkey)
// Table: financial_titles
//   CREATE INDEX idx_titles_client_id ON public.financial_titles USING btree (client_id)
//   CREATE INDEX idx_titles_company_id ON public.financial_titles USING btree (company_id)
//   CREATE INDEX idx_titles_due_date ON public.financial_titles USING btree (due_date)
//   CREATE INDEX idx_titles_status ON public.financial_titles USING btree (status)
//   CREATE INDEX idx_titles_supplier_id ON public.financial_titles USING btree (supplier_id)
// Table: payment_methods
//   CREATE UNIQUE INDEX payment_methods_company_id_nome_key ON public.payment_methods USING btree (company_id, nome)
// Table: profiles
//   CREATE UNIQUE INDEX profiles_company_username_lower_idx ON public.profiles USING btree (company_id, lower(username))
// Table: transactions
//   CREATE INDEX idx_tx_client_id ON public.transactions USING btree (client_id)
//   CREATE INDEX idx_tx_company_id ON public.transactions USING btree (company_id)
//   CREATE INDEX idx_tx_status ON public.transactions USING btree (status)
//   CREATE INDEX idx_tx_supplier_id ON public.transactions USING btree (supplier_id)
//   CREATE INDEX idx_tx_transaction_date ON public.transactions USING btree (transaction_date)
//   CREATE UNIQUE INDEX transactions_ticket_id_key ON public.transactions USING btree (ticket_id)
// Table: whatsapp_tags
//   CREATE UNIQUE INDEX whatsapp_tags_company_id_tag_name_key ON public.whatsapp_tags USING btree (company_id, tag_name)

