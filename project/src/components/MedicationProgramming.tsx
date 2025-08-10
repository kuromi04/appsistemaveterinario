import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Clock, Calendar, Search, Filter, AlertCircle, CheckCircle, XCircle, Pill, User, Dog, Plus, Eye, Edit, Trash2, Save, X, Timer, UserCheck, DollarSign } from 'lucide-react';
import { format, isToday, parseISO, differenceInMinutes, addMinutes, subMinutes, isAfter, isBefore, startOfDay, endOfDay, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import LoadingSpinner from './LoadingSpinner';
import MedicationForm from './MedicationForm';
import AdministrationForm from './AdministrationForm';

const MedicationProgramming: React.FC = () => {
  const { user } = useAuth();
  const { 
    patients, 
    medications, 
    administrations, 
    medicationCosts,
    loading,
    getMedicationsByPatient,
    getAdministrationsByPatient,
    updateMedication,
    deleteMedication,
    addKardexEntry,
    addAdministration
  } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'administered' | 'overdue' | 'late'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<string | null>(null);
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showAdministrationForm, setShowAdministrationForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [confirmingAdministration, setConfirmingAdministration] = useState<string | null>(null);

  // Actualizar hora actual cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Filtrar pacientes activos (hospitalizados o críticos)
  const activePatients = patients.filter(p => p.status === 'hospitalizado' || p.status === 'critico');

  // Filtrar pacientes según búsqueda
  const filteredPatients = activePatients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.cage.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Obtener medicaciones del paciente seleccionado
  const patientMedications = selectedPatient ? getMedicationsByPatient(selectedPatient) : [];
  const activeMedications = patientMedications.filter(m => m.status === 'activo');

  // Obtener administraciones del paciente seleccionado
  const patientAdministrations = selectedPatient ? getAdministrationsByPatient(selectedPatient) : [];

  // Función para parsear frecuencia y obtener horarios exactos
  const parseFrequencyToTimes = (frequency: string): string[] => {
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

  // Generar horarios programados para la fecha seleccionada
  const generateScheduledAdministrations = () => {
    if (!selectedPatient) return [];

    const scheduled: any[] = [];
    // Crear fecha seleccionada correctamente en zona horaria local
    const selectedDateTime = new Date(selectedDate + 'T00:00:00');
    const now = new Date();

    activeMedications.forEach(medication => {
      // Convertir fechas de medicación a zona horaria local
      const startDate = new Date(medication.start_date.includes('T') ? medication.start_date : medication.start_date + 'T00:00:00');
      const endDate = new Date(medication.end_date.includes('T') ? medication.end_date : medication.end_date + 'T23:59:59');
      
      // Verificar si la fecha seleccionada está dentro del período de tratamiento
      const selectedDateOnly = new Date(selectedDateTime.getFullYear(), selectedDateTime.getMonth(), selectedDateTime.getDate());
      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      
      if (selectedDateOnly < startDateOnly || selectedDateOnly > endDateOnly) {
        return; // Saltar esta medicación si no aplica para la fecha seleccionada
      }

      const times = parseFrequencyToTimes(medication.frequency);
      
      times.forEach(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const scheduledTime = new Date(selectedDateTime);
        scheduledTime.setHours(hours, minutes, 0, 0);

        // Buscar administración existente para este horario específico
        const existingAdmin = patientAdministrations.find(admin => {
          const adminTime = new Date(admin.administered_at);
          
          // Verificar que sea el mismo día y la misma medicación
          const isSameDate = adminTime.getDate() === scheduledTime.getDate() &&
                            adminTime.getMonth() === scheduledTime.getMonth() &&
                            adminTime.getFullYear() === scheduledTime.getFullYear();
          
          if (!isSameDate || admin.medication_id !== medication.id) {
            return false;
          }
          
          // Verificar ventana de tiempo (±2 horas)
          const timeDiff = Math.abs(differenceInMinutes(adminTime, scheduledTime));
          return timeDiff <= 120; // Ventana de 2 horas
        });

        // Determinar estado y puntualidad
        let status = 'pending';
        let timingStatus = null;
        let isOverdue = false;
        let isLate = false;
        let canAdminister = false;
        let timeDifference = null;

        if (existingAdmin) {
          status = existingAdmin.status;
          const adminTime = new Date(existingAdmin.administered_at);
          timeDifference = differenceInMinutes(adminTime, scheduledTime);
          
          if (Math.abs(timeDifference) <= 15) {
            timingStatus = 'on-time';
          } else if (timeDifference < -15) {
            timingStatus = 'early';
          } else if (timeDifference > 15) {
            timingStatus = 'late';
            isLate = true;
          }
        } else {
          // Solo calcular para la fecha seleccionada
          const isToday = selectedDateTime.getDate() === now.getDate() &&
                         selectedDateTime.getMonth() === now.getMonth() &&
                         selectedDateTime.getFullYear() === now.getFullYear();
          
          if (isToday) {
            const timeDiff = differenceInMinutes(now, scheduledTime);
            
            if (timeDiff > 120) { // Más de 2 horas de retraso
              isOverdue = true;
              status = 'overdue';
            } else if (timeDiff > 15) { // Entre 15 minutos y 2 horas de retraso
              isLate = true;
            }
            
            // Puede administrar desde 30 minutos antes hasta 3 horas después
            canAdminister = timeDiff >= -30 && timeDiff <= 180;
          } else if (selectedDateOnly < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
            // Fecha pasada sin administración
            isOverdue = true;
            status = 'overdue';
          }
        }

        // Obtener información de costo del medicamento
        const medicationCost = medicationCosts.find(mc => mc.medication_name === medication.medication_name);
        
        scheduled.push({
          id: existingAdmin?.id || `scheduled-${medication.id}-${time}-${selectedDate}`,
          medication,
          scheduledTime,
          actualTime: existingAdmin?.administered_at,
          status,
          timingStatus,
          administered_by: existingAdmin?.administered_by,
          dose: existingAdmin?.dose || medication.dose,
          notes: existingAdmin?.notes,
          isOverdue,
          isLate,
          canAdminister,
          timeDifference,
          cost: existingAdmin?.cost || medicationCost?.unit_cost || 0,
          medicationCost,
          isExisting: !!existingAdmin
        });
      });
    });

    return scheduled.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  };

  const scheduledAdministrations = generateScheduledAdministrations();

  const filteredScheduled = scheduledAdministrations.filter(admin => {
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'pending' && admin.status === 'pending') ||
      (statusFilter === 'administered' && admin.status === 'administrado') ||
      (statusFilter === 'overdue' && admin.isOverdue) ||
      (statusFilter === 'late' && admin.isLate);
    
    return matchesStatus;
  });

  const getStatusIcon = (admin: any) => {
    if (admin.isOverdue) {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
    
    switch (admin.status) {
      case 'administrado':
        if (admin.timingStatus === 'late') {
          return <Timer className="h-5 w-5 text-orange-500" />;
        }
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'omitido':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'reaccion_adversa':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        if (admin.isLate) {
          return <Timer className="h-5 w-5 text-orange-500" />;
        }
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (admin: any) => {
    if (admin.isOverdue) {
      return 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700';
    }
    
    if (admin.status === 'administrado') {
      if (admin.timingStatus === 'late') {
        return 'bg-orange-100 border-orange-300 dark:bg-orange-900/30 dark:border-orange-700';
      }
      return 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700';
    }
    
    if (admin.isLate) {
      return 'bg-orange-100 border-orange-300 dark:bg-orange-900/30 dark:border-orange-700';
    }
    
    switch (admin.status) {
      case 'omitido':
      case 'reaccion_adversa':
        return 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700';
      default:
        return 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700';
    }
  };

  const getTimingStatusText = (admin: any) => {
    if (admin.isOverdue) return 'Vencido';
    if (admin.isLate && admin.status === 'pending') return 'Retrasado';
    
    switch (admin.timingStatus) {
      case 'on-time': return 'A tiempo';
      case 'early': return 'Temprano';
      case 'late': return 'Tardío';
      default: return '';
    }
  };

  const getTimingStatusColor = (admin: any) => {
    if (admin.isOverdue) return 'text-red-600 dark:text-red-400';
    if (admin.isLate) return 'text-orange-600 dark:text-orange-400';
    
    switch (admin.timingStatus) {
      case 'on-time': return 'text-green-600 dark:text-green-400';
      case 'early': return 'text-blue-600 dark:text-blue-400';
      case 'late': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getUserName = (userId: string) => {
    return userId === user?.id ? user.name : 'Usuario';
  };

  const handleQuickAdminister = async (admin: any) => {
    if (!user || !selectedPatient) return;

    try {
      const now = new Date();
      const scheduledTime = admin.scheduledTime;
      const timeDiff = differenceInMinutes(now, scheduledTime);
      
      let timingStatus: 'on-time' | 'early' | 'late' = 'on-time';
      if (Math.abs(timeDiff) <= 15) {
        timingStatus = 'on-time';
      } else if (timeDiff < -15) {
        timingStatus = 'early';
      } else if (timeDiff > 15) {
        timingStatus = 'late';
      }

      // Convertir a formato ISO con zona horaria local
      const localISOString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();
      const scheduledISOString = new Date(scheduledTime.getTime() - (scheduledTime.getTimezoneOffset() * 60000)).toISOString();

      await addAdministration({
        medication_id: admin.medication.id,
        patient_id: selectedPatient,
        administered_by: user.id,
        administered_at: localISOString,
        dose: admin.dose,
        notes: `Administración rápida - ${getTimingStatusText({timingStatus})}`,
        status: 'administrado',
        cost: admin.cost,
        scheduled_time: scheduledISOString,
        timing_status: timingStatus
      });

      // Crear entrada en el kardex
      await addKardexEntry({
        patient_id: selectedPatient,
        type: 'administracion',
        content: `${admin.medication.medication_name} ${admin.dose} administrado correctamente (${getTimingStatusText({timingStatus})}). Administrado por: ${user.name}. Costo: $${admin.cost.toLocaleString()}`,
        created_by: user.id,
        related_medication_id: admin.medication.id
      });

      setConfirmingAdministration(null);
    } catch (error) {
      console.error('Error en administración rápida:', error);
      alert('Error al registrar la administración');
    }
  };

  const handleAdminister = (admin: any) => {
    setSelectedMedication(admin.medication.id);
    setShowAdministrationForm(true);
  };

  const handleNewMedication = () => {
    if (!selectedPatient) {
      alert('Por favor selecciona un paciente primero');
      return;
    }
    setShowMedicationForm(true);
  };

  const handleEditMedication = (medication: any) => {
    setEditingMedication(medication.id);
    setEditData({
      dose: medication.dose,
      frequency: medication.frequency,
      status: medication.status,
      instructions: medication.instructions || ''
    });
  };

  const handleSaveEdit = async (medicationId: string) => {
    try {
      updateMedication(medicationId, editData);
      
      if (selectedPatient && user) {
        await addKardexEntry({
          patient_id: selectedPatient,
          type: 'medicacion',
          content: `Medicación actualizada: ${editData.dose} - ${editData.frequency} - Estado: ${editData.status}`,
          created_by: user.id,
          related_medication_id: medicationId
        });
      }
      
      setEditingMedication(null);
      setEditData({});
    } catch (error) {
      console.error('Error updating medication:', error);
      alert('Error al actualizar la medicación');
    }
  };

  const handleCancelEdit = () => {
    setEditingMedication(null);
    setEditData({});
  };

  const handleDeleteMedication = async (medicationId: string) => {
    try {
      const medication = patientMedications.find(m => m.id === medicationId);
      
      const medicationAdmins = administrations.filter(a => a.medication_id === medicationId);
      if (medicationAdmins.length > 0) {
        alert('No se puede eliminar una medicación que ya tiene administraciones registradas. Puede suspenderla cambiando su estado.');
        return;
      }

      if (deleteMedication) {
        const result = await deleteMedication(medicationId);
        if (result.success) {
          if (selectedPatient && user && medication) {
            await addKardexEntry({
              patient_id: selectedPatient,
              type: 'medicacion',
              content: `Medicación eliminada: ${medication.medication_name} - ${medication.dose}`,
              created_by: user.id
            });
          }
        } else {
          alert(result.error || 'Error al eliminar la medicación');
        }
      }
      
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting medication:', error);
      alert('Error al eliminar la medicación');
    }
  };

  // Estadísticas del día seleccionado
  const todayStats = {
    total: scheduledAdministrations.length,
    completed: scheduledAdministrations.filter(a => a.status === 'administrado').length,
    pending: scheduledAdministrations.filter(a => a.status === 'pending').length,
    overdue: scheduledAdministrations.filter(a => a.isOverdue).length,
    onTime: scheduledAdministrations.filter(a => a.timingStatus === 'on-time').length,
    late: scheduledAdministrations.filter(a => a.timingStatus === 'late' || a.isLate).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Cargando programación de medicamentos..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 sm:p-6">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Pill className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Programación de Medicamentos
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hora actual: {format(currentTime, 'dd/MM/yyyy HH:mm', { locale: es })}
              </p>
            </div>
          </div>
          
          {user?.role === 'medico' && selectedPatient && (
            <button
              onClick={handleNewMedication}
              className="flex items-center space-x-2 bg-gradient-to-r from-secondary-600 to-primary-600 text-white px-4 py-2 rounded-lg hover:from-secondary-700 hover:to-primary-700 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Medicación</span>
            </button>
          )}
        </div>

        {/* Estadísticas del día */}
        {selectedPatient && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{todayStats.total}</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Total</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">{todayStats.completed}</div>
              <div className="text-xs text-green-600 dark:text-green-400">Completadas</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{todayStats.pending}</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">Pendientes</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-red-600 dark:text-red-400">{todayStats.overdue}</div>
              <div className="text-xs text-red-600 dark:text-red-400">Vencidas</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{todayStats.onTime}</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">A Tiempo</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{todayStats.late}</div>
              <div className="text-xs text-orange-600 dark:text-orange-400">Tardías</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="administered">Administrados</option>
            <option value="overdue">Vencidos</option>
            <option value="late">Tardíos</option>
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
          />

          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>{filteredScheduled.length} programadas</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Pacientes */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="p-4 border-b border-gray-200 dark:border-dark-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pacientes Activos ({filteredPatients.length})
            </h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredPatients.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Dog className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No hay pacientes activos</p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedPatient === patient.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                        : 'hover:bg-gray-50 dark:hover:bg-dark-700 border-gray-200 dark:border-dark-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{patient.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {patient.species} - Jaula {patient.cage}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        patient.status === 'critico' 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      }`}>
                        {patient.status === 'critico' ? 'Crítico' : 'Hospitalizado'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Medicaciones del Paciente Seleccionado */}
        <div className="lg:col-span-2">
          {!selectedPatient ? (
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-8 text-center">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Selecciona un Paciente
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Elige un paciente de la lista para ver sus medicaciones programadas
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Información del Paciente Seleccionado */}
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Dog className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {patients.find(p => p.id === selectedPatient)?.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {patientMedications.length} medicaciones totales ({activeMedications.length} activas)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Lista de Medicaciones */}
              {patientMedications.length > 0 && (
                <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
                  <div className="p-4 border-b border-gray-200 dark:border-dark-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Medicaciones del Paciente
                    </h3>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {patientMedications.map((medication) => {
                      const medicationCost = medicationCosts.find(mc => mc.medication_name === medication.medication_name);
                      
                      return (
                        <div key={medication.id} className="border border-gray-200 dark:border-dark-600 rounded-lg p-4">
                          {editingMedication === medication.id ? (
                            // Modo edición
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Dosis
                                  </label>
                                  <input
                                    type="text"
                                    value={editData.dose}
                                    onChange={(e) => setEditData({...editData, dose: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Frecuencia
                                  </label>
                                  <input
                                    type="text"
                                    value={editData.frequency}
                                    onChange={(e) => setEditData({...editData, frequency: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Estado
                                </label>
                                <select
                                  value={editData.status}
                                  onChange={(e) => setEditData({...editData, status: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                                >
                                  <option value="activo">Activo</option>
                                  <option value="completado">Completado</option>
                                  <option value="suspendido">Suspendido</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Instrucciones
                                </label>
                                <textarea
                                  value={editData.instructions}
                                  onChange={(e) => setEditData({...editData, instructions: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                                  rows={2}
                                />
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleSaveEdit(medication.id)}
                                  className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                >
                                  <Save className="h-3 w-3" />
                                  <span>Guardar</span>
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="flex items-center space-x-1 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                                >
                                  <X className="h-3 w-3" />
                                  <span>Cancelar</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Modo visualización
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 dark:text-white">{medication.medication_name}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {medication.dose} - {medication.frequency} - {medication.route}
                                  </p>
                                  {medication.instructions && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                      {medication.instructions}
                                    </p>
                                  )}
                                  {medicationCost && (
                                    <div className="flex items-center space-x-2 mt-2">
                                      <DollarSign className="h-3 w-3 text-green-600" />
                                      <span className="text-xs text-green-600 dark:text-green-400">
                                        ${medicationCost.unit_cost.toLocaleString()} por {medicationCost.unit} - Stock: {medicationCost.in_stock}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    medication.status === 'activo' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                    medication.status === 'completado' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                                    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                  }`}>
                                    {medication.status === 'activo' ? 'Activo' :
                                     medication.status === 'completado' ? 'Completado' : 'Suspendido'}
                                  </span>
                                  
                                  {user?.role === 'medico' && (
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={() => handleEditMedication(medication)}
                                        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                                        title="Editar medicación"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => setShowDeleteConfirm(medication.id)}
                                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                        title="Eliminar medicación"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                <p>Período: {format(new Date(medication.start_date), 'dd/MM/yyyy', { locale: es })} - {format(new Date(medication.end_date), 'dd/MM/yyyy', { locale: es })}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Administraciones Programadas */}
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
                <div className="p-4 border-b border-gray-200 dark:border-dark-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Programación para {format(new Date(selectedDate + 'T12:00:00'), 'dd/MM/yyyy', { locale: es })}
                  </h3>
                </div>

                <div className="p-4">
                  {filteredScheduled.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No hay administraciones programadas para esta fecha</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredScheduled.map((admin) => (
                        <div
                          key={admin.id}
                          className={`p-4 rounded-lg border-2 ${getStatusColor(admin)}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              {getStatusIcon(admin)}
                              
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                  {admin.medication.medication_name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {admin.dose} - {admin.medication.route}
                                </p>
                                <div className="flex items-center space-x-2 text-xs mt-1">
                                  <span className="text-gray-500 dark:text-gray-500">
                                    Programado: {format(admin.scheduledTime, 'HH:mm', { locale: es })}
                                  </span>
                                  {admin.actualTime && (
                                    <>
                                      <span className="text-gray-400">•</span>
                                      <span className="text-gray-500 dark:text-gray-500">
                                        Administrado: {format(new Date(admin.actualTime), 'HH:mm', { locale: es })}
                                      </span>
                                    </>
                                  )}
                                  {admin.timeDifference !== null && (
                                    <>
                                      <span className="text-gray-400">•</span>
                                      <span className={`font-medium ${getTimingStatusColor(admin)}`}>
                                        {admin.timeDifference > 0 ? '+' : ''}{admin.timeDifference} min
                                      </span>
                                    </>
                                  )}
                                </div>
                                {admin.medicationCost && (
                                  <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400 mt-1">
                                    <DollarSign className="h-3 w-3" />
                                    <span>Costo: ${admin.cost.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-end space-y-1 ml-4">
                              {admin.timingStatus && (
                                <span className={`text-xs font-medium ${getTimingStatusColor(admin)}`}>
                                  {getTimingStatusText(admin)}
                                </span>
                              )}
                              
                              {admin.administered_by && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-500">
                                  <UserCheck className="h-3 w-3" />
                                  <span>{getUserName(admin.administered_by)}</span>
                                </div>
                              )}
                              
                              {admin.canAdminister && admin.status !== 'administrado' && (
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => setConfirmingAdministration(admin.id)}
                                    className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                  >
                                    ✓ Rápido
                                  </button>
                                  <button
                                    onClick={() => handleAdminister(admin)}
                                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                  >
                                    Detallado
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {admin.notes && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-dark-600 p-2 rounded">
                              <strong>Notas:</strong> {admin.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de administración rápida */}
      {confirmingAdministration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmar Administración</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Confirmas que administraste este medicamento ahora? Se registrará automáticamente con la hora actual.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const admin = scheduledAdministrations.find(a => a.id === confirmingAdministration);
                  if (admin) handleQuickAdminister(admin);
                }}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirmar
              </button>
              <button
                onClick={() => setConfirmingAdministration(null)}
                className="flex-1 bg-gray-300 dark:bg-dark-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-dark-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmar Eliminación</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar esta medicación? Esta acción no se puede deshacer.
              Si la medicación ya tiene administraciones registradas, no podrá ser eliminada.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteMedication(showDeleteConfirm)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-300 dark:bg-dark-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-dark-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showMedicationForm && selectedPatient && (
        <MedicationForm
          patientId={selectedPatient}
          onSubmit={() => {
            setShowMedicationForm(false);
          }}
          onCancel={() => setShowMedicationForm(false)}
        />
      )}

      {showAdministrationForm && selectedPatient && selectedMedication && (
        <AdministrationForm
          patientId={selectedPatient}
          medicationId={selectedMedication}
          onSubmit={() => {
            setShowAdministrationForm(false);
            setSelectedMedication(null);
          }}
          onCancel={() => {
            setShowAdministrationForm(false);
            setSelectedMedication(null);
          }}
        />
      )}
    </div>
  );
};

export default MedicationProgramming;