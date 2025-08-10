export interface User {
  id: string;
  name: string;
  email: string;
  role: 'medico' | 'auxiliar' | 'admin';
  license?: string;
}

export interface Patient {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: number;
  owner: string;
  owner_phone: string;
  owner_email?: string;
  owner_address?: string;
  admission_date: string;
  diagnosis: string;
  status: 'hospitalizado' | 'alta' | 'critico';
  cage: string;
  initial_budget: number;
  current_budget: number;
  budget_history: BudgetTransaction[];
  files: PatientFile[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetTransaction {
  id: string;
  patient_id: string;
  type: 'deposit' | 'charge' | 'refund' | 'adjustment';
  amount: number;
  description: string;
  related_medication_id?: string;
  related_administration_id?: string;
  created_by: string;
  created_at: string;
  previous_balance: number;
  new_balance: number;
}

export interface PatientFile {
  id: string;
  patient_id: string;
  file_name: string;
  file_type: 'image' | 'document' | 'lab_result' | 'xray' | 'other';
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
  description?: string;
  file_url: string;
}

export interface Medication {
  id: string;
  patient_id: string;
  medication_name: string;
  dose: string;
  frequency: string;
  route: 'oral' | 'iv' | 'im' | 'sc' | 'topica';
  start_date: string;
  end_date: string;
  instructions: string;
  prescribed_by: string;
  prescribed_at: string;
  status: 'activo' | 'completado' | 'suspendido';
  created_at?: string;
  updated_at?: string;
}

export interface Administration {
  id: string;
  medication_id: string;
  patient_id: string;
  administered_by: string;
  administered_at: string;
  dose: string;
  notes?: string;
  status: 'administrado' | 'omitido' | 'reaccion_adversa';
  scheduled_time?: string;
  timing_status?: 'on-time' | 'early' | 'late';
  cost?: number;
  budget_transaction_id?: string;
  created_at?: string;
}

export interface KardexEntry {
  id: string;
  patient_id: string;
  type: 'medicacion' | 'administracion' | 'observacion' | 'signo_vital' | 'presupuesto' | 'archivo';
  content: string;
  created_by: string;
  created_at: string;
  related_medication_id?: string;
  related_file_id?: string;
  related_budget_transaction_id?: string;
}

export interface MedicationScheduleEntry {
  id: string;
  medication_id: string;
  patient_id: string;
  scheduled_time: string;
  actual_time?: string;
  status: 'pending' | 'completed' | 'missed' | 'late';
  administered_by?: string;
  notes?: string;
  dose?: string;
  timing_status?: 'on-time' | 'early' | 'late';
}