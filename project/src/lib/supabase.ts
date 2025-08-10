import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabase);
};

export const handleSupabaseError = (error: any): string => {
  if (error?.message) {
    // Handle specific Supabase error messages
    if (error.message.includes('User already registered') || error.message.includes('user_already_exists')) {
      return 'Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.';
    }
    if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
      return 'Credenciales incorrectas. Verifica tu email y contraseña. Si es tu primera vez, regístrate primero.';
    }
    if (error.message.includes('User not found') || error.message.includes('user_not_found')) {
      return 'No existe una cuenta con este email. Regístrate para crear una cuenta nueva.';
    }
    if (error.message.includes('Email not confirmed')) {
      return 'Cuenta no confirmada. Si acabas de registrarte, revisa tu email para confirmar la cuenta, o verifica que la confirmación por email esté deshabilitada en Supabase.';
    }
    if (error.message.includes('Password should be at least')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (error.message.includes('Unable to validate email address')) {
      return 'El formato del correo electrónico no es válido.';
    }
    if (error.message.includes('row-level security')) {
      return 'No tiene permisos para realizar esta acción';
    }
    if (error.message.includes('duplicate key')) {
      return 'Este registro ya existe';
    }
    if (error.message.includes('foreign key')) {
      return 'No se puede completar la operación debido a dependencias';
    }
    if (error.message.includes('not null')) {
      return 'Faltan campos obligatorios';
    }
    return error.message;
  }
  
  // Handle errors with code property
  if (error?.code) {
    switch (error.code) {
      case 'user_already_exists':
        return 'Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.';
      case 'invalid_credentials':
        return 'Credenciales incorrectas. Verifica tu correo electrónico y contraseña.';
      case 'email_not_confirmed':
        return 'Por favor, confirma tu correo electrónico antes de iniciar sesión.';
      case 'weak_password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'invalid_email':
        return 'El formato del correo electrónico no es válido.';
      case 'signup_disabled':
        return 'El registro está deshabilitado temporalmente.';
      case 'email_address_invalid':
        return 'El formato del correo electrónico no es válido.';
      default:
        break;
    }
  }
  
  return 'Error desconocido en la base de datos';
};

export const clearStaleSession = async (): Promise<void> => {
  if (!supabase) return;
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.warn('Error clearing stale session:', error);
  }
};