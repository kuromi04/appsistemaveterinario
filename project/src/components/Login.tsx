import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { Heart, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sistema Veterinario
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inicia sesión en tu cuenta
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <div className="text-sm">
                <p>{error}</p>
                {error.includes('Credenciales incorrectas') && (
                  <p className="mt-2 text-blue-600 font-medium">
                    💡 Si es tu primera vez, haz clic en "Regístrate aquí" abajo para crear una cuenta.
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link 
                to="/register" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Regístrate aquí
              </Link>
            </span>
          </div>
        </form>

        <div className="mt-8 text-center">
          {isSupabaseConfigured() ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">
                ✨ ¿Primera vez en el sistema?
              </h3>
              <div className="text-xs text-green-700 space-y-2">
                <p>
                  <strong>1.</strong> Haz clic en <strong>"Regístrate aquí"</strong> arriba para crear tu cuenta
                </p>
                <p>
                  <strong>2.</strong> Completa el formulario con tus datos
                </p>
                <p>
                  <strong>3.</strong> Luego regresa aquí para iniciar sesión
                </p>
                <p className="mt-2 font-medium text-green-800">
                  📝 No olvides tu rol: Doctor o Auxiliar
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                🎯 Usuarios de demostración
              </h3>
              <div className="text-xs text-yellow-700 space-y-1">
                <p><strong>Doctor:</strong> ana.garcia@animalsweet.com / demo123</p>
                <p><strong>Auxiliar:</strong> maria.lopez@animalsweet.com / demo123</p>
                <p className="mt-2 text-yellow-600">
                  <strong>⚡ Modo demo activo</strong> - Supabase no configurado
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;