import React, { useState } from 'react';
import { X, Save, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CurrencyInput from './CurrencyInput';

interface BillingFormProps {
  onClose: () => void;
  onSuccess: (medication: {
    medication_name: string;
    unit_cost: number;
    unit: string;
    category: string;
    supplier: string;
    in_stock: number;
    created_by?: string;
  }) => void;
}

const BillingForm: React.FC<BillingFormProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    medication_name: '',
    unit_cost: 0,
    unit: 'mg',
    category: '',
    supplier: '',
    in_stock: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    'Antibióticos',
    'Analgésicos',
    'Antiinflamatorios',
    'Corticosteroides',
    'Gastroenterología',
    'Cardiología',
    'Dermatología',
    'Oftalmología',
    'Neurología',
    'Vitaminas y Suplementos',
    'Antiparasitarios',
    'Sedantes y Anestésicos',
    'Otros'
  ];

  const units = [
    'mg', 'ml', 'g', 'l', 'mcg', 'µg', 'cc',
    'tablet', 'capsule', 'capsula', 'tableta',
    'gota', 'gotas', 'unidad', 'unidades',
    'amp', 'ampolla', 'ampollas', 'frasco'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.medication_name.trim()) {
      newErrors.medication_name = 'El nombre del medicamento es requerido';
    }
    
    if (formData.unit_cost <= 0 || formData.unit_cost > 50000) {
      newErrors.unit_cost = 'El costo debe estar entre $1 y $50,000';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'La categoría es requerida';
    }
    
    if (!formData.supplier.trim()) {
      newErrors.supplier = 'El proveedor es requerido';
    }
    
    if (formData.in_stock < 0) {
      newErrors.in_stock = 'El stock no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      onSuccess({
        ...formData,
        created_by: user?.id
      });
    } catch (error) {
      console.error('Error saving medication cost:', error);
      setErrors({ general: 'Error al guardar el medicamento. Intente nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'in_stock' ? Number(value) : value
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCostChange = (value: number) => {
    setFormData(prev => ({ ...prev, unit_cost: value }));
    if (errors.unit_cost) {
      setErrors(prev => ({ ...prev, unit_cost: '' }));
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-dark-800 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-dark-700 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-2 rounded-full">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nuevo Medicamento</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del medicamento *
              </label>
              <input
                type="text"
                name="medication_name"
                required
                value={formData.medication_name}
                onChange={handleChange}
                className={`w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-secondary-500 focus:ring-secondary-500 text-sm ${
                  errors.medication_name ? 'border-red-300 dark:border-red-600' : ''
                }`}
                placeholder="Ejemplo: Omeprazol, Amoxicilina, Tramadol"
              />
              {errors.medication_name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.medication_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Costo por unidad *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  name="unit_cost"
                  required
                  min="1"
                  max="50000"
                  value={formData.unit_cost || ''}
                  onChange={(e) => handleCostChange(Number(e.target.value))}
                  className={`w-full pl-8 rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-secondary-500 focus:ring-secondary-500 text-sm ${
                    errors.unit_cost ? 'border-red-300 dark:border-red-600' : ''
                  }`}
                  placeholder="1500"
                />
              </div>
              {errors.unit_cost && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.unit_cost}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                Costo en pesos colombianos por unidad
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unidad *
              </label>
              <select
                name="unit"
                required
                value={formData.unit}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-secondary-500 focus:ring-secondary-500 text-sm"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                Selecciona la unidad de medida
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className={`w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-secondary-500 focus:ring-secondary-500 text-sm ${
                  errors.category ? 'border-red-300 dark:border-red-600' : ''
                }`}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Proveedor *
              </label>
              <input
                type="text"
                name="supplier"
                required
                value={formData.supplier}
                onChange={handleChange}
                className={`w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-secondary-500 focus:ring-secondary-500 text-sm ${
                  errors.supplier ? 'border-red-300 dark:border-red-600' : ''
                }`}
                placeholder="Ejemplo: Laboratorio ABC, Farmacia XYZ"
              />
              {errors.supplier && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.supplier}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock inicial
              </label>
              <input
                type="number"
                name="in_stock"
                min="0"
                step="1"
                value={formData.in_stock}
                onChange={handleChange}
                className={`w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-secondary-500 focus:ring-secondary-500 text-sm ${
                  errors.in_stock ? 'border-red-300 dark:border-red-600' : ''
                }`}
                placeholder="100"
              />
              {errors.in_stock && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.in_stock}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                Cantidad disponible en inventario
              </p>
            </div>
          </div>

          {/* Ejemplos de cálculo */}
          {formData.unit_cost > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Ejemplos de costo por dosis:</h4>
              <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                <p>• 1 {formData.unit}: ${formData.unit_cost.toLocaleString('es-CO')}</p>
                <p>• 5 {formData.unit}: ${(formData.unit_cost * 5).toLocaleString('es-CO')}</p>
                <p>• 10 {formData.unit}: ${(formData.unit_cost * 10).toLocaleString('es-CO')}</p>
                <p>• 20 {formData.unit}: ${(formData.unit_cost * 20).toLocaleString('es-CO')}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-md hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-600 border border-transparent rounded-md hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Guardando...' : 'Guardar Medicamento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillingForm;