import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, FileText, Activity, Pill, DollarSign, File, Calendar } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const PatientKardex: React.FC = () => {
  const { id: patientId } = useParams<{ id: string }>();
  const { getKardexByPatient, addKardexEntry, getPatient } = useData();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'observacion' as const,
    content: ''
  });

  if (!patientId) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8 text-red-500">
          <p>ID de paciente no proporcionado</p>
        </div>
      </div>
    );
  }

  const patient = getPatient(patientId);

  if (!patient) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <LoadingSpinner />
          <p className="mt-4 text-gray-500">Cargando información del paciente...</p>
        </div>
      </div>
    );
  }

  const kardexEntries = getKardexByPatient(patientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addKardexEntry({
        patient_id: patientId,
        type: formData.type,
        content: formData.content,
        created_by: user.id
      });

      setFormData({ type: 'observacion', content: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding kardex entry:', error);
    }
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'medicacion':
        return <Pill className="w-4 h-4 text-blue-600" />;
      case 'administracion':
        return <Activity className="w-4 h-4 text-green-600" />;
      case 'observacion':
        return <FileText className="w-4 h-4 text-gray-600" />;
      case 'signo_vital':
        return <Activity className="w-4 h-4 text-red-600" />;
      case 'presupuesto':
        return <DollarSign className="w-4 h-4 text-yellow-600" />;
      case 'archivo':
        return <File className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getEntryColor = (type: string) => {
    switch (type) {
      case 'medicacion':
        return 'border-l-blue-500 bg-blue-50';
      case 'administracion':
        return 'border-l-green-500 bg-green-50';
      case 'observacion':
        return 'border-l-gray-500 bg-gray-50';
      case 'signo_vital':
        return 'border-l-red-500 bg-red-50';
      case 'presupuesto':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'archivo':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'medicacion':
        return 'Medicación';
      case 'administracion':
        return 'Administración';
      case 'observacion':
        return 'Observación';
      case 'signo_vital':
        return 'Signo Vital';
      case 'presupuesto':
        return 'Presupuesto';
      case 'archivo':
        return 'Archivo';
      default:
        return 'Entrada';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Kardex del Paciente
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Entrada
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">Nueva Entrada de Kardex</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Entrada
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="observacion">Observación</option>
                  <option value="signo_vital">Signo Vital</option>
                  <option value="medicacion">Medicación</option>
                  <option value="administracion">Administración</option>
                  <option value="presupuesto">Presupuesto</option>
                  <option value="archivo">Archivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenido
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Descripción detallada de la entrada..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Guardar Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {kardexEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No hay entradas de kardex registradas</p>
            <p className="text-sm">Haz clic en "Nueva Entrada" para comenzar</p>
          </div>
        ) : (
          kardexEntries.map((entry) => (
            <div
              key={entry.id}
              className={`border-l-4 rounded-lg p-4 ${getEntryColor(entry.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  {getEntryIcon(entry.type)}
                  <span className="font-medium text-sm">
                    {getTypeLabel(entry.type)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {new Date(entry.created_at || '').toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientKardex;