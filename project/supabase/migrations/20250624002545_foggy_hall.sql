/*
  # Schema inicial para Animal Sweet - Kardex Veterinario

  1. Nuevas Tablas
    - `profiles` - Perfiles de usuario extendidos
    - `patients` - Información de pacientes
    - `medications` - Medicaciones prescritas
    - `administrations` - Registro de administraciones
    - `kardex_entries` - Entradas del kardex
    - `budget_transactions` - Transacciones de presupuesto
    - `patient_files` - Archivos médicos de pacientes
    - `medication_costs` - Costos de medicamentos

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para usuarios autenticados
    - Políticas específicas por rol (médico/auxiliar)

  3. Funciones
    - Función para crear perfil automáticamente
    - Triggers para auditoría
*/

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('medico', 'auxiliar', 'admin')),
  license TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT NOT NULL,
  age TEXT NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  owner TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  owner_email TEXT,
  owner_address TEXT,
  admission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diagnosis TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('hospitalizado', 'alta', 'critico')),
  cage TEXT NOT NULL,
  initial_budget DECIMAL(12,2) NOT NULL DEFAULT 0,
  current_budget DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de medicaciones
CREATE TABLE IF NOT EXISTS medications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  medication_name TEXT NOT NULL,
  dose TEXT NOT NULL,
  frequency TEXT NOT NULL,
  route TEXT NOT NULL CHECK (route IN ('oral', 'iv', 'im', 'sc', 'topica')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  instructions TEXT,
  prescribed_by UUID REFERENCES auth.users(id) NOT NULL,
  prescribed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'completado', 'suspendido')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de administraciones
CREATE TABLE IF NOT EXISTS administrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  administered_by UUID REFERENCES auth.users(id) NOT NULL,
  administered_at TIMESTAMPTZ NOT NULL,
  dose TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('administrado', 'omitido', 'reaccion_adversa')),
  scheduled_time TIMESTAMPTZ,
  timing_status TEXT CHECK (timing_status IN ('on-time', 'early', 'late')),
  cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de entradas del kardex
CREATE TABLE IF NOT EXISTS kardex_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('medicacion', 'administracion', 'observacion', 'signo_vital', 'presupuesto', 'archivo')),
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  related_medication_id UUID REFERENCES medications(id),
  related_file_id UUID,
  related_budget_transaction_id UUID
);

-- Tabla de transacciones de presupuesto
CREATE TABLE IF NOT EXISTS budget_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'charge', 'refund', 'adjustment')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  related_medication_id UUID REFERENCES medications(id),
  related_administration_id UUID REFERENCES administrations(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  previous_balance DECIMAL(10,2) NOT NULL,
  new_balance DECIMAL(10,2) NOT NULL
);

-- Tabla de archivos de pacientes
CREATE TABLE IF NOT EXISTS patient_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'document', 'lab_result', 'xray', 'other')),
  file_size BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de costos de medicamentos
CREATE TABLE IF NOT EXISTS medication_costs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  medication_name TEXT NOT NULL UNIQUE,
  unit_cost DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  category TEXT NOT NULL,
  supplier TEXT NOT NULL,
  in_stock INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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

-- Políticas para profiles
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

-- Políticas para patients (todos los usuarios autenticados pueden ver y gestionar pacientes)
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

-- Políticas para medications
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

-- Políticas para administrations
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

-- Políticas para kardex_entries
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

-- Políticas para budget_transactions
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

-- Políticas para patient_files
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

-- Políticas para medication_costs
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

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'auxiliar')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
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

-- Insertar datos iniciales de costos de medicamentos
INSERT INTO medication_costs (medication_name, unit_cost, unit, category, supplier, in_stock) VALUES
('Omeprazol', 1200, 'mg', 'Gastroenterología', 'Laboratorio ABC', 500),
('Metronidazol', 800, 'mg', 'Antibióticos', 'Farmacia XYZ', 750),
('Amoxicilina', 1500, 'mg', 'Antibióticos', 'Laboratorio ABC', 300),
('Tramadol', 2500, 'mg', 'Analgésicos', 'Farmacia XYZ', 200),
('Dexametasona', 3000, 'mg', 'Corticosteroides', 'Laboratorio DEF', 150)
ON CONFLICT (medication_name) DO NOTHING;