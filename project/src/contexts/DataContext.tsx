import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured, handleSupabaseError } from '../lib/supabase';
import { Patient, Medication, Administration, KardexEntry, BudgetTransaction, PatientFile } from '../types';
import { patients as mockPatients, medications as mockMedications, administrations as mockAdministrations, kardexEntries as mockKardexEntries } from '../data/mockData';

import { validateUserInput, sanitizeString } from '../utils/inputValidation';

interface MedicationCost {
  id: string;
  medication_name: string;
  unit_cost: number;
  unit: string;
  category: string;
  supplier: string;
  in_stock: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface ErrorInfo {
  type: 'network' | 'validation' | 'database' | 'unknown';
  message: string;
  timestamp: Date;
  operation?: string;
}

interface DataContextType {
  patients: Patient[];
  medications: Medication[];
  administrations: Administration[];
  kardexEntries: KardexEntry[];
  budgetTransactions: BudgetTransaction[];
  patientFiles: PatientFile[];
  medicationCosts: MedicationCost[];
  loading: boolean;
  error: string | null;
  errorHistory: ErrorInfo[];
  refreshData: () => Promise<void>;
  clearError: () => void;
  retryLastOperation: () => Promise<void>;
  getPatient: (id: string) => Patient | undefined;
  getMedicationsByPatient: (patientId: string) => Medication[];
  getAdministrationsByPatient: (patientId: string) => Administration[];
  getAdministrationsByMedication: (medicationId: string) => Administration[];
  getKardexByPatient: (patientId: string) => KardexEntry[];
  addPatient: (patient: Omit<Patient, 'id' | 'created_at' | 'updated_at' | 'budget_history' | 'files'>) => Promise<{ success: boolean; data?: Patient; error?: string }>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<{ success: boolean; error?: string }>;
  deletePatient: (id: string) => Promise<{ success: boolean; error?: string }>;
  addMedication: (medication: Omit<Medication, 'id' | 'prescribed_at' | 'created_at' | 'updated_at'>) => Promise<string>;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  addAdministration: (administration: Omit<Administration, 'id' | 'created_at'>) => Promise<string>;
  updateAdministration: (id: string, updates: Partial<Administration>) => void;
  deleteMedication?: (id: string) => Promise<{ success: boolean; error?: string }>;
  addKardexEntry: (entry: Omit<KardexEntry, 'id' | 'created_at'>) => Promise<string>;
  addBudgetTransaction: (transaction: Omit<BudgetTransaction, 'id' | 'created_at'>) => Promise<string>;
  addPatientFile: (file: Omit<PatientFile, 'id' | 'uploaded_at'>) => string;
  deletePatientFile: (id: string) => void;
  addMedicationCost: (cost: Omit<MedicationCost, 'id' | 'created_at' | 'updated_at'>) => string;
  updateMedicationCost: (id: string, updates: Partial<MedicationCost>) => void;
  deleteMedicationCost: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Estado para manejar si Supabase está disponible
  const [supabaseAvailable, setSupabaseAvailable] = useState<boolean | null>(null);
  
  // Inicializar con datos de demostración
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [medications, setMedications] = useState<Medication[]>(mockMedications);
  const [administrations, setAdministrations] = useState<Administration[]>(mockAdministrations);
  const [kardexEntries, setKardexEntries] = useState<KardexEntry[]>(mockKardexEntries);
  const [budgetTransactions, setBudgetTransactions] = useState<BudgetTransaction[]>([]);
  const [patientFiles, setPatientFiles] = useState<PatientFile[]>([]);
  const [medicationCosts, setMedicationCosts] = useState<MedicationCost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorHistory, setErrorHistory] = useState<ErrorInfo[]>([]);
  const [lastFailedOperation, setLastFailedOperation] = useState<(() => Promise<void>) | null>(null);
  const [operationQueue, setOperationQueue] = useState<Array<() => Promise<void>>>([]);

