import React, { useState } from 'react';
import { Clock, Check, X, User, AlertCircle, Calendar, Pill, Edit2, Save, XCircle } from 'lucide-react';
import { Medication } from '../types';
import { useData } from '../contexts/DataContext';
import { users } from '../data/mockData';
import { format, addHours, isAfter, isBefore, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import AdministrationForm from './AdministrationForm';

interface MedicationScheduleProps {
  medication: Medication;
  onAdministrationComplete: () => void;
}

interface ScheduleEntry {
  id: string;
  scheduled_time: Date;
  actual_time?: Date;
  status: 'pending' | 'completed' | 'missed' | 'late';
  administered_by?: string;
  notes?: string;
  dose?: string;
}

const MedicationSchedule: React.FC<MedicationScheduleProps> = ({ 
  medication, 
  onAdministrationComplete 
}) => {
  const { user } = useAuth();
  const { getAdministrationsByMedication, updateMedication } = useData();
  const [showAdministrationForm, setShowAdministrationForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleEntry | null>(null);
  const [isEditingMedication, setIsEditingMedication] = useState(false);
  const [editedMedication, setEditedMedication] = useState({
    dose: medication.dose,
    frequency: medication.frequency,
    status: medication.status
  });

  const administrations = getAdministrationsByMedication(medication.id);

  // Generar horario basado en la frecuencia
  const generateSchedule = (): ScheduleEntry[] => {
    const schedule: ScheduleEntry[] = [];
    const startDate = new Date(medication.start_date);
    const endDate = new Date(medication.end_date);
    const now = new Date();

    // Determinar intervalo en horas basado en la frecuencia
    let intervalHours = 8; // por defecto
    const freq = medication.frequency.toLowerCase();
    
    if (freq.includes('12') || freq.includes('doce')) intervalHours = 12;
    if (freq.includes('6') || freq.includes('seis')) intervalHours = 6;
    if (freq.includes('4') || freq.includes('cuatro')) intervalHours = 4;
    if (freq.includes('24') || freq.includes('día') || freq.includes('diaria')) intervalHours = 24;
    if (freq.includes('2 veces') || freq.includes('dos veces')) intervalHours = 12;
    if (freq.includes('3 veces') || freq.includes('tres veces')) intervalHours = 8;
    if (freq.includes('una vez')) intervalHours = 24;

    let currentTime = new Date(startDate);
    let scheduleId = 1;

    while (isBefore(currentTime, endDate)) {
      const existingAdmin = administrations.find(admin => 
        Math.abs(differenceInMinutes(new Date(admin.administered_at), currentTime)) < 90
      );

      let status: 'pending' | 'completed' | 'missed' | 'late' = 'pending';
      
      if (existingAdmin) {
        const timeDiff = differenceInMinutes(new Date(existingAdmin.administered_at), currentTime);
        if (Math.abs(timeDiff) <= 30) {
          status = 'completed';
        } else {
          status = 'late';
        }
      } else if (isAfter(now, addHours(currentTime, 2))) {
        status = 'missed';
      }

      schedule.push({
        id: `${medication.id}-${scheduleId}`,
        scheduled_time: new Date(currentTime),
        actual_time: existingAdmin ? new Date(existingAdmin.administered_at) : undefined,
        status,
        administered_by: existingAdmin?.administered_by,
        notes: existingAdmin?.notes,
        dose: existingAdmin?.dose
      });

      currentTime = addHours(currentTime, intervalHours);
      scheduleId++;
    }

    return schedule;
  };

  const schedule = generateSchedule();
  
  const getUserName = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser?.name || 'Usuario desconocido';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'pending': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'missed': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
      case 'late': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'pending': return <Clock className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'missed': return <X className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'late': return <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />;
      default: return <Clock className="h-3 w-3 sm:h-4 sm:w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Administrado';
      case 'pending': return 'Pendiente';
      case 'missed': return 'Perdido';
      case 'late': return 'Tardío';
      default: return status;
    }
  };

  const getMedicationStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'completado': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'suspendido': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const canAdminister = (scheduleEntry: ScheduleEntry) => {
    const now = new Date();
    const scheduledTime = scheduleEntry.scheduled_time;
    const timeDiff = differenceInMinutes(now, scheduledTime);
    
    // Puede administrar desde 30 minutos antes hasta 3 horas después
    return timeDiff >= -30 && timeDiff <= 180 && scheduleEntry.status !== 'completed';
  };

  const handleAdminister = (scheduleEntry: ScheduleEntry) => {
    setSelectedSchedule(scheduleEntry);
    setShowAdministrationForm(true);
  };

  const handleEditMedication = () => {
    setIsEditingMedication(true);
  };

  const handleSaveMedication = () => {
    updateMedication(medication.id, editedMedication);
    setIsEditingMedication(false);
    onAdministrationComplete(); // Refresh parent
  };

  const handleCancelEdit = () => {
    setEditedMedication({
      dose: medication.dose,
      frequency: medication.frequency,
      status: medication.status
    });
    setIsEditingMedication(false);
  };

  const completedCount = schedule.filter(s => s.status === 'completed').length;
  const totalCount = schedule.length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow border border-gray-200 dark:border-dark-700">
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-dark-700">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-2 rounded-full">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 dark:text-white leading-tight">
                {medication.medication_name}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMedicationStatusColor(medication.status)}`}>
                  {medication.status === 'activo' ? 'Activo' : 
                   medication.status === 'completado' ? 'Completado' : 'Suspendido'}
                </span>
                {user?.role === 'medico' && (
                  <button
                    onClick={handleEditMedication}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1 rounded"
                    title="Editar medicación"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Progreso: {completedCount}/{totalCount} ({completionRate.toFixed(0)}%)
            </div>
            <div className="w-16 sm:w-20 lg:w-24 bg-gray-200 dark:bg-dark-600 rounded-full h-2 flex-shrink-0">
              <div 
                className="bg-gradient-to-r from-secondary-500 to-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Información de la medicación */}
        {!isEditingMedication ? (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <p><span className="font-medium">Dosis:</span> <span className="break-words">{medication.dose}</span></p>
            <p><span className="font-medium">Frecuencia:</span> <span className="break-words">{medication.frequency}</span></p>
            <p><span className="font-medium">Vía:</span> {medication.route}</p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Dosis</label>
                <input
                  type="text"
                  value={editedMedication.dose}
                  onChange={(e) => setEditedMedication({...editedMedication, dose: e.target.value})}
                  className="w-full text-xs rounded border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Frecuencia</label>
                <input
                  type="text"
                  value={editedMedication.frequency}
                  onChange={(e) => setEditedMedication({...editedMedication, frequency: e.target.value})}
                  className="w-full text-xs rounded border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Estado:</label>
              <select
                value={editedMedication.status}
                onChange={(e) => setEditedMedication({...editedMedication, status: e.target.value as any})}
                className="text-xs rounded border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              >
                <option value="activo">Activo</option>
                <option value="completado">Completado</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveMedication}
                className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
              >
                <Save className="h-3 w-3" />
                <span>Guardar</span>
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center space-x-1 bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
              >
                <XCircle className="h-3 w-3" />
                <span>Cancelar</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 lg:p-6">
        <div className="space-y-2 sm:space-y-3">
          {schedule.map((entry) => (
            <div 
              key={entry.id} 
              className={`flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center justify-between p-2 sm:p-3 lg:p-4 rounded-lg border transition-colors ${
                entry.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : 
                entry.status === 'missed' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' :
                entry.status === 'late' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' : 
                'bg-gray-50 dark:bg-dark-700 border-gray-200 dark:border-dark-600'
              }`}
            >
              <div className="flex items-start space-x-2 sm:space-x-3 lg:space-x-4 min-w-0 flex-1">
                <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${getStatusColor(entry.status)}`}>
                  {getStatusIcon(entry.status)}
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col space-y-1 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-2">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm lg:text-base break-all">
                        {format(entry.scheduled_time, 'dd/MM/yyyy HH:mm', { locale: es })}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium border self-start sm:self-auto ${getStatusColor(entry.status)}`}>
                      {getStatusText(entry.status)}
                    </span>
                  </div>
                  
                  {entry.actual_time && (
                    <div className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Administrado:</span> <span className="break-all">{format(entry.actual_time, 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                    </div>
                  )}
                  
                  {entry.administered_by && (
                    <div className="mt-1 flex items-center space-x-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <User className="h-3 w-3 flex-shrink-0" />
                      <span className="break-words">{getUserName(entry.administered_by)}</span>
                    </div>
                  )}
                  
                  {entry.notes && (
                    <div className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Notas:</span> <span className="break-words">{entry.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 sm:ml-4 flex-shrink-0">
                {entry.status === 'completed' && entry.dose && (
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-dark-600 px-2 py-1 rounded border border-gray-200 dark:border-dark-500 break-all">
                    {entry.dose}
                  </span>
                )}
                
                {/* Médicos y auxiliares pueden administrar medicamentos */}
                {(user?.role === 'auxiliar' || user?.role === 'medico') && canAdminister(entry) && (
                  <button
                    onClick={() => handleAdminister(entry)}
                    className="bg-gradient-to-r from-secondary-600 to-primary-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm hover:from-secondary-700 hover:to-primary-700 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 whitespace-nowrap"
                  >
                    Administrar
                  </button>
                )}
                
                {entry.status === 'missed' && (
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium whitespace-nowrap">
                    Perdido
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {schedule.length === 0 && (
          <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
            <p className="text-sm sm:text-base">No hay horarios programados</p>
          </div>
        )}
      </div>

      {/* Formulario de administración */}
        {showAdministrationForm && selectedSchedule && (
          <AdministrationForm
            patientId={medication.patient_id}
            medicationId={medication.id}
            onSubmit={() => {
              setShowAdministrationForm(false);
              setSelectedSchedule(null);
              onAdministrationComplete();
            }}
            onCancel={() => {
              setShowAdministrationForm(false);
              setSelectedSchedule(null);
            }}
          />
        )}
    </div>
  );
};

export default MedicationSchedule;