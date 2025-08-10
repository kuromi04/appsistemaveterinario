import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, Edit, Trash2, Plus, FileText, DollarSign, 
  Pill, Calendar, User, Phone, Mail, MapPin, Heart,
  Activity, Clock, AlertCircle, CheckCircle, Camera,
  Download, Upload, Eye, X
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import MedicationForm from './MedicationForm';
import AdministrationForm from './AdministrationForm';
import BudgetManager from './BudgetManager';
import FileManager from './FileManager';
import LoadingSpinner from './LoadingSpinner';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getPatient, 
    getMedicationsByPatient, 
    getAdministrationsByPatient,
    getKardexByPatient,
    deletePatient,
    updatePatient
  } = useData();

  const [activeTab, setActiveTab] = useState<'overview' | 'medications' | 'kardex' | 'budget' | 'files'>('overview');
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showAdministrationForm, setShowAdministrationForm] = useState(false);
  const [showBudgetManager, setShowBudgetManager] = useState(false);
  const [showFileManager, setShowFileManager] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">ID de paciente no válido</p>
        </div>
      </div>
    );
  }

  const patient = getPatient(id);
  const medications = getMedicationsByPatient(id);
  const administrations = getAdministrationsByPatient(id);
  const kardexEntries = getKardexByPatient(id);

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Cargando información del paciente..." />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critico': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
      case 'hospitalizado': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'alta': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'critico': return 'Crítico';
      case 'hospitalizado': return 'Hospitalizado';
      case 'alta': return 'Alta';
      default: return status;
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este paciente? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const result = await deletePatient(id);
      if (result.success) {
        navigate('/patients');
      } else {
        alert(result.error || 'Error al eliminar el paciente');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Error al eliminar el paciente');
    }
  };

  const handleEdit = () => {
    setEditData({
      name: patient.name,
      species: patient.species,
      breed: patient.breed,
      age: patient.age,
      weight: patient.weight,
      owner: patient.owner,
      owner_phone: patient.owner_phone,
      owner_email: patient.owner_email || '',
      owner_address: patient.owner_address || '',
      diagnosis: patient.diagnosis,
      status: patient.status,
      cage: patient.cage,
      initial_budget: patient.initial_budget,
      current_budget: patient.current_budget
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      const result = await updatePatient(id, editData);
      if (result.success) {
        setIsEditing(false);
      } else {
        alert(result.error || 'Error al actualizar el paciente');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Error al actualizar el paciente');
    }
  };

  const budgetPercentage = patient.initial_budget > 0 
    ? (patient.current_budget / patient.initial_budget) * 100 
    : 0;

  const activeMedications = medications.filter(m => m.status === 'activo');
  const recentAdministrations = administrations
    .sort((a, b) => new Date(b.administered_at).getTime() - new Date(a.administered_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 sm:p-6">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <button
              onClick={() => navigate('/patients')}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {patient.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {patient.species} - {patient.breed}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(patient.status)}`}>
              {getStatusLabel(patient.status)}
            </span>
            
            {user?.role === 'medico' && (
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                  title="Editar paciente"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                  title="Eliminar paciente"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Patient Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Edad y Peso</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-200">{patient.age}</p>
                <p className="text-sm text-blue-700 dark:text-blue-400">{patient.weight} kg</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-center space-x-3">
              <MapPin className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">Ubicación</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-200">Jaula {patient.cage}</p>
                <p className="text-sm text-green-700 dark:text-green-400">
                  {format(new Date(patient.admission_date), 'dd/MM/yyyy', { locale: es })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-center space-x-3">
              <Pill className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Medicaciones</p>
                <p className="text-lg font-bold text-purple-900 dark:text-purple-200">{activeMedications.length}</p>
                <p className="text-sm text-purple-700 dark:text-purple-400">Activas</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Presupuesto</p>
                <p className="text-lg font-bold text-yellow-900 dark:text-yellow-200">
                  ${patient.current_budget.toLocaleString()}
                </p>
                <div className="w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2 mt-1">
                  <div 
                    className="bg-yellow-600 dark:bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, budgetPercentage))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-dark-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Resumen', icon: Activity },
              { id: 'medications', label: 'Medicaciones', icon: Pill },
              { id: 'kardex', label: 'Kardex', icon: FileText },
              { id: 'budget', label: 'Presupuesto', icon: DollarSign },
              { id: 'files', label: 'Archivos', icon: Camera }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Information */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Información del Paciente
            </h3>
            
            {!isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                    <p className="text-gray-900 dark:text-white">{patient.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Especie</label>
                    <p className="text-gray-900 dark:text-white">{patient.species}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Raza</label>
                    <p className="text-gray-900 dark:text-white">{patient.breed}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Edad</label>
                    <p className="text-gray-900 dark:text-white">{patient.age}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Diagnóstico</label>
                  <p className="text-gray-900 dark:text-white">{patient.diagnosis}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Especie</label>
                    <input
                      type="text"
                      value={editData.species}
                      onChange={(e) => setEditData({...editData, species: e.target.value})}
                      className="w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diagnóstico</label>
                  <textarea
                    value={editData.diagnosis}
                    onChange={(e) => setEditData({...editData, diagnosis: e.target.value})}
                    className="w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveEdit}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Guardar</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Owner Information */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Información del Propietario
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{patient.owner}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Propietario</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{patient.owner_phone}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Teléfono</p>
                </div>
              </div>
              
              {patient.owner_email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{patient.owner_email}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  </div>
                </div>
              )}
              
              {patient.owner_address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{patient.owner_address}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Dirección</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Actividad Reciente
            </h3>
            
            {recentAdministrations.length > 0 ? (
              <div className="space-y-3">
                {recentAdministrations.map((admin) => {
                  const medication = medications.find(m => m.id === admin.medication_id);
                  return (
                    <div key={admin.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <div className={`p-2 rounded-full ${
                        admin.status === 'administrado' ? 'bg-green-100 dark:bg-green-900/30' :
                        admin.status === 'omitido' ? 'bg-red-100 dark:bg-red-900/30' :
                        'bg-yellow-100 dark:bg-yellow-900/30'
                      }`}>
                        {admin.status === 'administrado' ? (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : admin.status === 'omitido' ? (
                          <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {medication?.medication_name} - {admin.dose}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(admin.administered_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        admin.status === 'administrado' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        admin.status === 'omitido' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      }`}>
                        {admin.status === 'administrado' ? 'Administrado' :
                         admin.status === 'omitido' ? 'Omitido' : 'Reacción Adversa'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No hay actividad reciente registrada
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'medications' && (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medicaciones</h3>
            {user?.role === 'medico' && (
              <button
                onClick={() => setShowMedicationForm(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Nueva Medicación</span>
              </button>
            )}
          </div>

          {medications.length > 0 ? (
            <div className="space-y-4">
              {medications.map((medication) => (
                <div key={medication.id} className="border border-gray-200 dark:border-dark-600 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{medication.medication_name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {medication.dose} - {medication.frequency} - {medication.route}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      medication.status === 'activo' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                      medication.status === 'completado' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                      {medication.status === 'activo' ? 'Activo' :
                       medication.status === 'completado' ? 'Completado' : 'Suspendido'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <p>Período: {format(new Date(medication.start_date), 'dd/MM/yyyy', { locale: es })} - {format(new Date(medication.end_date), 'dd/MM/yyyy', { locale: es })}</p>
                    {medication.instructions && <p>Instrucciones: {medication.instructions}</p>}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedMedication(medication.id);
                        setShowAdministrationForm(true);
                      }}
                      className="bg-secondary-600 text-white px-3 py-1 rounded text-sm hover:bg-secondary-700"
                    >
                      Administrar
                    </button>
                    <button
                      onClick={() => navigate(`/patients/${id}/kardex`)}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                    >
                      Ver Kardex
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No hay medicaciones registradas</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'kardex' && (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Kardex del Paciente</h3>
          
          {kardexEntries.length > 0 ? (
            <div className="space-y-4">
              {kardexEntries.map((entry) => (
                <div key={entry.id} className="border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-r-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-primary-700 dark:text-primary-300 capitalize">
                      {entry.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(entry.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{entry.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No hay entradas de kardex registradas</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'budget' && (
        <BudgetManager />
      )}

      {activeTab === 'files' && (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Archivos Médicos</h3>
            <button
              onClick={() => setShowFileManager(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Subir Archivo</span>
            </button>
          </div>

          {patient.files && patient.files.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patient.files.map((file) => (
                <div key={file.id} className="border border-gray-200 dark:border-dark-600 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Camera className="h-8 w-8 text-gray-400" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">{file.file_name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{file.file_type}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center justify-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>Ver</span>
                    </button>
                    <button className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center justify-center space-x-1">
                      <Download className="h-3 w-3" />
                      <span>Descargar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No hay archivos subidos</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showMedicationForm && (
        <MedicationForm
          patientId={id}
          onSubmit={() => {
            setShowMedicationForm(false);
            // Refresh data
          }}
          onCancel={() => setShowMedicationForm(false)}
        />
      )}

      {showAdministrationForm && selectedMedication && (
        <AdministrationForm
          patientId={id}
          medicationId={selectedMedication}
          onSubmit={() => {
            setShowAdministrationForm(false);
            setSelectedMedication(null);
            // Refresh data
          }}
          onCancel={() => {
            setShowAdministrationForm(false);
            setSelectedMedication(null);
          }}
        />
      )}

      {showFileManager && (
        <FileManager
          patient={patient}
          onClose={() => setShowFileManager(false)}
          onUpdate={() => {
            // Refresh data
          }}
        />
      )}
    </div>
  );
};

export default PatientDetail;