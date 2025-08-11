import React from 'react';
import { Heart, Clock, AlertTriangle, CheckCircle, Activity, Users, DollarSign, Pill, FileText } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { format, isToday, isYesterday, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import MetricCard from './MetricCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

interface DashboardProps {
  onPatientSelect?: (patientId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onPatientSelect }) => {
  const { patients, medications, administrations, loading, error } = useData();

  // Enhanced statistics with trends
  const generateAdvancedStats = () => {
    const today = new Date();
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);
    const lastWeekStart = subDays(weekStart, 7);
    const lastWeekEnd = subDays(weekEnd, 7);

    // Today's stats
    const todayAdmins = administrations.filter(a => isToday(new Date(a.administered_at)));
    const yesterdayAdmins = administrations.filter(a => isYesterday(new Date(a.administered_at)));
    
    // This week vs last week
    const thisWeekAdmins = administrations.filter(a => {
      const date = new Date(a.administered_at);
      return date >= weekStart && date <= weekEnd;
    });
    
    const lastWeekAdmins = administrations.filter(a => {
      const date = new Date(a.administered_at);
      return date >= lastWeekStart && date <= lastWeekEnd;
    });

    // Critical patients
    const criticalPatients = patients.filter(p => p.status === 'critico');
    const hospitalizedPatients = patients.filter(p => p.status === 'hospitalizado' || p.status === 'critico');
    
    // Budget calculations
    const totalBudget = patients.reduce((sum, p) => sum + p.current_budget, 0);
    const lowBudgetPatients = patients.filter(p => {
      const percentage = p.initial_budget > 0 ? (p.current_budget / p.initial_budget) * 100 : 0;
      return percentage < 20 && percentage > 0;
    });

    // Active medications
    const activeMedications = medications.filter(m => {
      const now = new Date();
      const endDate = new Date(m.end_date);
      return m.status === 'activo' && endDate > now;
    });

    // Calculate trends
    const adminTrend = yesterdayAdmins.length > 0 
      ? ((todayAdmins.length - yesterdayAdmins.length) / yesterdayAdmins.length) * 100 
      : todayAdmins.length > 0 ? 100 : 0;

    const weekTrend = lastWeekAdmins.length > 0 
      ? ((thisWeekAdmins.length - lastWeekAdmins.length) / lastWeekAdmins.length) * 100 
      : thisWeekAdmins.length > 0 ? 100 : 0;

    return {
      criticalPatients: criticalPatients.length,
      hospitalizedPatients: hospitalizedPatients.length,
      todayAdmins: todayAdmins.length,
      activeMedications: activeMedications.length,
      totalBudget,
      lowBudgetPatients: lowBudgetPatients.length,
      adminTrend,
      weekTrend,
      totalPatients: patients.length
    };
  };

  const stats = generateAdvancedStats();

  // Critical patients only (for dashboard focus)
  const criticalPatients = patients.filter(p => p.status === 'critico');
  
  // Pending administrations (medications that should have been given today but haven't)
  const pendingToday = medications.filter(med => {
    const today = new Date();
    const startDate = new Date(med.start_date);
    const endDate = new Date(med.end_date);
    
    if (startDate > today || endDate < today || med.status !== 'activo') return false;
    
    // Check if there's an administration today for this medication
    const todayAdmin = administrations.find(admin => 
      admin.medication_id === med.id && 
      isToday(new Date(admin.administered_at))
    );
    
    return !todayAdmin;
  });

  if (error) {
    return (
      <div className="p-4 text-center text-red-600 dark:text-red-400">
        <p>Error cargando el dashboard: {error}</p>
      </div>
    );
  }


  const handleQuickAction = (action: string) => {
    // Create a custom event to trigger navigation
    const event = new CustomEvent('navigate', { detail: { view: action } });
    window.dispatchEvent(event);
  };

  // Listen for navigation events
  React.useEffect(() => {
    const handleNavigate = (event: any) => {
      const view = event.detail.view;
      // This will be handled by the parent component
      if (view === 'patients' || view === 'patient-management' || view === 'medication-programming' || view === 'reports' || view === 'billing') {
        // Trigger a click on the corresponding sidebar button
        const button = document.querySelector(`[data-view="${view}"]`) as HTMLButtonElement;
        if (button) {
          button.click();
        }
      }
    };

    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  return (
    <ErrorBoundary>
      <div className="space-y-4 max-w-full overflow-hidden">
        <div className="px-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Panel de Control</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Resumen ejecutivo y pacientes que requieren atención inmediata</p>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" text="Cargando dashboard..." />
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <MetricCard
            icon={AlertTriangle}
            title="Críticos"
            value={stats.criticalPatients}
            subtitle="Atención inmediata"
            iconColor="bg-gradient-to-r from-red-500 to-red-600"
            onClick={() => handleQuickAction('patients')}
            loading={loading}
          />
          <MetricCard
            icon={Heart}
            title="Hospitalizados"
            value={stats.hospitalizedPatients}
            subtitle="Total pacientes"
            iconColor="bg-gradient-to-r from-secondary-500 to-secondary-600"
            onClick={() => handleQuickAction('patients')}
            loading={loading}
          />
          <MetricCard
            icon={Clock}
            title="Pendientes"
            value={pendingToday.length}
            subtitle="Por administrar"
            iconColor="bg-gradient-to-r from-accent-500 to-accent-600"
            onClick={() => handleQuickAction('medication-programming')}
            loading={loading}
          />
          <MetricCard
            icon={CheckCircle}
            title="Hoy"
            value={stats.todayAdmins}
            subtitle="Completadas"
            iconColor="bg-gradient-to-r from-primary-500 to-primary-600"
            trend={{ 
              value: Math.abs(Math.round(stats.adminTrend)), 
              isPositive: stats.adminTrend >= 0,
              label: `vs. ayer`
            }}
            onClick={() => handleQuickAction('medication-programming')}
            loading={loading}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            icon={Pill}
            title="Medicaciones Activas"
            value={stats.activeMedications}
            iconColor="bg-gradient-to-r from-blue-500 to-blue-600"
            onClick={() => handleQuickAction('medication-programming')}
            loading={loading}
          />
          
          <MetricCard
            icon={DollarSign}
            title="Presupuesto Total"
            value={`$${stats.totalBudget.toLocaleString()}`}
            subtitle={`${stats.lowBudgetPatients} con presupuesto bajo`}
            iconColor="bg-gradient-to-r from-green-500 to-green-600"
            onClick={() => handleQuickAction('billing')}
            loading={loading}
          />
          
          <MetricCard
            icon={Users}
            title="Total Pacientes"
            value={stats.totalPatients}
            iconColor="bg-gradient-to-r from-purple-500 to-purple-600"
            onClick={() => handleQuickAction('patients')}
            loading={loading}
          />
          
          <MetricCard
            icon={FileText}
            title="Reportes"
            value="Ver"
            subtitle="Estadísticas detalladas"
            iconColor="bg-gradient-to-r from-indigo-500 to-indigo-600"
            onClick={() => handleQuickAction('reports')}
            loading={loading}
          />
        </div>

        {/* Critical Patients Alert */}
        {criticalPatients.length > 0 && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 sm:p-4">
            <div className="flex items-start space-x-2 sm:space-x-3 mb-3">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <h3 className="text-sm sm:text-base font-medium text-red-800 dark:text-red-300">Pacientes en Estado Crítico</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              {criticalPatients.map((patient) => (
                <div 
                  key={patient.id} 
                  className="bg-white dark:bg-dark-800 rounded-lg p-2 sm:p-3 cursor-pointer hover:shadow-md transition-shadow border border-red-200 dark:border-red-700"
                  onClick={() => onPatientSelect && onPatientSelect(patient.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 pr-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">{patient.name}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{patient.species} - Jaula {patient.cage}</p>
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium">Crítico</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {format(new Date(patient.admission_date), 'dd/MM', { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Medications Today */}
        {pendingToday.length > 0 && !loading && (
          <div className="bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-700 rounded-lg p-3 sm:p-4">
            <div className="flex items-start space-x-2 sm:space-x-3 mb-3">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
              <h3 className="text-sm sm:text-base font-medium text-accent-800 dark:text-accent-300">Medicaciones Pendientes Hoy</h3>
            </div>
            <div className="space-y-2">
              {pendingToday.slice(0, 5).map((medication) => {
                const patient = patients.find(p => p.id === medication.patient_id);
                return (
                  <div 
                    key={medication.id}
                    className="bg-white dark:bg-dark-800 rounded-lg p-2 sm:p-3 cursor-pointer hover:shadow-md transition-shadow border border-accent-200 dark:border-accent-700"
                    onClick={() => patient && onPatientSelect && onPatientSelect(patient.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">{medication.medication_name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {patient?.name} - {medication.dose} - {medication.frequency}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-xs bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-300 px-2 py-1 rounded-full whitespace-nowrap">
                          Pendiente
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {pendingToday.length > 5 && (
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  Y {pendingToday.length - 5} medicaciones más...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow border border-gray-200 dark:border-dark-700 p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-3">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            <button 
              onClick={() => handleQuickAction('patients')}
              className="flex items-center justify-center p-2 sm:p-3 bg-gradient-to-r from-secondary-50 to-primary-50 dark:from-secondary-900/20 dark:to-primary-900/20 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-secondary-500"
            >
              <Heart className="h-4 w-4 text-secondary-600 dark:text-secondary-400 flex-shrink-0 mr-1 sm:mr-2" />
              <span className="font-medium text-secondary-700 dark:text-secondary-300 text-xs sm:text-sm text-center">Ver Pacientes</span>
            </button>
            
            <button 
              onClick={() => handleQuickAction('patient-management')}
              className="flex items-center justify-center p-2 sm:p-3 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-200 dark:border-primary-700 rounded-lg hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Users className="h-4 w-4 text-primary-600 dark:text-primary-400 flex-shrink-0 mr-1 sm:mr-2" />
              <span className="font-medium text-primary-700 dark:text-primary-300 text-xs sm:text-sm text-center">Gestionar</span>
            </button>
            
            <button 
              onClick={() => handleQuickAction('medication-programming')}
              className="flex items-center justify-center p-2 sm:p-3 bg-gradient-to-r from-secondary-50 to-primary-50 dark:from-secondary-900/20 dark:to-primary-900/20 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-secondary-500"
            >
              <Clock className="h-4 w-4 text-secondary-600 dark:text-secondary-400 flex-shrink-0 mr-1 sm:mr-2" />
              <span className="font-medium text-secondary-700 dark:text-secondary-300 text-xs sm:text-sm text-center">Programación</span>
            </button>
            
            <button 
              onClick={() => handleQuickAction('billing')}
              className="flex items-center justify-center p-2 sm:p-3 bg-gradient-to-r from-green-50 to-primary-50 dark:from-green-900/20 dark:to-primary-900/20 border border-green-200 dark:border-green-700 rounded-lg hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mr-1 sm:mr-2" />
              <span className="font-medium text-green-700 dark:text-green-300 text-xs sm:text-sm text-center">Facturación</span>
            </button>
            
            <button 
              onClick={() => handleQuickAction('reports')}
              className="flex items-center justify-center p-2 sm:p-3 bg-gradient-to-r from-accent-50 to-secondary-50 dark:from-accent-900/20 dark:to-secondary-900/20 border border-accent-200 dark:border-accent-700 rounded-lg hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-accent-500 col-span-2 sm:col-span-1"
            >
              <Activity className="h-4 w-4 text-accent-600 dark:text-accent-400 flex-shrink-0 mr-1 sm:mr-2" />
              <span className="font-medium text-accent-700 dark:text-accent-300 text-xs sm:text-sm text-center">Reportes</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {stats.hospitalizedPatients === 0 && !loading && (
          <div className="text-center py-8 sm:py-12">
            <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-2">No hay pacientes hospitalizados</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-4">
              Cuando ingresen pacientes, aparecerán aquí en el dashboard
            </p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;