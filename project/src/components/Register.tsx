import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, AlertCircle, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'auxiliar' as 'medico' | 'auxiliar',
    license: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    if (formData.role === 'medico' && !formData.license) {
      setError('El número de licencia es requerido para médicos veterinarios');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp(formData.email, formData.password, {
        name: formData.name,
        role: formData.role,
        license: formData.license || undefined
      });

      if (result.success) {
        if (isSupabaseConfigured()) {
          setSuccess('Usuario registrado exitosamente. Redirigiendo...');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setSuccess('Usuario registrado exitosamente en modo demo. Redirigiendo...');
          setTimeout(() => {
            navigate('/login');
          }, 1000);
        }
      } else {
        setError(result.error || 'Error al registrar usuario');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 flex items-center justify-center p-4 transition-colors">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 p-3 sm:p-4 rounded-2xl shadow-2xl">
              <img 
                src="/photo_5096192771215175245_x.jpg" 
                alt="Animal Sweet Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
              />
            </div>
          </div>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Animal Sweet</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isSupabaseConfigured() ? 'Registro de Usuario' : 'Registro Demo'}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl border border-gray-200 dark:border-dark-700 p-6 sm:p-8">
          <button
            onClick={handleBackToLogin}
            className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al login</span>
          </button>

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 px-4 py-3 rounded-md flex items-center">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">{success}</span>
              </div>
            )}

            {!isSupabaseConfigured() && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-md">
                <p className="text-sm">
                  <strong>Modo Demo:</strong> Los usuarios registrados aquí solo funcionarán en esta sesión.
                </p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre completo *
              </label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400 text-sm sm:text-base"
                  placeholder="Nombre completo"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Correo electrónico *
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400 text-sm sm:text-base"
                  placeholder="usuario@animalsweet.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rol *
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400 text-sm sm:text-base"
              >
                <option value="auxiliar">Auxiliar Veterinario</option>
                <option value="medico">Médico Veterinario</option>
              </select>
            </div>

            {formData.role === 'medico' && (
              <div>
                <label htmlFor="license" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Número de licencia *
                </label>
                <input
                  id="license"
                  name="license"
                  type="text"
                  required
                  value={formData.license}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400 text-sm sm:text-base"
                  placeholder="Ejemplo: MV001234"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Número de registro profesional veterinario
                </p>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña *
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400 text-sm sm:text-base"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmar contraseña *
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 pr-10 block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400 text-sm sm:text-base"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-gradient-to-r from-secondary-600 to-primary-600 hover:from-secondary-700 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? 'Registrando...' : 'Registrar Usuario'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Desarrollado por <span className="font-medium text-primary-600 dark:text-primary-400">andresch</span> de{' '}
            <a href="https://t.me/tiendastelegram" target="_blank" rel="noopener noreferrer" className="text-secondary-600 dark:text-secondary-400 hover:underline">
              @tiendastelegram
            </a>
            {' '}© 2025 Animal Sweet
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;