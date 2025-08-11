import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { BarChart, LineChart, PieChart, Download, Calendar, TrendingUp, TrendingDown, Users, Activity } from 'lucide-react';

const Reports: React.FC = () => {
  const { patients, medications, administrations, budgetTransactions } = useData();
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0]
  });

  const filteredData = useMemo(() => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999); // Include the entire end date

    return {
      patients: patients.filter(p => {
        const admissionDate = new Date(p.admission_date);
        return admissionDate >= startDate && admissionDate <= endDate;
      }),
      medications: medications.filter(m => {
        const prescribedDate = new Date(m.prescribed_at || m.created_at || '');
        return prescribedDate >= startDate && prescribedDate <= endDate;
      }),
      administrations: administrations.filter(a => {
        const adminDate = new Date(a.administered_at);
        return adminDate >= startDate && adminDate <= endDate;
      }),
      budgetTransactions: budgetTransactions.filter(t => {
        const transactionDate = new Date(t.created_at || '');
        return transactionDate >= startDate && transactionDate <= endDate;
      })
    };
  }, [patients, medications, administrations, budgetTransactions, dateRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalPatients = filteredData.patients.length;
    const activePatients = patients.filter(p => p.status === 'hospitalizado').length;
    const totalRevenue = filteredData.budgetTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filteredData.budgetTransactions
      .filter(t => t.type === 'charge')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return {
      totalPatients,
      activePatients,
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      totalMedications: filteredData.medications.length,
      totalAdministrations: filteredData.administrations.length
    };
  }, [filteredData, patients]);

  // Species distribution
  const speciesData = useMemo(() => {
    const species: Record<string, number> = {};
    filteredData.patients.forEach(patient => {
      species[patient.species] = (species[patient.species] || 0) + 1;
    });
    return Object.entries(species).map(([name, count]) => ({ name, count }));
  }, [filteredData.patients]);

  // Patient status distribution
  const statusData = useMemo(() => {
    const statuses: Record<string, number> = {};
    patients.forEach(patient => {
      statuses[patient.status] = (statuses[patient.status] || 0) + 1;
    });
    return Object.entries(statuses).map(([status, count]) => ({ 
      status, 
      count,
      label: status === 'hospitalizado' ? 'Hospitalizado' : 
             status === 'alta' ? 'Alta' : 
             status === 'critico' ? 'Crítico' : status
    }));
  }, [patients]);

  // Daily admissions
  const dailyAdmissions = useMemo(() => {
    const days: Record<string, number> = {};
    filteredData.patients.forEach(patient => {
      const date = new Date(patient.admission_date).toISOString().split('T')[0];
      days[date] = (days[date] || 0) + 1;
    });
    return Object.entries(days)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [filteredData.patients]);

  const handleExportReport = () => {
    const reportData = {
      dateRange,
      metrics,
      speciesData,
      statusData,
      dailyAdmissions,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veterinary-report-${dateRange.start}-to-${dateRange.end}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h2>
        <button
          onClick={handleExportReport}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar Reporte
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-gray-700">Rango de Fechas:</span>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <span className="text-gray-500">a</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pacientes Nuevos</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalPatients}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pacientes Activos</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activePatients}</p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-green-600">${metrics.totalRevenue.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gastos Totales</p>
              <p className="text-2xl font-bold text-red-600">${metrics.totalExpenses.toFixed(2)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Species Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Distribución por Especies
          </h3>
          <div className="space-y-3">
            {speciesData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ 
                      backgroundColor: `hsl(${(index * 360) / speciesData.length}, 70%, 50%)` 
                    }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm text-gray-600">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Estado de Pacientes
          </h3>
          <div className="space-y-3">
              {statusData.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-4 h-4 rounded-full ${
                      item.status === 'hospitalizado' ? 'bg-blue-500' :
                      item.status === 'alta' ? 'bg-green-500' :
                      item.status === 'critico' ? 'bg-red-500' : 'bg-gray-500'
                    }`}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm text-gray-600">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Admissions Chart */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Ingresos Diarios
          </h3>
          {dailyAdmissions.length > 0 ? (
            <div className="space-y-2">
              {dailyAdmissions.map((day) => (
                <div key={day.date} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="bg-blue-200 h-2 rounded"
                      style={{ width: `${(day.count / Math.max(...dailyAdmissions.map(d => d.count))) * 100}px` }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700 w-8 text-right">{day.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos de ingresos en el rango seleccionado</p>
          )}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Medicaciones</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{metrics.totalMedications}</div>
          <p className="text-sm text-gray-600">Medicaciones prescritas</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Administraciones</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">{metrics.totalAdministrations}</div>
          <p className="text-sm text-gray-600">Medicaciones administradas</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Beneficio Neto</h3>
          <div className={`text-3xl font-bold mb-2 ${metrics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${metrics.netIncome.toFixed(2)}
          </div>
          <p className="text-sm text-gray-600">Ingresos - gastos</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;