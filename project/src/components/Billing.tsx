import React, { useState } from 'react';
import { DollarSign, Plus, Search, Filter, Package, TrendingUp, TrendingDown, Trash2, AlertTriangle, Edit, MoreVertical } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import BillingForm from './BillingForm';
import LoadingSpinner from './LoadingSpinner';

const Billing: React.FC = () => {
  const { medicationCosts, addMedicationCost, updateMedicationCost, deleteMedicationCost, loading } = useData();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showZeroInventoryConfirm, setShowZeroInventoryConfirm] = useState<string | null>(null);
  const [editingMedication, setEditingMedication] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);

  const filteredMedications = medicationCosts.filter(med => {
    const matchesSearch = 
      med.medication_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || med.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(medicationCosts.map(m => m.category)));

  const handleAddMedication = (medicationData: any) => {
    try {
      addMedicationCost({
        ...medicationData,
        created_by: user?.id
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding medication cost:', error);
    }
  };

  const handleDeleteMedication = async (medicationId: string) => {
    try {
      await deleteMedicationCost(medicationId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting medication:', error);
      alert('Error al eliminar el medicamento');
    }
  };

  const handleZeroInventory = async (medicationId: string) => {
    try {
      await updateMedicationCost(medicationId, { in_stock: 0 });
      setShowZeroInventoryConfirm(null);
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Error al actualizar el inventario');
    }
  };

  const handleUpdateStock = async (medicationId: string) => {
    try {
      await updateMedicationCost(medicationId, { in_stock: editStock });
      setEditingMedication(null);
      setEditStock(0);
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error al actualizar el stock');
    }
  };

  const startEditStock = (medication: any) => {
    setEditingMedication(medication.id);
    setEditStock(medication.in_stock);
  };

  const totalValue = medicationCosts.reduce((sum, med) => sum + (med.unit_cost * med.in_stock), 0);
  const lowStockItems = medicationCosts.filter(med => med.in_stock < 10).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Cargando información de facturación..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 sm:p-6">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Facturación y Medicamentos
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestiona costos y precios de medicamentos
              </p>
            </div>
          </div>
          {user?.role === 'medico' && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-secondary-600 to-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-secondary-700 hover:to-primary-700 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Medicamento</span>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">Valor Total Inventario</p>
                <p className="text-lg sm:text-2xl font-bold text-green-800 dark:text-green-200">
                  ${totalValue.toLocaleString('es-CO')}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">Total Medicamentos</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {medicationCosts.length}
                </p>
              </div>
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-3 sm:p-4 rounded-lg border border-orange-200 dark:border-orange-700 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-orange-600 dark:text-orange-400">Stock Bajo</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-800 dark:text-orange-200">
                  {lowStockItems}
                </p>
              </div>
              <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar medicamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 text-sm"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 text-sm"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Medications List */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-dark-700">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
            Catálogo de Medicamentos ({filteredMedications.length})
          </h3>
        </div>

        {filteredMedications.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400">
            <Package className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-base sm:text-lg font-medium mb-2">No hay medicamentos</h3>
            <p className="text-sm">No se encontraron medicamentos con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Medicamento
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Costo por Unidad
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Valor Total
                  </th>
                  {user?.role === 'medico' && (
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                {filteredMedications.map((medication) => (
                  <tr key={medication.id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                          {medication.medication_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {medication.unit}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                        {medication.category}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                      ${medication.unit_cost.toLocaleString('es-CO')}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      {editingMedication === medication.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            value={editStock}
                            onChange={(e) => setEditStock(Number(e.target.value))}
                            className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-dark-600 rounded bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                          />
                          <button
                            onClick={() => handleUpdateStock(medication.id)}
                            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 p-1"
                            title="Guardar"
                          >
                            <DollarSign className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingMedication(null);
                              setEditStock(0);
                            }}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                            title="Cancelar"
                          >
                            <AlertTriangle className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            medication.in_stock < 10 
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
                              : medication.in_stock < 50 
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          }`}>
                            {medication.in_stock} {medication.unit}
                          </span>
                          {user?.role === 'medico' && (
                            <button
                              onClick={() => startEditStock(medication)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1"
                              title="Editar stock"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                      {medication.supplier}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                      ${(medication.unit_cost * medication.in_stock).toLocaleString('es-CO')}
                    </td>
                    {user?.role === 'medico' && (
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setShowZeroInventoryConfirm(medication.id)}
                            className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 p-1 rounded"
                            title="Poner inventario en ceros"
                          >
                            <Package className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(medication.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 rounded"
                            title="Eliminar medicamento"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmar Eliminación</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar este medicamento del catálogo? Esta acción no se puede deshacer.
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
      {/* Zero Inventory Confirmation Modal */}
      {showZeroInventoryConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <Package className="w-6 h-6 text-orange-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Poner Inventario en Ceros</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que deseas poner el inventario de este medicamento en ceros? Esto indicará que no hay stock disponible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleZeroInventory(showZeroInventoryConfirm)}
                className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                Poner en Ceros
              </button>
              <button
                onClick={() => setShowZeroInventoryConfirm(null)}
                className="flex-1 bg-gray-300 dark:bg-dark-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-dark-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Medication Form */}
      {showForm && (
        <BillingForm
          onClose={() => setShowForm(false)}
          onSuccess={handleAddMedication}
        />
      )}
    </div>
  );
};

export default Billing;