  // Probar conexión a Supabase al inicializar
  useEffect(() => {
    const testConnection = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        console.log('Supabase no está configurado, usando modo demostración');
        setSupabaseAvailable(false);
        return;
      }

      try {
        // Intentar una consulta simple para probar la conexión
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        if (error) {
          console.log('Supabase no está disponible, usando modo demostración:', error.message);
          setSupabaseAvailable(false);
        } else {
          console.log('Supabase conectado exitosamente');
          setSupabaseAvailable(true);
        }
      } catch (error) {
        console.log('Error probando conexión a Supabase, usando modo demostración:', error);
        setSupabaseAvailable(false);
      }
    };

    testConnection();
  }, []);

  // Función para agregar errores al historial
  const addError = (type: ErrorInfo['type'], message: string, operation?: string) => {
    const errorInfo: ErrorInfo = {
      type,
      message,
      timestamp: new Date(),
      operation
    };
    
    setErrorHistory(prev => [errorInfo, ...prev.slice(0, 9)]); // Mantener solo los últimos 10 errores
  };

  const clearError = () => {
    setError(null);
  };

  const retryLastOperation = async () => {
    if (lastFailedOperation) {
      await lastFailedOperation();
    }
  };

  // Subscripciones en tiempo real para Supabase
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase || !user || !supabaseAvailable) {
      return;
    }

    console.log('Configurando subscripciones en tiempo real...');

    // Subscripción para pacientes
    const patientsSubscription = supabase
      .channel('patients-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'patients' 
      }, (payload) => {
        console.log('Cambio en pacientes:', payload);
        refreshData();
      })
      .subscribe();

    // Subscripción para medicaciones
    const medicationsSubscription = supabase
      .channel('medications-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'medications' 
      }, (payload) => {
        console.log('Cambio en medicaciones:', payload);
        refreshData();
      })
      .subscribe();

    // Subscripción para administraciones
    const administrationsSubscription = supabase
      .channel('administrations-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'administrations' 
      }, (payload) => {
        console.log('Cambio en administraciones:', payload);
        refreshData();
      })
      .subscribe();

    // Subscripción para entradas del kardex
    const kardexSubscription = supabase
      .channel('kardex-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'kardex_entries' 
      }, (payload) => {
        console.log('Cambio en kardex:', payload);
        refreshData();
      })
      .subscribe();

    return () => {
      console.log('Limpiando subscripciones...');
      patientsSubscription.unsubscribe();
      medicationsSubscription.unsubscribe();
      administrationsSubscription.unsubscribe();
      kardexSubscription.unsubscribe();
    };
  }, [user, supabaseAvailable]);

  const refreshData = async () => {
    // Si Supabase no está disponible o no hay usuario, usar datos de demostración
    if (!isSupabaseConfigured() || !supabase || !user || supabaseAvailable === false) {
      console.log('Usando datos de demostración - Supabase no disponible o usuario no autenticado');
      setLoading(false);
      return;
    }

    // Si todavía estamos probando la conexión, esperar
    if (supabaseAvailable === null) {
      console.log('Esperando prueba de conexión a Supabase...');
      return;
    }

    setLoading(true);
    clearError();

    try {
      // Cargar pacientes
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (patientsError) throw patientsError;

      // Convertir datos de Supabase al tipo Patient
      const formattedPatients: Patient[] = (patientsData || []).map(patient => ({
        ...patient,
        budget_history: [],
        files: []
      }));

      setPatients(formattedPatients);

      // Cargar medicaciones
      const { data: medicationsData, error: medicationsError } = await supabase
        .from('medications')
        .select('*')
        .order('created_at', { ascending: false });

      if (medicationsError) throw medicationsError;
      setMedications(medicationsData || []);

      // Cargar administraciones
      const { data: administrationsData, error: administrationsError } = await supabase
        .from('administrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (administrationsError) throw administrationsError;
      setAdministrations(administrationsData || []);

      // Cargar entradas del kardex
      const { data: kardexData, error: kardexError } = await supabase
        .from('kardex_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (kardexError) throw kardexError;
      setKardexEntries(kardexData || []);

      // Cargar transacciones de presupuesto
      const { data: budgetData, error: budgetError } = await supabase
        .from('budget_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (budgetError) throw budgetError;
      setBudgetTransactions(budgetData || []);

      // Cargar archivos de pacientes
      const { data: filesData, error: filesError } = await supabase
        .from('patient_files')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (filesError) throw filesError;
      setPatientFiles(filesData || []);

      // Cargar costos de medicamentos
      const { data: costsData, error: costsError } = await supabase
        .from('medication_costs')
        .select('*')
        .order('created_at', { ascending: false });

      if (costsError) throw costsError;
      setMedicationCosts(costsData || []);

      console.log('Datos actualizados desde Supabase');
    } catch (error) {
      setLastFailedOperation(() => refreshData);
      
      // Si hay error de conexión, cambiar a modo demostración
      if (error && typeof error.message === 'string' && error.message.includes('Failed to fetch')) {
        console.warn('Error de conexión a Supabase, cambiando a modo demostración:', error);
        setSupabaseAvailable(false);
        addError('network', 'Conectado en modo demostración - Supabase no disponible', 'refreshData');
        // No mostrar error al usuario ya que es un comportamiento normal
      } else {
        console.error('Error actualizando datos:', error);
        addError('database', handleSupabaseError(error), 'refreshData');
        setError(handleSupabaseError(error));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && supabaseAvailable !== null) {
      refreshData();
    }
  }, [user, supabaseAvailable]);

  // Funciones auxiliares
  const getPatient = (id: string) => {
    return patients.find(p => p.id === id);
  };

  const getMedicationsByPatient = (patientId: string) => {
    return medications.filter(m => m.patient_id === patientId);
  };

  const getAdministrationsByPatient = (patientId: string) => {
    return administrations.filter(a => a.patient_id === patientId);
  };

  const getAdministrationsByMedication = (medicationId: string) => {
    return administrations.filter(a => a.medication_id === medicationId);
  };

  const getKardexByPatient = (patientId: string) => {
    return kardexEntries.filter(k => k.patient_id === patientId);
  };

  // Operaciones CRUD
  const addPatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at' | 'budget_history' | 'files'>) => {
    // Validar datos de entrada
    const validationErrors = [];
    if (!patientData.name?.trim()) validationErrors.push('Nombre del paciente requerido');
    if (!patientData.owner?.trim()) validationErrors.push('Nombre del propietario requerido');
    if (!patientData.diagnosis?.trim()) validationErrors.push('Diagnóstico requerido');
    if (!patientData.cage?.trim()) validationErrors.push('Jaula requerida');
    if (!patientData.species?.trim()) validationErrors.push('Especie requerida');
    if (!patientData.breed?.trim()) validationErrors.push('Raza requerida');
    if (!patientData.age?.trim()) validationErrors.push('Edad requerida');
    if (!patientData.owner_phone?.trim()) validationErrors.push('Teléfono del propietario requerido');
    
    if (validationErrors.length > 0) {
      addError('validation', validationErrors.join(', '), 'addPatient');
      return { success: false, error: validationErrors.join(', ') };
    }

    // No cambiar el loading global, solo manejar localmente

    try {
      if (!isSupabaseConfigured() || !supabase || !supabaseAvailable) {
        // Modo demostración
        const id = crypto.randomUUID();
        const newPatient: Patient = {
          id,
          name: sanitizeString(patientData.name),
          species: sanitizeString(patientData.species),
          breed: sanitizeString(patientData.breed),
          age: sanitizeString(patientData.age),
          weight: patientData.weight,
          owner: sanitizeString(patientData.owner),
          owner_phone: sanitizeString(patientData.owner_phone),
          owner_email: patientData.owner_email ? sanitizeString(patientData.owner_email) : undefined,
          owner_address: patientData.owner_address ? sanitizeString(patientData.owner_address) : undefined,
          admission_date: patientData.admission_date,
          diagnosis: sanitizeString(patientData.diagnosis),
          status: patientData.status,
          cage: sanitizeString(patientData.cage),
          initial_budget: patientData.initial_budget,
          current_budget: patientData.current_budget,
          budget_history: [],
          files: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setPatients(prev => [newPatient, ...prev]);
        return { success: true, data: newPatient };
      }

      // Modo Supabase
      
      const { data, error } = await supabase
        .from('patients')
        .insert([{
          name: sanitizeString(patientData.name),
          species: sanitizeString(patientData.species),
          breed: sanitizeString(patientData.breed),
          age: sanitizeString(patientData.age),
          weight: patientData.weight,
          owner: sanitizeString(patientData.owner),
          owner_phone: sanitizeString(patientData.owner_phone),
          owner_email: patientData.owner_email ? sanitizeString(patientData.owner_email) : null,
          owner_address: patientData.owner_address ? sanitizeString(patientData.owner_address) : null,
          admission_date: patientData.admission_date,
          diagnosis: sanitizeString(patientData.diagnosis),
          status: patientData.status,
          cage: sanitizeString(patientData.cage),
          initial_budget: patientData.initial_budget,
          current_budget: patientData.current_budget,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      const newPatient: Patient = {
        ...data,
        budget_history: [],
        files: []
      };

      // Actualizar estado local
      setPatients(prev => [newPatient, ...prev]);

      // Crear transacción inicial si hay presupuesto
      if (patientData.initial_budget > 0) {
        await supabase
          .from('budget_transactions')
          .insert([{
            patient_id: data.id,
            type: 'deposit',
            amount: patientData.initial_budget,
            description: 'Depósito inicial de presupuesto',
            created_by: user?.id,
            previous_balance: 0,
            new_balance: patientData.initial_budget
          }]);

        await supabase
          .from('kardex_entries')
          .insert([{
            patient_id: data.id,
            type: 'presupuesto',
            content: `Presupuesto inicial establecido: $${patientData.initial_budget.toLocaleString()}`,
            created_by: user?.id
          }]);

        await supabase
          .from('kardex_entries')
          .insert([{
            patient_id: data.id,
            type: 'observacion',
            content: `Paciente ingresado a hospitalización. Diagnóstico: ${patientData.diagnosis}`,
            created_by: user?.id
          }]);
      }

      return { success: true, data: newPatient };
    } catch (error) {
      console.error('Error agregando paciente:', error);
      setLastFailedOperation(() => addPatient(patientData));
      addError('database', handleSupabaseError(error), 'addPatient');
      return { success: false, error: handleSupabaseError(error) };
    }
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        // Modo demostración
        setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p));
        return { success: true };
      }

      // Modo Supabase
      const { error } = await supabase
        .from('patients')
        .update({
          name: updates.name ? sanitizeString(updates.name) : undefined,
          species: updates.species ? sanitizeString(updates.species) : undefined,
          breed: updates.breed ? sanitizeString(updates.breed) : undefined,
          age: updates.age ? sanitizeString(updates.age) : undefined,
          weight: updates.weight,
          owner: updates.owner ? sanitizeString(updates.owner) : undefined,
          owner_phone: updates.owner_phone ? sanitizeString(updates.owner_phone) : undefined,
          owner_email: updates.owner_email ? sanitizeString(updates.owner_email) : undefined,
          owner_address: updates.owner_address ? sanitizeString(updates.owner_address) : undefined,
          admission_date: updates.admission_date,
          diagnosis: updates.diagnosis ? sanitizeString(updates.diagnosis) : undefined,
          status: updates.status,
          cage: updates.cage ? sanitizeString(updates.cage) : undefined,
          initial_budget: updates.initial_budget,
          current_budget: updates.current_budget,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Actualizar estado local
      setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p));
      
      return { success: true };
    } catch (error) {
      console.error('Error actualizando paciente:', error);
      setLastFailedOperation(() => updatePatient(id, updates));
      addError('database', handleSupabaseError(error), 'updatePatient');
      return { success: false, error: handleSupabaseError(error) };
    }
  };

  const deletePatient = async (id: string) => {
    try {
      if (!isSupabaseConfigured() || !supabase || !supabaseAvailable) {
        // Modo demostración
        setPatients(prev => prev.filter(p => p.id !== id));
        setMedications(prev => prev.filter(m => m.patient_id !== id));
        setAdministrations(prev => prev.filter(a => a.patient_id !== id));
        setKardexEntries(prev => prev.filter(k => k.patient_id !== id));
        setBudgetTransactions(prev => prev.filter(bt => bt.patient_id !== id));
        setPatientFiles(prev => prev.filter(pf => pf.patient_id !== id));
        return { success: true };
      }

      // Modo Supabase
      setLoading(true);

      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Actualizar estado local
      setPatients(prev => prev.filter(p => p.id !== id));
      setMedications(prev => prev.filter(m => m.patient_id !== id));
      setAdministrations(prev => prev.filter(a => a.patient_id !== id));
      setKardexEntries(prev => prev.filter(k => k.patient_id !== id));
      setBudgetTransactions(prev => prev.filter(bt => bt.patient_id !== id));
      setPatientFiles(prev => prev.filter(pf => pf.patient_id !== id));
      
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Error eliminando paciente:', error);
      setLastFailedOperation(() => deletePatient(id));
      addError('database', handleSupabaseError(error), 'deletePatient');
      setLoading(false);
      return { success: false, error: handleSupabaseError(error) };
    }
  };

  const addMedication = async (medicationData: Omit<Medication, 'id' | 'prescribed_at' | 'created_at' | 'updated_at'>) => {
    const id = crypto.randomUUID();
    
    const newMedication: Medication = {
      patient_id: medicationData.patient_id,
      medication_name: sanitizeString(medicationData.medication_name),
      dose: sanitizeString(medicationData.dose),
      frequency: sanitizeString(medicationData.frequency),
      route: medicationData.route,
      start_date: medicationData.start_date,
      end_date: medicationData.end_date,
      instructions: medicationData.instructions ? sanitizeString(medicationData.instructions) : '',
      prescribed_by: medicationData.prescribed_by,
      status: medicationData.status,
      id,
      prescribed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      if (isSupabaseConfigured() && supabase && supabaseAvailable) {
        // Enviar a Supabase y esperar a que complete
        const { error } = await supabase
          .from('medications')
          .insert([{
            patient_id: medicationData.patient_id,
            medication_name: sanitizeString(medicationData.medication_name),
            dose: sanitizeString(medicationData.dose),
            frequency: sanitizeString(medicationData.frequency),
            route: medicationData.route,
            start_date: medicationData.start_date,
            end_date: medicationData.end_date,
            instructions: medicationData.instructions ? sanitizeString(medicationData.instructions) : null,
            prescribed_by: medicationData.prescribed_by,
            status: medicationData.status,
            id,
            prescribed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) {
          console.error('Error guardando medicación:', error);
          throw error;
        }
      }

      setMedications(prev => [newMedication, ...prev]);
      return id;
    } catch (error) {
      console.error('Error agregando medicación:', error);
      setLastFailedOperation(() => addMedication(medicationData));
      addError('database', handleSupabaseError(error), 'addMedication');
      throw new Error(`Error guardando medicación: ${handleSupabaseError(error)}`);
    }
  };

  const updateMedication = (id: string, updates: Partial<Medication>) => {
    if (isSupabaseConfigured() && supabase && supabaseAvailable) {
      // Enviar a Supabase
      supabase
        .from('medications')
        .update({
          medication_name: updates.medication_name ? sanitizeString(updates.medication_name) : undefined,
          dose: updates.dose ? sanitizeString(updates.dose) : undefined,
          frequency: updates.frequency ? sanitizeString(updates.frequency) : undefined,
          route: updates.route,
          start_date: updates.start_date,
          end_date: updates.end_date,
          instructions: updates.instructions ? sanitizeString(updates.instructions) : undefined,
          status: updates.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Error actualizando medicación:', error);
            addError('database', handleSupabaseError(error), 'updateMedication');
          }
        });
    }

    setMedications(prev => prev.map(m => m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m));
  };

  const deleteMedication = async (id: string) => {
    try {
      if (isSupabaseConfigured() && supabase && supabaseAvailable) {
        const { error } = await supabase
          .from('medications')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error eliminando medicación:', error);
          return { success: false, error: handleSupabaseError(error) };
        }
      }

      // Actualizar estado local
      setMedications(prev => prev.filter(m => m.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error eliminando medicación:', error);
      return { success: false, error: handleSupabaseError(error) };
    }
  };

  const addAdministration = async (administrationData: Omit<Administration, 'id' | 'created_at'>) => {
    const id = crypto.randomUUID();
    
    try {
      if (isSupabaseConfigured() && supabase && supabaseAvailable) {
        // Enviar a Supabase y esperar confirmación
        const { error } = await supabase
          .from('administrations')
          .insert([{
            medication_id: administrationData.medication_id,
            patient_id: administrationData.patient_id,
            administered_by: administrationData.administered_by,
            administered_at: administrationData.administered_at,
            dose: sanitizeString(administrationData.dose),
            notes: administrationData.notes ? sanitizeString(administrationData.notes) : null,
            status: administrationData.status,
            scheduled_time: administrationData.scheduled_time,
            timing_status: administrationData.timing_status,
            cost: administrationData.cost,
            id,
            created_at: new Date().toISOString()
          }]);
        
        if (error) {
          console.error('Error guardando administración:', error);
          throw error;
        }
      }

      const newAdministration: Administration = {
        medication_id: administrationData.medication_id,
        patient_id: administrationData.patient_id,
        administered_by: administrationData.administered_by,
        administered_at: administrationData.administered_at,
        dose: sanitizeString(administrationData.dose),
        notes: administrationData.notes ? sanitizeString(administrationData.notes) : undefined,
        status: administrationData.status,
        scheduled_time: administrationData.scheduled_time,
        timing_status: administrationData.timing_status,
        cost: administrationData.cost,
        id,
        created_at: new Date().toISOString()
      };

      setAdministrations(prev => [newAdministration, ...prev]);
      return id;
    } catch (error) {
      console.error('Error agregando administración:', error);
      setLastFailedOperation(() => addAdministration(administrationData));
      addError('database', handleSupabaseError(error), 'addAdministration');
      throw new Error(`Error guardando administración: ${handleSupabaseError(error)}`);
    }
  };

  const updateAdministration = (id: string, updates: Partial<Administration>) => {
    if (isSupabaseConfigured() && supabase && supabaseAvailable) {
      // Enviar a Supabase
      supabase
        .from('administrations')
        .update({
          dose: updates.dose ? sanitizeString(updates.dose) : undefined,
          notes: updates.notes ? sanitizeString(updates.notes) : undefined,
          status: updates.status,
          administered_at: updates.administered_at,
          scheduled_time: updates.scheduled_time,
          timing_status: updates.timing_status,
          cost: updates.cost
        })
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Error actualizando administración:', error);
            addError('database', handleSupabaseError(error), 'updateAdministration');
          }
        });
    }

    setAdministrations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const addKardexEntry = async (entryData: Omit<KardexEntry, 'id' | 'created_at'>) => {
    const id = crypto.randomUUID();
    
    try {
      if (isSupabaseConfigured() && supabase && supabaseAvailable) {
        // Enviar a Supabase y esperar confirmación
        const { error } = await supabase
          .from('kardex_entries')
          .insert([{
            patient_id: entryData.patient_id,
            type: entryData.type,
            content: sanitizeString(entryData.content),
            created_by: entryData.created_by,
            related_medication_id: entryData.related_medication_id,
            related_file_id: entryData.related_file_id,
            related_budget_transaction_id: entryData.related_budget_transaction_id,
            id,
            created_at: new Date().toISOString()
          }]);

        if (error) {
          console.error('Error guardando entrada de kardex:', error);
          throw error;
        }
      }

      const newEntry: KardexEntry = {
        patient_id: entryData.patient_id,
        type: entryData.type,
        content: sanitizeString(entryData.content),
        created_by: entryData.created_by,
        related_medication_id: entryData.related_medication_id,
        related_file_id: entryData.related_file_id,
        related_budget_transaction_id: entryData.related_budget_transaction_id,
        id,
        created_at: new Date().toISOString()
      };

      setKardexEntries(prev => [newEntry, ...prev]);
      return id;
    } catch (error) {
      console.error('Error agregando entrada de kardex:', error);
      setLastFailedOperation(() => addKardexEntry(entryData));
      addError('database', handleSupabaseError(error), 'addKardexEntry');
      throw new Error(`Error guardando entrada de kardex: ${handleSupabaseError(error)}`);
    }
  };

  const addBudgetTransaction = async (transactionData: Omit<BudgetTransaction, 'id' | 'created_at'>) => {
    const id = crypto.randomUUID();
    
    try {
      if (isSupabaseConfigured() && supabase && supabaseAvailable) {
        // Enviar a Supabase y esperar confirmación
        const { error } = await supabase
          .from('budget_transactions')
          .insert([{
            patient_id: transactionData.patient_id,
            type: transactionData.type,
            amount: transactionData.amount,
            description: sanitizeString(transactionData.description),
            related_medication_id: transactionData.related_medication_id,
            related_administration_id: transactionData.related_administration_id,
            created_by: transactionData.created_by,
            previous_balance: transactionData.previous_balance,
            new_balance: transactionData.new_balance,
            id,
            created_at: new Date().toISOString()
          }]);
        
        if (error) {
          console.error('Error guardando transacción:', error);
          throw error;
        }
      }

      const newTransaction: BudgetTransaction = {
        patient_id: transactionData.patient_id,
        type: transactionData.type,
        amount: transactionData.amount,
        description: sanitizeString(transactionData.description),
        related_medication_id: transactionData.related_medication_id,
        related_administration_id: transactionData.related_administration_id,
        created_by: transactionData.created_by,
        previous_balance: transactionData.previous_balance,
        new_balance: transactionData.new_balance,
        id,
        created_at: new Date().toISOString()
      };

      setBudgetTransactions(prev => [newTransaction, ...prev]);

      // Actualizar historial del paciente
      setPatients(prev => prev.map(p => 
        p.id === transactionData.patient_id 
          ? { ...p, budget_history: [...p.budget_history, newTransaction] }
          : p
      ));

      return id;
    } catch (error) {
      console.error('Error agregando transacción:', error);
      setLastFailedOperation(() => addBudgetTransaction(transactionData));
      addError('database', handleSupabaseError(error), 'addBudgetTransaction');
      throw new Error(`Error guardando transacción: ${handleSupabaseError(error)}`);
    }
  };

  const addPatientFile = (fileData: Omit<PatientFile, 'id' | 'uploaded_at'>) => {
    const id = crypto.randomUUID();
    
    if (isSupabaseConfigured() && supabase && supabaseAvailable) {
      // Enviar a Supabase
      supabase
        .from('patient_files')
        .insert([{
          patient_id: fileData.patient_id,
          file_name: sanitizeString(fileData.file_name),
          file_type: fileData.file_type,
          file_size: fileData.file_size,
          file_url: fileData.file_url,
          description: fileData.description ? sanitizeString(fileData.description) : null,
          uploaded_by: fileData.uploaded_by,
          id,
          uploaded_at: new Date().toISOString()
        }])
        .then(({ error }) => {
          if (error) {
            console.error('Error guardando archivo:', error);
            addError('database', handleSupabaseError(error), 'addPatientFile');
          }
        });
    }

    const newFile: PatientFile = {
      patient_id: fileData.patient_id,
      file_name: sanitizeString(fileData.file_name),
      file_type: fileData.file_type,
      file_size: fileData.file_size,
      file_url: fileData.file_url,
      description: fileData.description ? sanitizeString(fileData.description) : undefined,
      uploaded_by: fileData.uploaded_by,
      id,
      uploaded_at: new Date().toISOString()
    };

    setPatientFiles(prev => [newFile, ...prev]);

    // Actualizar archivos del paciente
    setPatients(prev => prev.map(p => 
      p.id === fileData.patient_id 
        ? { ...p, files: [...p.files, newFile] }
        : p
    ));

    return id;
  };

  const deletePatientFile = (id: string) => {
    if (isSupabaseConfigured() && supabase && supabaseAvailable) {
      // Eliminar de Supabase
      supabase
        .from('patient_files')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Error eliminando archivo:', error);
            addError('database', handleSupabaseError(error), 'deletePatientFile');
          }
        });
    }

    setPatientFiles(prev => prev.filter(f => f.id !== id));
    
    // Remover de los archivos del paciente
    setPatients(prev => prev.map(p => ({
      ...p,
      files: p.files.filter(f => f.id !== id)
    })));
  };

  const addMedicationCost = (costData: Omit<MedicationCost, 'id' | 'created_at' | 'updated_at'>) => {
    const id = crypto.randomUUID();
    
    if (isSupabaseConfigured() && supabase && supabaseAvailable) {
      // Enviar a Supabase
      supabase
        .from('medication_costs')
        .insert([{
          ...costData,
          id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .then(({ error }) => {
          if (error) console.error('Error guardando costo de medicamento:', error);
        });
    }

    const newCost: MedicationCost = {
      ...costData,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setMedicationCosts(prev => [newCost, ...prev]);
    return id;
  };

  const updateMedicationCost = (id: string, updates: Partial<MedicationCost>) => {
    if (isSupabaseConfigured() && supabase && supabaseAvailable) {
      // Enviar a Supabase
      supabase
        .from('medication_costs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error actualizando costo:', error);
        });
    }

    setMedicationCosts(prev => prev.map(c => c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c));
  };

  const deleteMedicationCost = (id: string) => {
    if (isSupabaseConfigured() && supabase && supabaseAvailable) {
      // Eliminar de Supabase
      supabase
        .from('medication_costs')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Error eliminando medicamento:', error);
            addError('database', handleSupabaseError(error), 'deleteMedicationCost');
          } else {
            setMedicationCosts(prev => prev.filter(c => c.id !== id));
          }
        });
    } else {
    }
  }

  const value = {
    patients,
    medications,
    administrations,
    kardexEntries,
    budgetTransactions,
    patientFiles,
    medicationCosts,
    loading,
    error,
    errorHistory,
    clearError,
    retryLastOperation,
    refreshData,
    getPatient,
    getMedicationsByPatient,
    getAdministrationsByPatient,
    getAdministrationsByMedication,
    getKardexByPatient,
    addPatient,
    updatePatient,
    deletePatient,
    addMedication,
    updateMedication,
    deleteMedication,
    addAdministration,
    updateAdministration,
    addKardexEntry,
    addBudgetTransaction,
    addPatientFile,
    deletePatientFile,
    addMedicationCost,
    updateMedicationCost,
    deleteMedicationCost
  };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};