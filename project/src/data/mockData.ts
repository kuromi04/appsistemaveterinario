import { User, Patient, Medication, Administration, KardexEntry } from '../types';

export const users: User[] = [
  {
    id: '1',
    name: 'Dr. Ana García',
    email: 'ana.garcia@animalsweet.com',
    role: 'medico',
    license: 'MV001234'
  },
  {
    id: '2',
    name: 'Dr. Carlos Rodríguez',
    email: 'carlos.rodriguez@animalsweet.com',
    role: 'medico',
    license: 'MV005678'
  },
  {
    id: '3',
    name: 'María López',
    email: 'maria.lopez@animalsweet.com',
    role: 'auxiliar'
  },
  {
    id: '4',
    name: 'Pedro Sánchez',
    email: 'pedro.sanchez@animalsweet.com',
    role: 'auxiliar'
  }
];

export const patients: Patient[] = [
  {
    id: '1',
    name: 'Max',
    species: 'Canino',
    breed: 'Golden Retriever',
    age: '3 años',
    weight: 28.5,
    owner: 'Juan Pérez',
    owner_phone: '+57 300 123 4567',
    owner_email: 'juan.perez@email.com',
    owner_address: 'Calle 123 #45-67, Bogotá',
    admission_date: '2025-01-15T08:00:00Z',
    diagnosis: 'Gastroenteritis aguda',
    status: 'hospitalizado',
    cage: 'C-001',
    initial_budget: 800000,
    current_budget: 650000,
    budget_history: [],
    files: []
  },
  {
    id: '2',
    name: 'Luna',
    species: 'Felino',
    breed: 'Siamés',
    age: '2 años',
    weight: 4.2,
    owner: 'Ana Martínez',
    owner_phone: '+57 301 234 5678',
    owner_email: 'ana.martinez@email.com',
    owner_address: 'Carrera 45 #12-34, Medellín',
    admission_date: '2025-01-14T14:30:00Z',
    diagnosis: 'Infección respiratoria alta',
    status: 'critico',
    cage: 'C-002',
    initial_budget: 600000,
    current_budget: 480000,
    budget_history: [],
    files: []
  },
  {
    id: '3',
    name: 'Rocky',
    species: 'Canino',
    breed: 'Bulldog Francés',
    age: '5 años',
    weight: 12.8,
    owner: 'Carlos Gómez',
    owner_phone: '+57 302 345 6789',
    owner_email: 'carlos.gomez@email.com',
    owner_address: 'Avenida 68 #23-45, Cali',
    admission_date: '2025-01-16T10:15:00Z',
    diagnosis: 'Post-cirugía abdominal',
    status: 'hospitalizado',
    cage: 'C-003',
    initial_budget: 1200000,
    current_budget: 950000,
    budget_history: [],
    files: []
  }
];

export const medications: Medication[] = [
  {
    id: '1',
    patient_id: '1',
    medication_name: 'Omeprazol',
    dose: '20mg',
    frequency: 'Cada 12 horas',
    route: 'oral',
    start_date: '2025-01-15T08:00:00Z',
    end_date: '2025-01-20T08:00:00Z',
    instructions: 'Administrar en ayunas',
    prescribed_by: '1',
    prescribed_at: '2025-01-15T08:30:00Z',
    status: 'activo'
  },
  {
    id: '2',
    patient_id: '1',
    medication_name: 'Metronidazol',
    dose: '250mg',
    frequency: 'Cada 8 horas',
    route: 'oral',
    start_date: '2025-01-15T08:00:00Z',
    end_date: '2025-01-22T08:00:00Z',
    instructions: 'Administrar con alimento',
    prescribed_by: '1',
    prescribed_at: '2025-01-15T08:30:00Z',
    status: 'activo'
  },
  {
    id: '3',
    patient_id: '2',
    medication_name: 'Amoxicilina',
    dose: '125mg',
    frequency: 'Cada 12 horas',
    route: 'oral',
    start_date: '2025-01-14T14:30:00Z',
    end_date: '2025-01-21T14:30:00Z',
    instructions: 'Completar tratamiento',
    prescribed_by: '2',
    prescribed_at: '2025-01-14T15:00:00Z',
    status: 'activo'
  }
];

export const administrations: Administration[] = [
  {
    id: '1',
    medication_id: '1',
    patient_id: '1',
    administered_by: '3',
    administered_at: '2025-01-15T08:00:00Z',
    dose: '20mg',
    status: 'administrado',
    cost: 24000
  },
  {
    id: '2',
    medication_id: '2',
    patient_id: '1',
    administered_by: '3',
    administered_at: '2025-01-15T08:00:00Z',
    dose: '250mg',
    status: 'administrado',
    cost: 200000
  },
  {
    id: '3',
    medication_id: '1',
    patient_id: '1',
    administered_by: '4',
    administered_at: '2025-01-15T20:00:00Z',
    dose: '20mg',
    status: 'administrado',
    cost: 24000
  }
];

export const kardexEntries: KardexEntry[] = [
  {
    id: '1',
    patient_id: '1',
    type: 'medicacion',
    content: 'Prescripción: Omeprazol 20mg cada 12 horas',
    created_by: '1',
    created_at: '2025-01-15T08:30:00Z',
    related_medication_id: '1'
  },
  {
    id: '2',
    patient_id: '1',
    type: 'administracion',
    content: 'Administrado: Omeprazol 20mg - Sin reacciones adversas - Costo: $24,000',
    created_by: '3',
    created_at: '2025-01-15T08:00:00Z',
    related_medication_id: '1'
  },
  {
    id: '3',
    patient_id: '1',
    type: 'observacion',
    content: 'Paciente tolera bien la medicación. Apetito mejorado.',
    created_by: '3',
    created_at: '2025-01-15T12:00:00Z'
  },
  {
    id: '4',
    patient_id: '1',
    type: 'presupuesto',
    content: 'Presupuesto inicial establecido: $800,000',
    created_by: '1',
    created_at: '2025-01-15T08:00:00Z'
  }
];