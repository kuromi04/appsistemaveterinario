/*
  # Schema inicial para Animal Sweet - Kardex Veterinario

  1. Funciones auxiliares
    - handle_updated_at: Para manejar timestamps automáticos
    - handle_new_user: Para crear perfiles automáticamente

  2. Tablas principales
    - profiles: Perfiles de usuario extendidos
    - patients: Información de pacientes
    - medications: Medicaciones prescritas
    - administrations: Registro de administraciones
    - kardex_entries: Entradas del kardex
    - budget_transactions: Transacciones de presupuesto
    - patient_files: Archivos médicos
    - medication_costs: Costos de medicamentos

  3. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas basadas en roles
    - Triggers para timestamps automáticos
*/

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read patients" ON patients;
DROP POLICY IF EXISTS "Authenticated users can insert patients" ON patients;
DROP POLICY IF EXISTS "Authenticated users can update patients" ON patients;
DROP POLICY IF EXISTS "Only doctors can delete patients" ON patients;
DROP POLICY IF EXISTS "Authenticated users can read medications" ON medications;
DROP POLICY IF EXISTS "Only doctors can prescribe medications" ON medications;
DROP POLICY IF EXISTS "Only doctors can update medications" ON medications;
DROP POLICY IF EXISTS "Authenticated users can read administrations" ON administrations;
DROP POLICY IF EXISTS "Authenticated users can insert administrations" ON administrations;
DROP POLICY IF EXISTS "Authenticated users can update administrations" ON administrations;
DROP POLICY IF EXISTS "Authenticated users can read kardex entries" ON kardex_entries;
DROP POLICY IF EXISTS "Authenticated users can insert kardex entries" ON kardex_entries;
DROP POLICY IF EXISTS "Authenticated users can read budget transactions" ON budget_transactions;
DROP POLICY IF EXISTS "Authenticated users can insert budget transactions" ON budget_transactions;
DROP POLICY IF EXISTS "Authenticated users can read patient files" ON patient_files;
DROP POLICY IF EXISTS "Authenticated users can upload patient files" ON patient_files;
DROP POLICY IF EXISTS "Authenticated users can delete patient files" ON patient_files;
DROP POLICY IF EXISTS "Authenticated users can read medication costs" ON medication_costs;
DROP POLICY IF EXISTS "Only doctors can manage medication costs" ON medication_costs;

-- Eliminar triggers existentes si existen
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_updated_at_patients ON patients;
DROP TRIGGER IF EXISTS handle_updated_at_medications ON medications;
DROP TRIGGER IF EXISTS handle_updated_at_medication_costs ON medication_costs;

-- Crear función para manejar timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, license)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'auxiliar'),
    NEW.raw_user_meta_data->>'license'
  );
  RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('medico', 'auxiliar', 'admin')),
  license text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Tabla de pacientes
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

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Tabla de medicaciones
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

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Tabla de administraciones
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

ALTER TABLE administrations ENABLE ROW LEVEL SECURITY;

-- Tabla de entradas del kardex
CREATE TABLE IF NOT EXISTS kardex_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('medicacion', 'administracion', 'observacion', 'signo_vital', 'presupuesto', 'archivo')),
  content text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  related_medication_id uuid REFERENCES medications(id),
  related_file_id uuid,
  related_budget_transaction_id uuid
);

ALTER TABLE kardex_entries ENABLE ROW LEVEL SECURITY;

-- Tabla de transacciones de presupuesto
CREATE TABLE IF NOT EXISTS budget_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('deposit', 'charge', 'refund', 'adjustment')),
  amount numeric(10,2) NOT NULL,
  description text NOT NULL,
  related_medication_id uuid REFERENCES medications(id),
  related_administration_id uuid REFERENCES administrations(id),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  previous_balance numeric(10,2) NOT NULL,
  new_balance numeric(10,2) NOT NULL
);

ALTER TABLE budget_transactions ENABLE ROW LEVEL SECURITY;

-- Tabla de archivos de pacientes
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

ALTER TABLE patient_files ENABLE ROW LEVEL SECURITY;

-- Tabla de costos de medicamentos
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

ALTER TABLE medication_costs ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad para profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Crear políticas de seguridad para patients
CREATE POLICY "Authenticated users can read patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert patients"
  ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update patients"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Only doctors can delete patients"
  ON patients
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'medico'
    )
  );

-- Crear políticas de seguridad para medications
CREATE POLICY "Authenticated users can read medications"
  ON medications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only doctors can prescribe medications"
  ON medications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'medico'
    )
  );

CREATE POLICY "Only doctors can update medications"
  ON medications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'medico'
    )
  );

-- Crear políticas de seguridad para administrations
CREATE POLICY "Authenticated users can read administrations"
  ON administrations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert administrations"
  ON administrations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update administrations"
  ON administrations
  FOR UPDATE
  TO authenticated
  USING (true);

-- Crear políticas de seguridad para kardex_entries
CREATE POLICY "Authenticated users can read kardex entries"
  ON kardex_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert kardex entries"
  ON kardex_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Crear políticas de seguridad para budget_transactions
CREATE POLICY "Authenticated users can read budget transactions"
  ON budget_transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert budget transactions"
  ON budget_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Crear políticas de seguridad para patient_files
CREATE POLICY "Authenticated users can read patient files"
  ON patient_files
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can upload patient files"
  ON patient_files
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete patient files"
  ON patient_files
  FOR DELETE
  TO authenticated
  USING (true);

-- Crear políticas de seguridad para medication_costs
CREATE POLICY "Authenticated users can read medication costs"
  ON medication_costs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only doctors can manage medication costs"
  ON medication_costs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'medico'
    )
  );

-- Crear triggers para timestamps automáticos
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_patients
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_medications
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_medication_costs
  BEFORE UPDATE ON medication_costs
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Insertar datos iniciales de costos de medicamentos
INSERT INTO medication_costs (medication_name, unit_cost, unit, category, supplier, in_stock) VALUES
('Omeprazol', 1200, 'mg', 'Gastroenterología', 'Laboratorio ABC', 500),
('Metronidazol', 800, 'mg', 'Antibióticos', 'Farmacia XYZ', 750),
('Amoxicilina', 1500, 'mg', 'Antibióticos', 'Laboratorio ABC', 300),
('Tramadol', 2500, 'mg', 'Analgésicos', 'Farmacia XYZ', 200),
('Dexametasona', 3000, 'mg', 'Corticosteroides', 'Laboratorio DEF', 150)
ON CONFLICT (medication_name) DO NOTHING;