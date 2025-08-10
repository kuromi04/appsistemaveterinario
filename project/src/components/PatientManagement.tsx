import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Filter, Edit, Trash2, Eye, AlertCircle, CheckCircle, X, User, Calendar, DollarSign } from 'lucide-react';
import PatientForm from './PatientForm';
import { Patient } from '../types';
import LoadingSpinner from './LoadingSpinner';

const PatientManagement: React.FC = () => {
  const { patients, deletePatient, loading, error } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.breed.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleDelete = async (patientId: string) => {
    if (user?.role !== 'medico') {
      alert('Solo los médicos pueden eliminar pacientes');
      return;
    }

    try {
      const result = await deletePatient(patientId);
      if (result.success) {
        setShowDeleteConfirm(null);
        setSelectedPatients(prev => prev.filter(id => id !== patientId));
      } else {
        alert(result.error || 'Error al eliminar el paciente');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Error al eliminar el paciente');
    }
  };

  const handleBulkDelete = async () => {
    if (user?.role !== 'medico') {
      alert('Solo los médicos pueden eliminar pacientes');
      return;
    }

    if (selectedPatients.length === 0) return;

    try {
      const promises = selectedPatients.map(id => deletePatient(id));
      const results = await Promise.all(promises);
      
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        alert(`Error al eliminar ${failed.length} pacientes`);
      }
      
      setSelectedPatients([]);
      setShowBulkDelete(false);
    } catch (error) {
      console.error('Error in bulk delete:', error);
      alert('Error al eliminar los pacientes seleccionados');
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingPatient(null);
    // Refrescar la lista después de crear/editar
    window.location.reload();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPatient(null);
  };

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === filteredPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(filteredPatients.map(p => p.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hospitalizado':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'alta':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'critico':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'hospitalizado':
        return 'Hospitalizado';
      case 'alta':
        return 'Alta';
      case 'critico':
        return 'Crítico';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Cargando gestión de pacientes..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Gestión de Pacientes</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Crear, editar y eliminar pacientes del sistema</p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedPatients.length > 0 && user?.role === 'medico' && (
            <button
              onClick={() => setShowBulkDelete(true)}
              className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar ({selectedPatients.length})</span>
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-secondary-600 to-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-secondary-700 hover:to-primary-700 flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Paciente</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <span className="text-red-700 dark:text-red-400">{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre, propietario, especie o raza..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">Todos los estados</option>
                <option value="hospitalizado">Hospitalizado</option>
                <option value="alta">Alta</option>
                <option value="critico">Crítico</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No se encontraron pacientes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedPatients.length === filteredPatients.length && filteredPatients.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Propietario
                  </th>
                  <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Especies/Raza
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Jaula
                  </th>
                  <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Presupuesto
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedPatients.includes(patient.id)}
                        onChange={() => handleSelectPatient(patient.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{patient.age} - {patient.weight}kg</div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.owner}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{patient.owner_phone}</div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{patient.species}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{patient.breed}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                        {getStatusLabel(patient.status)}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {patient.cage}
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        ${patient.current_budget?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        de ${patient.initial_budget?.toLocaleString() || '0'}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(patient)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user?.role === 'medico' && (
                          <button
                            onClick={() => setShowDeleteConfirm(patient.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Form Modal */}
      {showForm && (
        <PatientForm
          patient={editingPatient}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmar Eliminación</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar este paciente? Esta acción no se puede deshacer y eliminará todos los datos relacionados.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
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

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Eliminar Múltiples Pacientes</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar {selectedPatients.length} pacientes seleccionados? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleBulkDelete}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Todos
              </button>
              <button
                onClick={() => setShowBulkDelete(false)}
                className="flex-1 bg-gray-300 dark:bg-dark-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-dark-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;