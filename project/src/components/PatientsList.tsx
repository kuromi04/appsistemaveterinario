import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Search, Filter, User, Phone, MapPin, Calendar, Eye, FileText, Activity } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const PatientsList: React.FC = () => {
  const navigate = useNavigate();
  const { patients, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.breed.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hospitalizado':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'alta':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'critico':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
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

  const handleViewPatient = (patientId: string) => {
    navigate(`/patients/${patientId}/kardex`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Cargando lista de pacientes..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="px-1">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Lista de Pacientes</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Vista general de todos los pacientes registrados</p>
      </div>

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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-800 dark:text-blue-200">
                {patients.length}
              </p>
            </div>
            <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">Hospitalizados</p>
              <p className="text-lg sm:text-2xl font-bold text-green-800 dark:text-green-200">
                {patients.filter(p => p.status === 'hospitalizado').length}
              </p>
            </div>
            <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-3 sm:p-4 rounded-lg border border-red-200 dark:border-red-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400">Críticos</p>
              <p className="text-lg sm:text-2xl font-bold text-red-800 dark:text-red-200">
                {patients.filter(p => p.status === 'critico').length}
              </p>
            </div>
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-3 sm:p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-yellow-600 dark:text-yellow-400">Alta</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                {patients.filter(p => p.status === 'alta').length}
              </p>
            </div>
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No se encontraron pacientes</p>
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div 
              key={patient.id} 
              className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => handleViewPatient(patient.id)}
            >
              <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{patient.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{patient.species} - {patient.breed}</p>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(patient.status)}`}>
                      {getStatusLabel(patient.status)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPatient(patient.id);
                      }}
                      className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Patient Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">Edad: {patient.age}</span>
                    <span className="mx-2">•</span>
                    <span className="truncate">Peso: {patient.weight}kg</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">Jaula: {patient.cage}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">
                      Ingreso: {new Date(patient.admission_date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Owner Info */}
                <div className="border-t border-gray-200 dark:border-dark-700 pt-4 mb-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm">Propietario</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{patient.owner}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{patient.owner_phone}</span>
                    </div>
                  </div>
                </div>

                {/* Budget Info */}
                <div className="border-t border-gray-200 dark:border-dark-700 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Presupuesto</span>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                        ${patient.current_budget?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        de ${patient.initial_budget?.toLocaleString() || '0'}
                      </div>
                    </div>
                  </div>
                  {patient.initial_budget && patient.initial_budget > 0 && (
                    <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.max(0, Math.min(100, ((patient.current_budget || 0) / patient.initial_budget) * 100))}%` 
                        }}
                      ></div>
                    </div>
                  )}
                </div>

                {/* Diagnosis */}
                <div className="border-t border-gray-200 dark:border-dark-700 pt-4 mt-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm">Diagnóstico</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{patient.diagnosis}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientsList;