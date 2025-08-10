import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Save, X, User, Phone, Mail, MapPin } from 'lucide-react';

interface PatientFormProps {
  onSubmit: () => void;
  onCancel: () => void;
  patient?: any;
}

const PatientForm: React.FC<PatientFormProps> = ({
  onSubmit,
  onCancel,
  patient
}) => {
  const { addPatient, updatePatient } = useData();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: patient?.name || '',
    species: patient?.species || '',
    breed: patient?.breed || '',
    age: patient?.age || '',
    weight: patient?.weight || '',
    owner: patient?.owner || '',
    owner_phone: patient?.owner_phone || '',
    owner_email: patient?.owner_email || '',
    owner_address: patient?.owner_address || '',
    admission_date: patient?.admission_date || new Date().toISOString(),
    diagnosis: patient?.diagnosis || '',
    status: patient?.status || 'hospitalizado',
    cage: patient?.cage || '',
    initial_budget: patient?.initial_budget || 0,
    current_budget: patient?.current_budget || 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      if (patient) {
        const result = await updatePatient(patient.id, formData);
        if (result.success) {
          onSubmit();
        } else {
          setError(result.error || 'Error al actualizar el paciente');
        }
      } else {
        const result = await addPatient({
          ...formData,
          created_by: user.id,
          current_budget: formData.initial_budget
        });
        if (result.success) {
          onSubmit();
        } else {
          setError(result.error || 'Error al crear el paciente');
        }
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      setError('Error inesperado al guardar el paciente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            {patient ? 'Editar Paciente' : 'Nuevo Paciente'}
          </h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Patient Information */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Información del Paciente
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre del paciente"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especie
                </label>
                <input
                  type="text"
                  value={formData.species}
                  onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Canino, Felino"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raza
                </label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Raza del animal"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edad
                </label>
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: 2 años, 6 meses"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jaula/Ubicación
                </label>
                <input
                  type="text"
                  value={formData.cage}
                  onChange={(e) => setFormData(prev => ({ ...prev, cage: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Jaula 01"
                  required
                />
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Información del Propietario
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  Nombre del Propietario
                </label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.owner_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, owner_phone: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Número de teléfono"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email (Opcional)
                </label>
                <input
                  type="email"
                  value={formData.owner_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, owner_email: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Dirección (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.owner_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, owner_address: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dirección completa"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-4">
              Información Médica
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnóstico
                </label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Diagnóstico médico"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="hospitalizado">Hospitalizado</option>
                  <option value="alta">Alta</option>
                  <option value="critico">Crítico</option>
                </select>
              </div>
            </div>
          </div>

          {/* Budget Information */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-4">
              Información de Presupuesto
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Presupuesto Inicial
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.initial_budget}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    initial_budget: parseFloat(e.target.value) || 0,
                    current_budget: patient ? prev.current_budget : parseFloat(e.target.value) || 0
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {patient && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Presupuesto Actual
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.current_budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_budget: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Guardando...' : (patient ? 'Actualizar Paciente' : 'Crear Paciente')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;