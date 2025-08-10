/*
  # Arreglo completo del esquema de base de datos

  1. Verificar y arreglar todas las tablas
  2. Asegurar que todas las políticas RLS están configuradas correctamente
  3. Añadir datos de ejemplo
  4. Optimizar consultas con índices
*/

-- Asegurar que uuid-ossp esté disponible
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verificar y crear funciones necesarias
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, license)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'auxiliar'),
    NEW.raw_user_meta_data->>'license'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    license = EXCLUDED.license,
    updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Verificar estructura de todas las tablas
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('medico', 'auxiliar', 'admin')),
  license text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  species text NOT NULL,
  breed text NOT NULL,
  age text NOT NULL,
  weight numeric(5,2) NOT NULL,
  owner text NOT NULL,
  owner_phone text NOT NULL,
  owner_email text,
  owner_address text,
  admission_date timestamptz NOT NULL DEFAULT now(),
  diagnosis text NOT NULL,
  status text NOT NULL CHECK (status IN ('hospitalizado', 'alta', 'critico')),
  cage text NOT NULL,
  initial_budget numeric(12,2) NOT NULL DEFAULT 0,
  current_budget numeric(12,2) NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medication_name text NOT NULL,
  dose text NOT NULL,
  frequency text NOT NULL,
  route text NOT NULL CHECK (route IN ('oral', 'iv', 'im', 'sc', 'topica')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  instructions text,
  prescribed_by uuid NOT NULL REFERENCES auth.users(id),
  prescribed_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'completado', 'suspendido')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS administrations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id uuid NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  administered_by uuid NOT NULL REFERENCES auth.users(id),
  administered_at timestamptz NOT NULL,
  dose text NOT NULL,
  notes text,
  status text NOT NULL CHECK (status IN ('administrado', 'omitido', 'reaccion_adversa')),
  scheduled_time timestamptz,
  timing_status text CHECK (timing_status IN ('on-time', 'early', 'late')),
  cost numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kardex_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('medicacion', 'administracion', 'observacion', 'signo_vital', 'presupuesto', 'archivo')),
  content text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  related_medication_id uuid REFERENCES medications(id) ON DELETE SET NULL,
  related_file_id uuid,
  related_budget_transaction_id uuid
);

CREATE TABLE IF NOT EXISTS budget_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('deposit', 'charge', 'refund', 'adjustment')),
  amount numeric(10,2) NOT NULL,
  description text NOT NULL,
  related_medication_id uuid REFERENCES medications(id) ON DELETE SET NULL,
  related_administration_id uuid REFERENCES administrations(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  previous_balance numeric(10,2) NOT NULL,
  new_balance numeric(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS patient_files (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('image', 'document', 'lab_result', 'xray', 'other')),
  file_size bigint NOT NULL,
  file_url text NOT NULL,
  description text,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id),
  uploaded_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medication_costs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_name text UNIQUE NOT NULL,
  unit_cost numeric(10,2) NOT NULL,
  unit text NOT NULL,
  category text NOT NULL,
  supplier text NOT NULL,
  in_stock integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE kardex_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_costs ENABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Crear políticas para profiles
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Crear políticas para patients
CREATE POLICY "patients_select_all" ON patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "patients_insert_all" ON patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "patients_update_all" ON patients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "patients_delete_doctors" ON patients FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'medico')
);

-- Crear políticas para medications
CREATE POLICY "medications_select_all" ON medications FOR SELECT TO authenticated USING (true);
CREATE POLICY "medications_insert_doctors" ON medications FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'medico')
);
CREATE POLICY "medications_update_doctors" ON medications FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'medico')
);

-- Crear políticas para administrations
CREATE POLICY "administrations_select_all" ON administrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "administrations_insert_all" ON administrations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "administrations_update_all" ON administrations FOR UPDATE TO authenticated USING (true);

-- Crear políticas para kardex_entries
CREATE POLICY "kardex_select_all" ON kardex_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "kardex_insert_all" ON kardex_entries FOR INSERT TO authenticated WITH CHECK (true);

-- Crear políticas para budget_transactions
CREATE POLICY "budget_select_all" ON budget_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "budget_insert_all" ON budget_transactions FOR INSERT TO authenticated WITH CHECK (true);

-- Crear políticas para patient_files
CREATE POLICY "files_select_all" ON patient_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "files_insert_all" ON patient_files FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "files_delete_all" ON patient_files FOR DELETE TO authenticated USING (true);

-- Crear políticas para medication_costs
CREATE POLICY "costs_select_all" ON medication_costs FOR SELECT TO authenticated USING (true);
CREATE POLICY "costs_manage_doctors" ON medication_costs FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'medico')
);

-- Crear triggers para timestamps
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON profiles;
DROP TRIGGER IF EXISTS handle_updated_at_patients ON patients;
DROP TRIGGER IF EXISTS handle_updated_at_medications ON medications;
DROP TRIGGER IF EXISTS handle_updated_at_medication_costs ON medication_costs;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_patients
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_medications
  BEFORE UPDATE ON medications
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_medication_costs
  BEFORE UPDATE ON medication_costs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at);
CREATE INDEX IF NOT EXISTS idx_medications_patient_id ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_medications_status ON medications(status);
CREATE INDEX IF NOT EXISTS idx_administrations_patient_id ON administrations(patient_id);
CREATE INDEX IF NOT EXISTS idx_administrations_medication_id ON administrations(medication_id);
CREATE INDEX IF NOT EXISTS idx_kardex_patient_id ON kardex_entries(patient_id);
CREATE INDEX IF NOT EXISTS idx_budget_patient_id ON budget_transactions(patient_id);

-- Insertar datos de medicamentos solo si no existen
INSERT INTO medication_costs (medication_name, unit_cost, unit, category, supplier, in_stock) 
VALUES
  ('Omeprazol', 1200, 'mg', 'Gastroenterología', 'Laboratorio ABC', 500),
  ('Metronidazol', 800, 'mg', 'Antibióticos', 'Farmacia XYZ', 750),
  ('Amoxicilina', 1500, 'mg', 'Antibióticos', 'Laboratorio ABC', 300),
  ('Tramadol', 2500, 'mg', 'Analgésicos', 'Farmacia XYZ', 200),
  ('Dexametasona', 3000, 'mg', 'Corticosteroides', 'Laboratorio DEF', 150),
  ('Meloxicam', 2000, 'mg', 'Antiinflamatorios', 'Laboratorio ABC', 100),
  ('Ranitidina', 900, 'mg', 'Gastroenterología', 'Farmacia XYZ', 400),
  ('Ceftriaxona', 3500, 'mg', 'Antibióticos', 'Laboratorio DEF', 80),
  ('Furosemida', 1800, 'mg', 'Diuréticos', 'Laboratorio ABC', 250),
  ('Prednisolona', 2200, 'mg', 'Corticosteroides', 'Farmacia XYZ', 180)
ON CONFLICT (medication_name) DO NOTHING;