import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, Plus, Minus, FileText, TrendingUp } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const BudgetManager: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { addBudgetTransaction, budgetTransactions, updatePatient, getPatient } = useData();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<{ type: 'deposit' | 'charge' | 'refund' | 'adjustment'; amount: string; description: string }>({
      type: 'deposit',
      amount: '',
      description: ''
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

  const patientTransactions = budgetTransactions.filter(t => t.patient_id === patient.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return;

    const currentBalance = patient.current_budget;
    let newBalance = currentBalance;

    switch (formData.type) {
      case 'deposit':
        newBalance = currentBalance + amount;
        break;
      case 'charge':
        newBalance = currentBalance - amount;
        break;
      case 'refund':
        newBalance = currentBalance + amount;
        break;
      case 'adjustment':
        newBalance = amount; // Direct set to amount for adjustments
        break;
    }

    try {
      await addBudgetTransaction({
        patient_id: patient.id,
        type: formData.type,
        amount: formData.type === 'charge' ? -amount : amount,
        description: formData.description,
        created_by: user.id,
        previous_balance: currentBalance,
        new_balance: newBalance
      });

      await updatePatient(patient.id, {
        current_budget: newBalance
      });

      setFormData({ type: 'deposit', amount: '', description: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error managing budget:', error);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'charge':
        return <Minus className="w-4 h-4 text-red-600" />;
      case 'refund':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'adjustment':
        return <FileText className="w-4 h-4 text-yellow-600" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600';
      case 'charge':
        return 'text-red-600';
      case 'refund':
        return 'text-blue-600';
      case 'adjustment':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Gestión de Presupuesto</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <DollarSign className="w-4 h-4" />
          Nueva Transacción
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Presupuesto Inicial</span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            ${patient.initial_budget?.toFixed(2) || '0.00'}
          </p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Presupuesto Actual</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            ${patient.current_budget?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">Nueva Transacción</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Transacción
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="deposit">Depósito</option>
                  <option value="charge">Cargo</option>
                  <option value="refund">Reembolso</option>
                  <option value="adjustment">Ajuste</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descripción de la transacción..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Crear Transacción
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
        <h4 className="font-medium text-gray-700">Historial de Transacciones</h4>
        {patientTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay transacciones registradas</p>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {patientTransactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(transaction.type)}
                    <span className="font-medium">{transaction.description}</span>
                  </div>
                  <span className={`font-bold ${getTransactionColor(transaction.type)}`}>
                    {transaction.amount >= 0 ? '+' : ''}${transaction.amount.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Balance: ${transaction.previous_balance.toFixed(2)} → ${transaction.new_balance.toFixed(2)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(transaction.created_at || '').toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetManager;