import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  Filter,
  Users,
  Activity,
  DollarSign,
  Pill,
  Clock,
  AlertTriangle,
  Target,
  Zap,
  PieChart,
  LineChart,
  BarChart,
  FileText,
  RefreshCw
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import LoadingSpinner from './LoadingSpinner';

interface AdvancedMetrics {
  patientTurnover: number;
  averageStayDuration: number;
  medicationCompliance: number;
  budgetUtilization: number;
  criticalPatientRate: number;
  recoveryRate: number;
  revenuePerPatient: number;
  costPerTreatment: number;
  staffEfficiency: number;
  capacityUtilization: number;
}

interface TrendData {
  period: string;
  patients: number;
  revenue: number;
  treatments: number;
  compliance: number;
}

interface SpeciesAnalysis {
  species: string;
  count: number;
  averageCost: number;
  averageStay: number;
  recoveryRate: number;
  commonDiagnoses: string[];
}

const AdvancedReports: React.FC = () => {
  const { patients, medications, administrations, budgetTransactions, loading } = useData();
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'species' | 'performance' | 'predictions'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Filtrar datos por rango de fechas
  const filteredData = useMemo(() => {
    const startDate = parseISO(dateRange.start);
    const endDate = parseISO(dateRange.end);

    return {
      patients: patients.filter(p => 
        isWithinInterval(parseISO(p.admission_date), { start: startDate, end: endDate })
      ),
      medications: medications.filter(m => 
        isWithinInterval(parseISO(m.prescribed_at || m.created_at || ''), { start: startDate, end: endDate })
      ),
      administrations: administrations.filter(a => 
        isWithinInterval(parseISO(a.administered_at), { start: startDate, end: endDate })
      ),
      budgetTransactions: budgetTransactions.filter(t => 
        isWithinInterval(parseISO(t.created_at || ''), { start: startDate, end: endDate })
      )
    };
  }, [patients, medications, administrations, budgetTransactions, dateRange]);

  // Calcular métricas avanzadas
  const advancedMetrics = useMemo((): AdvancedMetrics => {
    const totalPatients = filteredData.patients.length;
    const dischargedPatients = filteredData.patients.filter(p => p.status === 'alta').length;
    const criticalPatients = filteredData.patients.filter(p => p.status === 'critico').length;
    
    // Duración promedio de estancia
    const averageStayDuration = filteredData.patients.reduce((acc, patient) => {
      const admissionDate = parseISO(patient.admission_date);
      const now = new Date();
      const stayDays = Math.ceil((now.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24));
      return acc + stayDays;
    }, 0) / (totalPatients || 1);

    // Compliance de medicación
    const totalMedications = filteredData.medications.length;
    const completedMedications = filteredData.medications.filter(m => m.status === 'completado').length;
    const medicationCompliance = totalMedications > 0 ? (completedMedications / totalMedications) * 100 : 0;

    // Utilización de presupuesto
    const totalBudget = filteredData.patients.reduce((acc, p) => acc + p.initial_budget, 0);
    const usedBudget = filteredData.patients.reduce((acc, p) => acc + (p.initial_budget - p.current_budget), 0);
    const budgetUtilization = totalBudget > 0 ? (usedBudget / totalBudget) * 100 : 0;

    // Ingresos y costos
    const totalRevenue = filteredData.budgetTransactions
      .filter(t => t.type === 'deposit')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const totalCosts = filteredData.budgetTransactions
      .filter(t => t.type === 'charge')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    return {
      patientTurnover: totalPatients,
      averageStayDuration: Math.round(averageStayDuration),
      medicationCompliance: Math.round(medicationCompliance),
      budgetUtilization: Math.round(budgetUtilization),
      criticalPatientRate: totalPatients > 0 ? Math.round((criticalPatients / totalPatients) * 100) : 0,
      recoveryRate: totalPatients > 0 ? Math.round((dischargedPatients / totalPatients) * 100) : 0,
      revenuePerPatient: totalPatients > 0 ? Math.round(totalRevenue / totalPatients) : 0,
      costPerTreatment: filteredData.administrations.length > 0 ? Math.round(totalCosts / filteredData.administrations.length) : 0,
      staffEfficiency: Math.round(filteredData.administrations.length / (totalPatients || 1)),
      capacityUtilization: Math.min(100, Math.round((patients.filter(p => p.status !== 'alta').length / 50) * 100))
    };
  }, [filteredData]);

  // Análisis de tendencias
  const trendData = useMemo((): TrendData[] => {
    const periods: TrendData[] = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      let periodStart: Date;
      let periodEnd: Date;
      let periodLabel: string;

      switch (selectedPeriod) {
        case 'week':
          periodStart = startOfWeek(subDays(now, i * 7));
          periodEnd = endOfWeek(subDays(now, i * 7));
          periodLabel = format(periodStart, 'dd MMM', { locale: es });
          break;
        case 'month':
          periodStart = startOfMonth(subDays(now, i * 30));
          periodEnd = endOfMonth(subDays(now, i * 30));
          periodLabel = format(periodStart, 'MMM yyyy', { locale: es });
          break;
        case 'quarter':
          periodStart = subDays(now, i * 90);
          periodEnd = subDays(now, (i - 1) * 90);
          periodLabel = `Q${Math.ceil((periodStart.getMonth() + 1) / 3)}`;
          break;
        case 'year':
          periodStart = subDays(now, i * 365);
          periodEnd = subDays(now, (i - 1) * 365);
          periodLabel = format(periodStart, 'yyyy');
          break;
        default:
          periodStart = subDays(now, i * 30);
          periodEnd = subDays(now, (i - 1) * 30);
          periodLabel = format(periodStart, 'MMM', { locale: es });
      }

      const periodPatients = patients.filter(p => 
        isWithinInterval(parseISO(p.admission_date), { start: periodStart, end: periodEnd })
      );

      const periodRevenue = budgetTransactions
        .filter(t => t.type === 'deposit' && 
          isWithinInterval(parseISO(t.created_at || ''), { start: periodStart, end: periodEnd })
        )
        .reduce((acc, t) => acc + t.amount, 0);

      const periodTreatments = administrations.filter(a => 
        isWithinInterval(parseISO(a.administered_at), { start: periodStart, end: periodEnd })
      ).length;

      const periodMedications = medications.filter(m => 
        isWithinInterval(parseISO(m.prescribed_at || m.created_at || ''), { start: periodStart, end: periodEnd })
      );
      
      const completedMeds = periodMedications.filter(m => m.status === 'completado').length;
      const compliance = periodMedications.length > 0 ? (completedMeds / periodMedications.length) * 100 : 0;

      periods.push({
        period: periodLabel,
        patients: periodPatients.length,
        revenue: periodRevenue,
        treatments: periodTreatments,
        compliance: Math.round(compliance)
      });
    }

    return periods;
  }, [patients, medications, administrations, budgetTransactions, selectedPeriod]);

  // Análisis por especies
  const speciesAnalysis = useMemo((): SpeciesAnalysis[] => {
    const speciesMap = new Map<string, {
      patients: typeof filteredData.patients;
      totalCost: number;
      totalStay: number;
      recovered: number;
      diagnoses: string[];
    }>();

    filteredData.patients.forEach(patient => {
      const species = patient.species;
      if (!speciesMap.has(species)) {
        speciesMap.set(species, {
          patients: [],
          totalCost: 0,
          totalStay: 0,
          recovered: 0,
          diagnoses: []
        });
      }

      const data = speciesMap.get(species)!;
      data.patients.push(patient);
      data.totalCost += (patient.initial_budget - patient.current_budget);
      
      const stayDays = Math.ceil((new Date().getTime() - parseISO(patient.admission_date).getTime()) / (1000 * 60 * 60 * 24));
      data.totalStay += stayDays;
      
      if (patient.status === 'alta') {
        data.recovered++;
      }
      
      if (!data.diagnoses.includes(patient.diagnosis)) {
        data.diagnoses.push(patient.diagnosis);
      }
    });

    return Array.from(speciesMap.entries()).map(([species, data]) => ({
      species,
      count: data.patients.length,
      averageCost: data.patients.length > 0 ? Math.round(data.totalCost / data.patients.length) : 0,
      averageStay: data.patients.length > 0 ? Math.round(data.totalStay / data.patients.length) : 0,
      recoveryRate: data.patients.length > 0 ? Math.round((data.recovered / data.patients.length) * 100) : 0,
      commonDiagnoses: data.diagnoses.slice(0, 3)
    })).sort((a, b) => b.count - a.count);
  }, [filteredData.patients]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular actualización de datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleExport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange,
      metrics: advancedMetrics,
      trends: trendData,
      speciesAnalysis,
      summary: {
        totalPatients: filteredData.patients.length,
        totalRevenue: budgetTransactions.filter(t => t.type === 'deposit').reduce((acc, t) => acc + t.amount, 0),
        totalTreatments: filteredData.administrations.length
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-avanzado-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Cargando reportes avanzados..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 sm:p-6">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Reportes Avanzados
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Análisis profundo y métricas de rendimiento del hospital veterinario
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 bg-gradient-to-r from-secondary-600 to-primary-600 text-white px-3 py-2 rounded-lg hover:from-secondary-700 hover:to-primary-700 transition-all duration-200"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>

        {/* Controles de fecha y período */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha inicio
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha fin
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Período de análisis
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
            >
              <option value="week">Semanal</option>
              <option value="month">Mensual</option>
              <option value="quarter">Trimestral</option>
              <option value="year">Anual</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200 dark:border-dark-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Resumen Ejecutivo', icon: Target },
              { id: 'trends', label: 'Tendencias', icon: TrendingUp },
              { id: 'species', label: 'Análisis por Especies', icon: PieChart },
              { id: 'performance', label: 'Rendimiento', icon: Zap },
              { id: 'predictions', label: 'Predicciones', icon: Activity }
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
        <div className="space-y-6">
          {/* KPIs Principales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Rotación de Pacientes</p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{advancedMetrics.patientTurnover}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">en el período</p>
                </div>
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Tasa de Recuperación</p>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">{advancedMetrics.recoveryRate}%</p>
                  <p className="text-xs text-green-600 dark:text-green-400">pacientes dados de alta</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Compliance Medicación</p>
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{advancedMetrics.medicationCompliance}%</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">tratamientos completados</p>
                </div>
                <Pill className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Utilización Presupuesto</p>
                  <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">{advancedMetrics.budgetUtilization}%</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">del presupuesto total</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          {/* Métricas Operacionales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Métricas Operacionales
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Estancia Promedio</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{advancedMetrics.averageStayDuration} días</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Eficiencia del Personal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{advancedMetrics.staffEfficiency} trat/paciente</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Utilización de Capacidad</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{advancedMetrics.capacityUtilization}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tasa de Pacientes Críticos</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{advancedMetrics.criticalPatientRate}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Métricas Financieras
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ingreso por Paciente</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">${advancedMetrics.revenuePerPatient.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Costo por Tratamiento</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${advancedMetrics.costPerTreatment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Margen de Beneficio</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {advancedMetrics.revenuePerPatient > 0 ? 
                      Math.round(((advancedMetrics.revenuePerPatient - advancedMetrics.costPerTreatment) / advancedMetrics.revenuePerPatient) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">ROI Presupuesto</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{advancedMetrics.budgetUtilization}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <LineChart className="h-5 w-5 mr-2" />
            Análisis de Tendencias - {selectedPeriod === 'week' ? 'Semanal' : selectedPeriod === 'month' ? 'Mensual' : selectedPeriod === 'quarter' ? 'Trimestral' : 'Anual'}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Pacientes */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Pacientes por Período</h4>
              <div className="space-y-2">
                {trendData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{data.period}</span>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="bg-blue-500 h-2 rounded"
                        style={{ width: `${(data.patients / Math.max(...trendData.map(d => d.patients))) * 100}px` }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{data.patients}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico de Ingresos */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Ingresos por Período</h4>
              <div className="space-y-2">
                {trendData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{data.period}</span>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="bg-green-500 h-2 rounded"
                        style={{ width: `${(data.revenue / Math.max(...trendData.map(d => d.revenue))) * 100}px` }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right">
                        ${(data.revenue / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico de Tratamientos */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Tratamientos por Período</h4>
              <div className="space-y-2">
                {trendData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{data.period}</span>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="bg-purple-500 h-2 rounded"
                        style={{ width: `${(data.treatments / Math.max(...trendData.map(d => d.treatments))) * 100}px` }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{data.treatments}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico de Compliance */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Compliance de Medicación (%)</h4>
              <div className="space-y-2">
                {trendData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{data.period}</span>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="bg-orange-500 h-2 rounded"
                        style={{ width: `${data.compliance}px` }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{data.compliance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'species' && (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Análisis por Especies
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {speciesAnalysis.map((species, index) => (
              <div key={species.species} className="border border-gray-200 dark:border-dark-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">{species.species}</h4>
                  <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-2 py-1 rounded-full text-sm font-medium">
                    {species.count} pacientes
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Costo Promedio</span>
                    <span className="font-medium text-gray-900 dark:text-white">${species.averageCost.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Estancia Promedio</span>
                    <span className="font-medium text-gray-900 dark:text-white">{species.averageStay} días</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tasa de Recuperación</span>
                    <span className={`font-medium ${species.recoveryRate >= 80 ? 'text-green-600 dark:text-green-400' : species.recoveryRate >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                      {species.recoveryRate}%
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 block mb-2">Diagnósticos Comunes</span>
                    <div className="space-y-1">
                      {species.commonDiagnoses.map((diagnosis, idx) => (
                        <span key={idx} className="inline-block bg-gray-100 dark:bg-dark-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs mr-1 mb-1">
                          {diagnosis}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Indicadores de Rendimiento */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Indicadores de Rendimiento
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Eficiencia Operacional</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {Math.min(100, advancedMetrics.staffEfficiency * 10)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, advancedMetrics.staffEfficiency * 10)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Calidad del Tratamiento</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{advancedMetrics.medicationCompliance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${advancedMetrics.medicationCompliance}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Satisfacción del Cliente</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{advancedMetrics.recoveryRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${advancedMetrics.recoveryRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gestión de Riesgos</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {100 - advancedMetrics.criticalPatientRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${100 - advancedMetrics.criticalPatientRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Alertas y Recomendaciones */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Alertas y Recomendaciones
              </h3>
              
              <div className="space-y-4">
                {advancedMetrics.criticalPatientRate > 20 && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3">
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">Alta tasa de pacientes críticos</p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Considere revisar los protocolos de admisión y tratamiento temprano.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {advancedMetrics.medicationCompliance < 80 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Baja compliance de medicación</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                          Implemente recordatorios automáticos y capacitación del personal.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {advancedMetrics.capacityUtilization > 90 && (
                  <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg p-3">
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Capacidad casi al límite</p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          Considere expandir las instalaciones o optimizar los tiempos de estancia.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {advancedMetrics.recoveryRate > 85 && (
                  <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-3">
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">Excelente tasa de recuperación</p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Mantenga los estándares actuales de calidad en el tratamiento.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Predicciones y Proyecciones
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Proyecciones para los próximos 30 días</h4>
              
              <div className="space-y-3">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Pacientes Esperados</span>
                    <span className="text-lg font-bold text-blue-900 dark:text-blue-200">
                      {Math.round(advancedMetrics.patientTurnover * 1.1)}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Basado en tendencia histórica (+10%)
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">Ingresos Proyectados</span>
                    <span className="text-lg font-bold text-green-900 dark:text-green-200">
                      ${Math.round(advancedMetrics.revenuePerPatient * advancedMetrics.patientTurnover * 1.1).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Estimación conservadora
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Capacidad Requerida</span>
                    <span className="text-lg font-bold text-purple-900 dark:text-purple-200">
                      {Math.min(100, Math.round(advancedMetrics.capacityUtilization * 1.15))}%
                    </span>
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Utilización esperada
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Recomendaciones Estratégicas</h4>
              
              <div className="space-y-3">
                <div className="border border-gray-200 dark:border-dark-600 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Optimización de Recursos</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Considere contratar personal adicional si la capacidad supera el 85%.
                  </p>
                </div>

                <div className="border border-gray-200 dark:border-dark-600 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Mejora de Procesos</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Implemente protocolos automatizados para mejorar la compliance de medicación.
                  </p>
                </div>

                <div className="border border-gray-200 dark:border-dark-600 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Expansión de Servicios</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    La alta demanda sugiere oportunidades para servicios especializados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedReports;