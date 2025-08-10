export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          role: 'medico' | 'auxiliar' | 'admin';
          license: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          role: 'medico' | 'auxiliar' | 'admin';
          license?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: 'medico' | 'auxiliar' | 'admin';
          license?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          name: string;
          species: string;
          breed: string;
          age: string;
          weight: number;
          owner: string;
          owner_phone: string;
          owner_email: string | null;
          owner_address: string | null;
          admission_date: string;
          diagnosis: string;
          status: 'hospitalizado' | 'alta' | 'critico';
          cage: string;
          initial_budget: number;
          current_budget: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          species: string;
          breed: string;
          age: string;
          weight: number;
          owner: string;
          owner_phone: string;
          owner_email?: string | null;
          owner_address?: string | null;
          admission_date?: string;
          diagnosis: string;
          status: 'hospitalizado' | 'alta' | 'critico';
          cage: string;
          initial_budget: number;
          current_budget: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          species?: string;
          breed?: string;
          age?: string;
          weight?: number;
          owner?: string;
          owner_phone?: string;
          owner_email?: string | null;
          owner_address?: string | null;
          admission_date?: string;
          diagnosis?: string;
          status?: 'hospitalizado' | 'alta' | 'critico';
          cage?: string;
          initial_budget?: number;
          current_budget?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      medications: {
        Row: {
          id: string;
          patient_id: string;
          medication_name: string;
          dose: string;
          frequency: string;
          route: 'oral' | 'iv' | 'im' | 'sc' | 'topica';
          start_date: string;
          end_date: string;
          instructions: string | null;
          prescribed_by: string;
          prescribed_at: string;
          status: 'activo' | 'completado' | 'suspendido';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          medication_name: string;
          dose: string;
          frequency: string;
          route: 'oral' | 'iv' | 'im' | 'sc' | 'topica';
          start_date: string;
          end_date: string;
          instructions?: string | null;
          prescribed_by: string;
          prescribed_at?: string;
          status?: 'activo' | 'completado' | 'suspendido';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          medication_name?: string;
          dose?: string;
          frequency?: string;
          route?: 'oral' | 'iv' | 'im' | 'sc' | 'topica';
          start_date?: string;
          end_date?: string;
          instructions?: string | null;
          prescribed_by?: string;
          prescribed_at?: string;
          status?: 'activo' | 'completado' | 'suspendido';
          created_at?: string;
          updated_at?: string;
        };
      };
      administrations: {
        Row: {
          id: string;
          medication_id: string;
          patient_id: string;
          administered_by: string;
          administered_at: string;
          dose: string;
          notes: string | null;
          status: 'administrado' | 'omitido' | 'reaccion_adversa';
          scheduled_time: string | null;
          timing_status: 'on-time' | 'early' | 'late' | null;
          cost: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          medication_id: string;
          patient_id: string;
          administered_by: string;
          administered_at: string;
          dose: string;
          notes?: string | null;
          status: 'administrado' | 'omitido' | 'reaccion_adversa';
          scheduled_time?: string | null;
          timing_status?: 'on-time' | 'early' | 'late' | null;
          cost?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          medication_id?: string;
          patient_id?: string;
          administered_by?: string;
          administered_at?: string;
          dose?: string;
          notes?: string | null;
          status?: 'administrado' | 'omitido' | 'reaccion_adversa';
          scheduled_time?: string | null;
          timing_status?: 'on-time' | 'early' | 'late' | null;
          cost?: number | null;
          created_at?: string;
        };
      };
      kardex_entries: {
        Row: {
          id: string;
          patient_id: string;
          type: 'medicacion' | 'administracion' | 'observacion' | 'signo_vital' | 'presupuesto' | 'archivo';
          content: string;
          created_by: string;
          created_at: string;
          related_medication_id: string | null;
          related_file_id: string | null;
          related_budget_transaction_id: string | null;
        };
        Insert: {
          id?: string;
          patient_id: string;
          type: 'medicacion' | 'administracion' | 'observacion' | 'signo_vital' | 'presupuesto' | 'archivo';
          content: string;
          created_by: string;
          created_at?: string;
          related_medication_id?: string | null;
          related_file_id?: string | null;
          related_budget_transaction_id?: string | null;
        };
        Update: {
          id?: string;
          patient_id?: string;
          type?: 'medicacion' | 'administracion' | 'observacion' | 'signo_vital' | 'presupuesto' | 'archivo';
          content?: string;
          created_by?: string;
          created_at?: string;
          related_medication_id?: string | null;
          related_file_id?: string | null;
          related_budget_transaction_id?: string | null;
        };
      };
      budget_transactions: {
        Row: {
          id: string;
          patient_id: string;
          type: 'deposit' | 'charge' | 'refund' | 'adjustment';
          amount: number;
          description: string;
          related_medication_id: string | null;
          related_administration_id: string | null;
          created_by: string;
          created_at: string;
          previous_balance: number;
          new_balance: number;
        };
        Insert: {
          id?: string;
          patient_id: string;
          type: 'deposit' | 'charge' | 'refund' | 'adjustment';
          amount: number;
          description: string;
          related_medication_id?: string | null;
          related_administration_id?: string | null;
          created_by: string;
          created_at?: string;
          previous_balance: number;
          new_balance: number;
        };
        Update: {
          id?: string;
          patient_id?: string;
          type?: 'deposit' | 'charge' | 'refund' | 'adjustment';
          amount?: number;
          description?: string;
          related_medication_id?: string | null;
          related_administration_id?: string | null;
          created_by?: string;
          created_at?: string;
          previous_balance?: number;
          new_balance?: number;
        };
      };
      patient_files: {
        Row: {
          id: string;
          patient_id: string;
          file_name: string;
          file_type: 'image' | 'document' | 'lab_result' | 'xray' | 'other';
          file_size: number;
          file_url: string;
          description: string | null;
          uploaded_by: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          file_name: string;
          file_type: 'image' | 'document' | 'lab_result' | 'xray' | 'other';
          file_size: number;
          file_url: string;
          description?: string | null;
          uploaded_by: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          file_name?: string;
          file_type?: 'image' | 'document' | 'lab_result' | 'xray' | 'other';
          file_size?: number;
          file_url?: string;
          description?: string | null;
          uploaded_by?: string;
          uploaded_at?: string;
        };
      };
      medication_costs: {
        Row: {
          id: string;
          medication_name: string;
          unit_cost: number;
          unit: string;
          category: string;
          supplier: string;
          in_stock: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          medication_name: string;
          unit_cost: number;
          unit: string;
          category: string;
          supplier: string;
          in_stock?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          medication_name?: string;
          unit_cost?: number;
          unit?: string;
          category?: string;
          supplier?: string;
          in_stock?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}