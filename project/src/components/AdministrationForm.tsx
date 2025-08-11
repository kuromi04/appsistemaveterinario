import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Save, X, Pill, AlertCircle } from 'lucide-react';

interface AdministrationFormProps {
  patientId: string;
  medicationId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

const AdministrationForm: React.FC<AdministrationFormProps> = ({
  patientId,
  medicationId,
  onSubmit,
  onCancel
}) => {
  const { addAdministration, addKardexEntry, medications, patients, medicationCosts } = useData();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Obtener la fecha y hora actual en formato local
  const getCurrentLocalDateTime = () => {
    const now = new Date();
    // Formatear directamente en zona horaria local
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    administered_at: getCurrentLocalDateTime(),
    dose: '',
    notes: '',
    status: 'administrado' as const,
    cost: 0,
    timing_status: null as 'on-time' | 'early' | 'late' | null
  });

  // Obtener información del medicamento y paciente
  const medication = medications.find(m => m.id === medicationId);
  const patient = patients.find(p => p.id === patientId);
  const medicationCost = medicationCosts.find(mc => mc.medication_name === medication?.medication_name);

  // Verificar si el paciente está habilitado
  const isPatientEnabled = patient && 
    (patient.status === 'hospitalizado' || patient.status === 'critico');

  // Establecer dosis por defecto del medicamento
  React.useEffect(() => {
    if (medication && !formData.dose) {
      setFormData(prev => ({
        ...prev,
        dose: medication.dose,
        cost: medicationCost?.unit_cost || 0
      }));
    }
  }, [medication, medicationCost, formData.dose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !medication || !patient) return;

    // Validar que el paciente esté habilitado
    if (!isPatientEnabled) {
      setError('Solo se pueden administrar medicamentos a pacientes hospitalizados o en estado crítico');
      return;
    }

    // Validar que el medicamento esté activo
    if (medication.status !== 'activo') {
      setError('Solo se pueden administrar medicamentos con estado activo');
      return;
    }

    // Validar fechas del tratamiento
    const adminDate = new Date(formData.administered_at);
    const startDate = new Date(medication.start_date.includes('T') ? medication.start_date : medication.start_date + 'T00:00:00');
    const endDate = new Date(medication.end_date.includes('T') ? medication.end_date : medication.end_date + 'T23:59:59');

    // Comparar solo fechas, no horas para el rango de tratamiento
    const adminDateOnly = new Date(adminDate.getFullYear(), adminDate.getMonth(), adminDate.getDate());
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    if (adminDateOnly < startDateOnly || adminDateOnly > endDateOnly) {
      setError('La fecha de administración debe estar dentro del período de tratamiento');
      return;
    }

    // Calcular timing status basado en horarios programados
    let timingStatus: 'on-time' | 'early' | 'late' | null = null;
    const scheduledTimes = parseFrequency(medication.frequency);
    
    // Encontrar el horario programado más cercano
    let closestScheduledTime: Date | null = null;
    let minTimeDiff = Infinity;

    scheduledTimes.forEach(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledTime = new Date(adminDate);
      scheduledTime.setHours(hours, minutes, 0, 0);

      const timeDiff = Math.abs(adminDate.getTime() - scheduledTime.getTime());
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestScheduledTime = scheduledTime;
      }
    });

    let scheduledISOString: string | undefined;
    if (closestScheduledTime) {
      const cst = closestScheduledTime as Date;
      const timeDiffMinutes = (adminDate.getTime() - cst.getTime()) / (1000 * 60);

      if (Math.abs(timeDiffMinutes) <= 15) {
        timingStatus = 'on-time';
      } else if (timeDiffMinutes < -15) {
        timingStatus = 'early';
      } else if (timeDiffMinutes > 15) {
        timingStatus = 'late';
      }

      scheduledISOString = new Date(cst.getTime() - (cst.getTimezoneOffset() * 60000)).toISOString();
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convertir a formato ISO manteniendo zona horaria local
      const adminISOString = new Date(adminDate.getTime() - (adminDate.getTimezoneOffset() * 60000)).toISOString();

      await addAdministration({
        medication_id: medicationId,
        patient_id: patientId,
        administered_by: user.id,
        administered_at: adminISOString,
        dose: formData.dose,
        notes: formData.notes,
        status: formData.status,
        cost: formData.cost,
        scheduled_time: scheduledISOString,
        timing_status: timingStatus || undefined
      });

      // Crear entrada en el kardex
      const statusText = formData.status === 'administrado' ? 'administrado correctamente' :
                        formData.status === 'omitido' ? 'omitido' : 'causó reacción adversa';
      
      const timingText = timingStatus ? 
        (timingStatus === 'on-time' ? ' (a tiempo)' :
         timingStatus === 'early' ? ' (temprano)' : ' (tardío)') : '';
      
      await addKardexEntry({
        patient_id: patientId,
        type: 'administracion',
        content: `${medication.medication_name} ${formData.dose} ${statusText}${timingText}. Administrado por: ${user.name}. ${formData.notes ? `Notas: ${formData.notes}` : ''} Costo: $${formData.cost.toLocaleString()}`,
        created_by: user.id,
        related_medication_id: medicationId
      });

      onSubmit();
    } catch (error) {
      console.error('Error adding administration:', error);
      setError('Error al registrar la administración. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para parsear frecuencia y obtener horarios
  const parseFrequency = (frequency: string): string[] => {
    const lower = frequency.toLowerCase();
    
    if (lower.includes('cada 4') || lower.includes('cuatro veces')) {
      return ['06:00', '12:00', '18:00', '00:00'];
    } else if (lower.includes('cada 6') || lower.includes('seis horas')) {
      return ['06:00', '12:00', '18:00', '00:00'];
    } else if (lower.includes('cada 8') || lower.includes('3 veces') || lower.includes('tres veces')) {
      return ['08:00', '16:00', '00:00'];
    } else if (lower.includes('cada 12') || lower.includes('2 veces') || lower.includes('dos veces')) {
      return ['08:00', '20:00'];
    } else if (lower.includes('cada 24') || lower.includes('1 vez') || lower.includes('una vez') || lower.includes('diario') || lower.includes('diaria')) {
      return ['08:00'];
    }
    
    return ['08:00']; // Por defecto una vez al día
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  // Si no se encuentra el medicamento o paciente
  if (!medication || !patient) {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No se pudo encontrar la información del medicamento o paciente.
            </p>
            <button
              onClick={onCancel}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si el paciente no está habilitado
  if (!isPatientEnabled) {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Paciente No Habilitado</h3>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-center py-6">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg mb-4">
              <p className="text-yellow-800 dark:text-yellow-300">
                Solo se pueden administrar medicamentos a pacientes que estén:
              </p>
              <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                <li>• Hospitalizados</li>
                <li>• En estado crítico</li>
              </ul>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Estado actual del paciente: <span className="font-semibold">{patient.status}</span>
            </p>
            
            <button
              onClick={onCancel}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Registrar Administración</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {patient.name} - {medication.medication_name}
            </p>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Información del medicamento */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Pill className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-800 dark:text-blue-300">Información del Tratamiento</span>
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <p><strong>Medicamento:</strong> {medication.medication_name}</p>
            <p><strong>Dosis prescrita:</strong> {medication.dose}</p>
            <p><strong>Frecuencia:</strong> {medication.frequency}</p>
            <p><strong>Vía:</strong> {medication.route}</p>
            <p><strong>Período:</strong> {new Date(medication.start_date).toLocaleDateString()} - {new Date(medication.end_date).toLocaleDateString()}</p>
            {medicationCost && (
              <p><strong>Costo unitario:</strong> ${medicationCost.unit_cost.toLocaleString()}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Fecha y Hora de Administración *
            </label>
            <input
              type="datetime-local"
              value={formData.administered_at}
              onChange={(e) => setFormData(prev => ({ ...prev, administered_at: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dosis Administrada *
            </label>
            <input
              type="text"
              value={formData.dose}
              onChange={(e) => setFormData(prev => ({ ...prev, dose: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              placeholder="Ej: 10mg, 2 tabletas"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado de la Administración *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            >
              <option value="administrado">Administrado Correctamente</option>
              <option value="omitido">Omitido</option>
              <option value="reaccion_adversa">Reacción Adversa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Costo de la Administración
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.cost}
              onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
              className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Costo sugerido: ${medicationCost?.unit_cost.toLocaleString() || '0'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observaciones
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="Observaciones adicionales, reacciones, etc..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Guardando...' : 'Registrar Administración'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-300 dark:bg-dark-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-dark-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdministrationForm;