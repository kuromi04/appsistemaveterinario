import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Calendar, FileText, Settings, Menu, X, Moon, Sun, List, DollarSign, Clock, Edit, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Map routes to menu item IDs for highlighting
  const getViewFromPath = (pathname: string): string => {
    if (pathname === '/dashboard') return 'dashboard';
    if (pathname === '/patients') return 'patients';
    if (pathname === '/patient-management') return 'patient-management';
    if (pathname.startsWith('/patients/') && pathname.endsWith('/kardex')) return 'patients';
    if (pathname === '/medications') return 'medication-programming';
    if (pathname === '/billing') return 'billing';
    if (pathname === '/reports') return 'reports';
    if (pathname === '/advanced-reports') return 'advanced-reports';
    if (pathname === '/profile') return 'profile';
    return 'dashboard';
  };

  const currentView = getViewFromPath(location.pathname);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Calendar, description: 'Resumen ejecutivo', route: '/dashboard' },
    { id: 'patients', label: 'Lista Pacientes', icon: List, description: 'Ver todos los pacientes', route: '/patients' },
    { id: 'patient-management', label: 'Gestión', icon: Edit, description: 'Crear y editar pacientes', route: '/patient-management' },
    { id: 'medication-programming', label: 'Programación', icon: Clock, description: 'Control de medicamentos', route: '/medications' },
    { id: 'billing', label: 'Facturación', icon: DollarSign, description: 'Medicamentos y costos', route: '/billing' },
    { id: 'reports', label: 'Reportes', icon: FileText, description: 'Estadísticas básicas', route: '/reports' },
    { id: 'advanced-reports', label: 'Reportes Avanzados', icon: BarChart3, description: 'Análisis detallado', route: '/advanced-reports' },
    { id: 'profile', label: 'Perfil', icon: Settings, description: 'Configuración', route: '/profile' },
  ];

  const handleMenuClick = (route: string) => {
    navigate(route);
    setSidebarOpen(false);
  };

  // Close sidebar when clicking outside on mobile
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const menuButton = document.getElementById('mobile-menu-button');
      
      if (sidebarOpen && sidebar && menuButton && 
          !sidebar.contains(event.target as Node) && 
          !menuButton.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  // Add data attributes for quick actions
  React.useEffect(() => {
    menuItems.forEach(item => {
      const button = document.querySelector(`[data-view="${item.id}"]`);
      if (button) {
        button.setAttribute('data-view', item.id);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors overflow-x-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 shadow-sm border-b border-gray-200 dark:border-dark-700 relative z-40 sticky top-0">
        <div className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between max-w-full">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <button
                id="mobile-menu-button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 flex-shrink-0"
                aria-label="Abrir menú"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-1.5 rounded-lg shadow-lg flex-shrink-0">
                  <img 
                    src="/photo_5096192771215175245_x.jpg" 
                    alt="Animal Sweet Logo" 
                    className="h-5 w-5 object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate">Animal Sweet</h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block truncate">Kardex Veterinario</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                title={isDark ? 'Modo claro' : 'Modo oscuro'}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              
              <div className="flex items-center space-x-1 min-w-0 max-w-32">
                <User className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div className="text-right hidden xs:block min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 capitalize truncate">
                    {user?.role === 'medico' ? '👨‍⚕️ Médico' : user?.role === 'admin' ? '👑 Admin' : '👩‍💼 Auxiliar'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          id="mobile-sidebar"
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-64 bg-white dark:bg-dark-800 shadow-lg h-screen border-r border-gray-200 dark:border-dark-700
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            overflow-y-auto
          `}
        >
          {/* Mobile header spacer */}
          <div className="h-14 lg:h-0"></div>
          
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  data-view={item.id}
                  onClick={() => handleMenuClick(item.route)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block text-sm truncate">{item.label}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 truncate">
                      {item.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer in sidebar for mobile */}
          <div className="lg:hidden p-4 border-t border-gray-200 dark:border-dark-700 mt-auto">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Desarrollado por <span className="font-medium text-primary-600 dark:text-primary-400">andresch</span> de{' '}
              <a href="https://t.me/tiendastelegram" target="_blank" rel="noopener noreferrer" className="text-secondary-600 dark:text-secondary-400 hover:underline">
                @tiendastelegram
              </a>
              <br />© 2025 Animal Sweet
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen w-0">
          <div className="p-2 sm:p-4 lg:p-6 max-w-full overflow-hidden">
            {children}
          </div>
          
          {/* Footer for desktop */}
          <div className="hidden lg:block p-6 border-t border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Desarrollado por <span className="font-medium text-primary-600 dark:text-primary-400">andresch</span> de{' '}
              <a href="https://t.me/tiendastelegram" target="_blank" rel="noopener noreferrer" className="text-secondary-600 dark:text-secondary-400 hover:underline">
                @tiendastelegram
              </a>
              {' '}© 2025 Animal Sweet
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;