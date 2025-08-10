import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Save, X, Search, Clock, Calendar } from 'lucide-react';

interface MedicationFormProps {
  patientId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

const MedicationForm: React.FC<MedicationFormProps> = ({
  patientId,
  onSubmit,
  onCancel
}) => {
  const { addMedication, addKardexEntry, medicationCosts, patients } = useData();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMedicationList, setShowMedicationList] = useState(false);
  
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
    medication_name: '',
    dose: '',
    frequency: '',
    route: 'oral' as const,
    start_date: getCurrentLocalDateTime(),
    end_date: '',
    instructions: '',
    status: 'activo' as const
  });

  // Obtener paciente actual
  const currentPatient = patients.find(p => p.id === patientId);

  // Verificar si el paciente está habilitado (hospitalizado o crítico)
  const isPatientEnabled = currentPatient && 
    (currentPatient.status === 'hospitalizado' || currentPatient.status === 'critico');

  // Filtrar medicamentos disponibles en stock
  const availableMedications = medicationCosts.filter(med => 
    med.in_stock > 0 && 
    med.medication_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Frecuencias predefinidas
  const frequencies = [
    'Cada 4 horas',
    'Cada 6 horas', 
    'Cada 8 horas',
    'Cada 12 horas',
    'Cada 24 horas',
    'Una vez al día',
    'Dos veces al día',
    'Tres veces al día',
    'Cuatro veces al día'
  ];

  // Vías de administración
  const routes = [
    { value: 'oral', label: 'Oral' },
    { value: 'iv', label: 'Intravenosa (IV)' },
    { value: 'im', label: 'Intramuscular (IM)' },
    { value: 'sc', label: 'Subcutánea (SC)' },
    { value: 'topica', label: 'Tópica' }
  ];

  // Actualizar fecha de fin automáticamente (7 días por defecto)
  useEffect(() => {
    if (formData.start_date) {
      // Crear fecha de inicio en zona horaria local
      const startDate = new Date(formData.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7); // 7 días de tratamiento por defecto
      
      // Formatear fecha de fin en zona horaria local
      const year = endDate.getFullYear();
      const month = String(endDate.getMonth() + 1).padStart(2, '0');
      const day = String(endDate.getDate()).padStart(2, '0');
      const hours = String(endDate.getHours()).padStart(2, '0');
      const minutes = String(endDate.getMinutes()).padStart(2, '0');
      
      setFormData(prev => ({
        ...prev,
        end_date: `${year}-${month}-${day}T${hours}:${minutes}`
      }));
    }
  }, [formData.start_date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validar que el paciente esté habilitado
    if (!isPatientEnabled) {
      setError('Solo se pueden prescribir medicamentos a pacientes hospitalizados o en estado crítico');
      return;
    }

    // Validar que el medicamento esté disponible
    const selectedMedication = medicationCosts.find(med => 
      med.medication_name === formData.medication_name
    );

    if (!selectedMedication) {
      setError('Debe seleccionar un medicamento del catálogo disponible');
      return;
    }

    if (selectedMedication.in_stock <= 0) {
      setError('El medicamento seleccionado no tiene stock disponible');
      return;
    }

    // Validar fechas
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    
    if (endDate <= startDate) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const medicationId = await addMedication({
        patient_id: patientId,
        medication_name: formData.medication_name,
        dose: formData.dose,
        frequency: formData.frequency,
        route: formData.route,
        start_date: formData.start_date,
        end_date: formData.end_date,
        instructions: formData.instructions,
        prescribed_by: user.id,
        status: formData.status
      });

      await addKardexEntry({
        patient_id: patientId,
        type: 'medicacion',
        content: `Nueva medicación prescrita: ${formData.medication_name} - ${formData.dose} - ${formData.frequency}. Prescrito por: ${user.name}. Costo unitario: $${selectedMedication.unit_cost.toLocaleString()}`,
        created_by: user.id,
        related_medication_id: medicationId
      });

      onSubmit();
    } catch (error) {
      console.error('Error adding medication:', error);
      setError('Error al guardar la medicación. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMedicationSelect = (medication: any) => {
    setFormData(prev => ({
      ...prev,
      medication_name: medication.medication_name,
      dose: `${medication.unit_cost} ${medication.unit}` // Sugerir dosis basada en la unidad
    }));
    setSearchTerm('');
    setShowMedicationList(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  // Si el paciente no está habilitado, mostrar mensaje de error
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
                Solo se pueden prescribir medicamentos a pacientes que estén:
              </p>
              <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                <li>• Hospitalizados</li>
                <li>• En estado crítico</li>
              </ul>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Estado actual del paciente: <span className="font-semibold">{currentPatient?.status || 'Desconocido'}</span>
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
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nueva Medicación</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Paciente: {currentPatient?.name} - {currentPatient?.species}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Selector de Medicamento */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Medicamento *
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={formData.medication_name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, medication_name: e.target.value }));
                    setSearchTerm(e.target.value);
                    setShowMedicationList(true);
                  }}
                  onFocus={() => setShowMedicationList(true)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  placeholder="Buscar medicamento..."
                  required
                />
              </div>
              
              {/* Lista de medicamentos disponibles */}
              {showMedicationList && availableMedications.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {availableMedications.map((medication) => (
                    <button
                      key={medication.id}
                      type="button"
                      onClick={() => handleMedicationSelect(medication)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-600 border-b border-gray-100 dark:border-dark-600 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{medication.medication_name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {medication.category} - ${medication.unit_cost.toLocaleString()} por {medication.unit}
                          </p>
                        </div>
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                          Stock: {medication.in_stock}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dosis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dosis *
              </label>
              <input
                type="text"
                value={formData.dose}
                onChange={(e) => setFormData(prev => ({ ...prev, dose: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                placeholder="Ej: 500mg, 2 tabletas"
                required
              />
            </div>

            {/* Frecuencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Frecuencia *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Seleccionar frecuencia</option>
                {frequencies.map(freq => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
            </div>

            {/* Vía de Administración */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vía de Administración *
              </label>
              <select
                value={formData.route}
                onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                required
              >
                {routes.map(route => (
                  <option key={route.value} value={route.value}>{route.label}</option>
                ))}
              </select>
            </div>

            {/* Fecha de Inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                Fecha de Inicio *
              </label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Fecha de Fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Clock className="inline h-4 w-4 mr-1" />
                Fecha de Fin *
              </label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            >
              <option value="activo">Activo</option>
              <option value="completado">Completado</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>

          {/* Instrucciones Especiales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Instrucciones Especiales
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="Instrucciones adicionales para la administración..."
            />
          </div>

          {/* Información del medicamento seleccionado */}
          {formData.medication_name && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Información del Medicamento</h4>
              {(() => {
                const selectedMed = medicationCosts.find(med => med.medication_name === formData.medication_name);
                if (selectedMed) {
                  return (
                    <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                      <p><strong>Categoría:</strong> {selectedMed.category}</p>
                      <p><strong>Costo por unidad:</strong> ${selectedMed.unit_cost.toLocaleString()} por {selectedMed.unit}</p>
                      <p><strong>Stock disponible:</strong> {selectedMed.in_stock} {selectedMed.unit}</p>
                      <p><strong>Proveedor:</strong> {selectedMed.supplier}</p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Guardando...' : 'Guardar Medicación'}
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

export default MedicationForm;