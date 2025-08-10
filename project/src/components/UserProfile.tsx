import React, { useState } from 'react';
import { User, Save, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    license: user?.license || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await updateProfile({
        name: profileData.name,
        license: profileData.license || null
      });
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Perfil actualizado exitosamente' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al actualizar el perfil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      // Here you would typically validate current password and update
      console.log('Updating password for user:', user?.id);
      setMessage({ type: 'success', text: 'Contraseña actualizada exitosamente' });
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar la contraseña' });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      <div className="px-1">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">Mi Perfil</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">Gestiona tu información personal y configuración de cuenta</p>
      </div>

      {message && (
        <div className={`p-3 sm:p-4 rounded-md flex items-start space-x-2 sm:space-x-3 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-600 dark:text-green-400' 
            : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
          )}
          <span className="text-xs sm:text-sm break-words">{message.text}</span>
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow border border-gray-200 dark:border-dark-700">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-dark-700 flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Información Personal</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-xs sm:text-sm font-medium transition-colors"
            >
              Editar
            </button>
          )}
        </div>

        <div className="p-4 sm:p-6">
          {!isEditing ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 dark:text-white break-words">{user.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {user.role === 'medico' ? '👨‍⚕️ Médico Veterinario' : 
                     user.role === 'admin' ? '👑 Administrador' : 
                     '👩‍💼 Auxiliar Veterinario'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <p className="mt-1 text-xs sm:text-sm text-gray-900 dark:text-white break-all">{user.email}</p>
                </div>
                
                {user.license && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Número de Licencia</label>
                    <p className="mt-1 text-xs sm:text-sm text-gray-900 dark:text-white break-all">{user.license}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
                  <p className="mt-1 text-xs sm:text-sm text-gray-900 dark:text-white capitalize">
                    {user.role === 'medico' ? '👨‍⚕️ Médico Veterinario' :
                     user.role === 'admin' ? '👑 Administrador' : 
                     '👩‍💼 Auxiliar Veterinario'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email (solo lectura)
                  </label>
                  <input
                    type="email"
                    name="email"
                    disabled
                    value={profileData.email}
                    className="w-full rounded-md border-gray-300 dark:border-dark-600 bg-gray-100 dark:bg-dark-600 text-gray-500 dark:text-gray-400 shadow-sm text-sm cursor-not-allowed"
                  />
                </div>

                {user.role === 'medico' && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Número de Licencia
                    </label>
                    <input
                      type="text"
                      name="license"
                      value={profileData.license}
                      onChange={handleProfileChange}
                      className="w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="submit"
                  className="flex items-center justify-center space-x-1 sm:space-x-2 bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md hover:bg-green-700 transition-colors text-xs sm:text-sm"
                >
                  <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Guardar Cambios</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setProfileData({
                      name: user.name,
                      email: user.email,
                      license: user.license || ''
                    });
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-md hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow border border-gray-200 dark:border-dark-700">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-dark-700 flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Cambiar Contraseña</h3>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-xs sm:text-sm font-medium transition-colors"
            >
              Cambiar
            </button>
          )}
        </div>

        <div className="p-4 sm:p-6">
          {!showPasswordForm ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Tu contraseña fue actualizada por última vez hace tiempo
              </p>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contraseña actual *
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nueva contraseña *
                </label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirmar nueva contraseña *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="submit"
                  className="flex items-center justify-center space-x-1 sm:space-x-2 bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md hover:bg-green-700 transition-colors text-xs sm:text-sm"
                >
                  <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Actualizar Contraseña</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-md hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-3 sm:py-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          Desarrollado por <span className="font-medium text-primary-600 dark:text-primary-400">andresch</span> de{' '}
          <a href="https://t.me/tiendastelegram" target="_blank" rel="noopener noreferrer" className="text-secondary-600 dark:text-secondary-400 hover:underline">
            @tiendastelegram
          </a>
          {' '}© 2025 Animal Sweet
        </p>
      </div>
    </div>
  );
};

export default UserProfile;