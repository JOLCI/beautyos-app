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
            foreignKeyName: 'agenda_blockers_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'agenda_blockers_professional_id_fkey'
            columns: ['professional_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
          {
            foreignKeyName: 'appointments_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'v_client_service_intervals'
            referencedColumns: ['service_id']
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
            foreignKeyName: 'cash_balance_history_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'cash_balance_history_fechado_por_fkey'
            columns: ['fechado_por']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'cash_balance_history_id_transacao_transferencia_fkey'
            columns: ['id_transacao_transferencia']
            isOneToOne: false
            referencedRelation: 'transactions'
            referencedColumns: ['id']
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
            foreignKeyName: 'cash_closures_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
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
          tipo_corpo: Database['public']['Enums']['checklist_body_type_enum']
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
          tipo_corpo: Database['public']['Enums']['checklist_body_type_enum']
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
          tipo_corpo?: Database['public']['Enums']['checklist_body_type_enum']
          ungueal_numero?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'checklist_body_map_checklist_response_id_fkey'
            columns: ['checklist_response_id']
            isOneToOne: false
            referencedRelation: 'checklist_responses'
            referencedColumns: ['id']
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
          tipo_resposta: Database['public']['Enums']['checklist_item_type_enum']
        }
        Insert: {
          checklist_id?: string | null
          criado_em?: string | null
          id?: string
          obrigatoria?: boolean | null
          pergunta: string
          tipo_resposta?: Database['public']['Enums']['checklist_item_type_enum']
        }
        Update: {
          checklist_id?: string | null
          criado_em?: string | null
          id?: string
          obrigatoria?: boolean | null
          pergunta?: string
          tipo_resposta?: Database['public']['Enums']['checklist_item_type_enum']
        }
        Relationships: [
          {
            foreignKeyName: 'checklist_items_checklist_id_fkey'
            columns: ['checklist_id']
            isOneToOne: false
            referencedRelation: 'checklists'
            referencedColumns: ['id']
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
            foreignKeyName: 'checklist_responses_appointment_id_fkey'
            columns: ['appointment_id']
            isOneToOne: false
            referencedRelation: 'appointments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'checklist_responses_appointment_id_fkey'
            columns: ['appointment_id']
            isOneToOne: false
            referencedRelation: 'v_client_service_intervals'
            referencedColumns: ['appointment_id']
          },
          {
            foreignKeyName: 'checklist_responses_checklist_id_fkey'
            columns: ['checklist_id']
            isOneToOne: false
            referencedRelation: 'checklists'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'checklist_responses_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'checklist_responses_respondido_por_fkey'
            columns: ['respondido_por']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
          tipo: Database['public']['Enums']['checklist_type_enum']
        }
        Insert: {
          ativo?: boolean | null
          company_id?: string | null
          criado_em?: string | null
          id?: string
          nome: string
          tipo?: Database['public']['Enums']['checklist_type_enum']
        }
        Update: {
          ativo?: boolean | null
          company_id?: string | null
          criado_em?: string | null
          id?: string
          nome?: string
          tipo?: Database['public']['Enums']['checklist_type_enum']
        }
        Relationships: [
          {
            foreignKeyName: 'checklists_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
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
          observacoes: string | null
          preco_padrao_original: number | null
          price: number
          service_id: string | null
          tipo_ajuste: Database['public']['Enums']['special_price_adj_enum'] | null
          tipo_especial: Database['public']['Enums']['special_price_type_enum'] | null
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
          tipo_ajuste?: Database['public']['Enums']['special_price_adj_enum'] | null
          tipo_especial?: Database['public']['Enums']['special_price_type_enum'] | null
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
          tipo_ajuste?: Database['public']['Enums']['special_price_adj_enum'] | null
          tipo_especial?: Database['public']['Enums']['special_price_type_enum'] | null
          valor_ajuste?: number | null
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
          {
            foreignKeyName: 'client_custom_prices_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'v_client_service_intervals'
            referencedColumns: ['service_id']
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
          {
            foreignKeyName: 'commission_rules_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'v_client_service_intervals'
            referencedColumns: ['service_id']
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
            foreignKeyName: 'commissions_appointment_id_fkey'
            columns: ['appointment_id']
            isOneToOne: false
            referencedRelation: 'v_client_service_intervals'
            referencedColumns: ['appointment_id']
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
          purchase_id: string | null
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
          purchase_id?: string | null
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
          purchase_id?: string | null
          status?: string
          supplier_id?: string | null
          type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'financial_titles_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'financial_titles_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'financial_titles_purchase_id_fkey'
            columns: ['purchase_id']
            isOneToOne: false
            referencedRelation: 'purchases'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'financial_titles_supplier_id_fkey'
            columns: ['supplier_id']
            isOneToOne: false
            referencedRelation: 'suppliers'
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
          {
            foreignKeyName: 'inventory_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'v_client_service_intervals'
            referencedColumns: ['service_id']
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
          tipo: Database['public']['Enums']['payment_method_type_enum']
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
          tipo?: Database['public']['Enums']['payment_method_type_enum']
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
          tipo?: Database['public']['Enums']['payment_method_type_enum']
        }
        Relationships: [
          {
            foreignKeyName: 'payment_methods_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
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
            foreignKeyName: 'purchases_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'v_client_service_intervals'
            referencedColumns: ['service_id']
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
            foreignKeyName: 'tasks_assigned_to_fkey'
            columns: ['assigned_to']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_company_id_fkey'
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
          tipo_transacao: Database['public']['Enums']['transaction_type_enum'] | null
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
          tipo_transacao?: Database['public']['Enums']['transaction_type_enum'] | null
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
          tipo_transacao?: Database['public']['Enums']['transaction_type_enum'] | null
          transaction_date?: string
          type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_financial_title_id_fkey'
            columns: ['financial_title_id']
            isOneToOne: false
            referencedRelation: 'financial_titles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_supplier_id_fkey'
            columns: ['supplier_id']
            isOneToOne: false
            referencedRelation: 'suppliers'
            referencedColumns: ['id']
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
            foreignKeyName: 'waitlist_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'waitlist_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'waitlist_professional_id_fkey'
            columns: ['professional_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'waitlist_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'waitlist_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'v_client_service_intervals'
            referencedColumns: ['service_id']
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
            foreignKeyName: 'whatsapp_message_schedules_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'whatsapp_message_schedules_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'whatsapp_message_schedules_related_title_id_fkey'
            columns: ['related_title_id']
            isOneToOne: false
            referencedRelation: 'financial_titles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'whatsapp_message_schedules_related_transaction_id_fkey'
            columns: ['related_transaction_id']
            isOneToOne: false
            referencedRelation: 'transactions'
            referencedColumns: ['id']
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
            foreignKeyName: 'whatsapp_tags_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
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
      checklist_body_type_enum: 'mao_esquerda' | 'mao_direita' | 'pe_esquerdo' | 'pe_direito'
      checklist_item_type_enum: 'texto' | 'numero' | 'data' | 'sim_nao' | 'produto'
      checklist_type_enum: 'cliente' | 'servico'
      payment_method_type_enum:
        | 'dinheiro'
        | 'cartao_credito'
        | 'cartao_debito'
        | 'pix'
        | 'convenio'
        | 'cheque'
      special_price_adj_enum: 'reais' | 'percentual'
      special_price_type_enum: 'acrescimo' | 'desconto' | 'promocao' | 'manual'
      transaction_type_enum: 'receita' | 'despesa' | 'transferencia_interna' | 'ajuste_caixa'
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
    Enums: {
      checklist_body_type_enum: ['mao_esquerda', 'mao_direita', 'pe_esquerdo', 'pe_direito'],
      checklist_item_type_enum: ['texto', 'numero', 'data', 'sim_nao', 'produto'],
      checklist_type_enum: ['cliente', 'servico'],
      payment_method_type_enum: [
        'dinheiro',
        'cartao_credito',
        'cartao_debito',
        'pix',
        'convenio',
        'cheque',
      ],
      special_price_adj_enum: ['reais', 'percentual'],
      special_price_type_enum: ['acrescimo', 'desconto', 'promocao', 'manual'],
      transaction_type_enum: ['receita', 'despesa', 'transferencia_interna', 'ajuste_caixa'],
    },
  },
} as const
