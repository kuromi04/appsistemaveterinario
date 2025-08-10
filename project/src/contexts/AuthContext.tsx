import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { supabase, isSupabaseConfigured, handleSupabaseError, clearStaleSession, testSupabaseConnection } from '../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'medico' | 'auxiliar' | 'admin';
  license?: string;
  profile?: Profile;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  clearSession: () => Promise<void>;
}

interface SignUpData {
  name: string;
  role: 'medico' | 'auxiliar';
  license?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users for demo mode
const DEMO_USERS = [
  {
    id: '1',
    name: 'Dr. Ana García',
    email: 'ana.garcia@animalsweet.com',
    role: 'medico' as const,
    license: 'MV001234',
    password: 'demo123'
  },
  {
    id: '2',
    name: 'María López',
    email: 'maria.lopez@animalsweet.com',
    role: 'auxiliar' as const,
    password: 'demo123'
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Supabase is configured, use real auth
    if (isSupabaseConfigured() && supabase) {
      initializeSupabaseAuth();
    } else {
      // Use demo mode
      console.log('Running in demo mode - Supabase not configured');
      
      // Check for existing demo session
      const savedUser = localStorage.getItem('demo-user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('demo-user');
        }
      }
      
      setLoading(false);
    }
  }, []);

  const initializeSupabaseAuth = async () => {
    try {
      // Test Supabase connectivity first
      let connectivityTest;
      try {
        connectivityTest = await Promise.race([
          supabase!.auth.getSession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 3000)
          )
        ]);
      } catch (connectivityError) {
        console.warn('Supabase connectivity test failed:', connectivityError);
        throw connectivityError; // This will trigger the fallback to demo mode
      }
      
      const { data: { session }, error } = connectivityTest as any;
      
      if (error) {
        console.error('Error getting session:', error);
        
        if (error.message?.includes('Invalid Refresh Token') || error.message?.includes('refresh_token_not_found')) {
          console.log('Clearing stale session due to invalid refresh token');
          await clearStaleSession();
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
      } else {
        setSession(session);
        if (session?.user) {
          await loadUserProfile(session.user);
        }
      }
    } catch (error) {
      console.error('Failed to connect to Supabase, falling back to demo mode:', error);
      
      // If we can't connect to Supabase, fall back to demo mode
      const savedUser = localStorage.getItem('demo-user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        } catch (parseError) {
          console.error('Error parsing saved demo user:', parseError);
          localStorage.removeItem('demo-user');
        }
      }
      
      setSession(null);
    } finally {
      setLoading(false);
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.log('Token refresh failed, clearing session');
        await clearStaleSession();
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      
      setSession(session);
      
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  };

  const loadUserProfile = async (authUser: User) => {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        console.error('Supabase no configurado');
        return;
      }

      // Add timeout and network error handling to prevent hanging requests
      let profile = null;
      let error = null;
      
      try {
        const profileQuery = supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile query timeout')), 5000)
        );

        const result = await Promise.race([
          profileQuery,
          timeoutPromise
        ]) as any;
        
        profile = result.data;
        error = result.error;
      } catch (networkError) {
        console.warn('Network error loading profile, using fallback:', networkError);
        // Set error to null to trigger fallback behavior
        error = null;
        profile = null;
      }

      if (error) {
        console.error('Error loading profile:', error);
        
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, use user_metadata without trying to create it immediately
          // The profile will be created when the user updates their profile or through other means
          console.log('Profile not found, using user metadata');
          setUser({
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email || 'Usuario',
            email: authUser.email || '',
            role: authUser.user_metadata?.role || 'auxiliar',
            license: authUser.user_metadata?.license
          });
        } else {
          // Otro error, usar user_metadata como fallback
          setUser({
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email || 'Usuario',
            email: authUser.email || '',
            role: authUser.user_metadata?.role || 'auxiliar',
            license: authUser.user_metadata?.license
          });
        }
      } else {
        // Profile loaded successfully
        setUser({
          id: authUser.id,
          name: profile.name || authUser.user_metadata?.name || authUser.email || 'Usuario',
          email: authUser.email || '',
          role: profile.role || authUser.user_metadata?.role || 'auxiliar',
          license: profile.license || authUser.user_metadata?.license,
          profile: profile
        });
      }

    } catch (error) {
      console.warn('Unexpected error in loadUserProfile, using fallback:', error);
      // Always fallback to user_metadata in case of any error
      setUser({
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email || 'Usuario',
        email: authUser.email || '',
        role: authUser.user_metadata?.role || 'auxiliar',
        license: authUser.user_metadata?.license
      });
    }
  };

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    // Check for Supabase connectivity
    let supabaseAvailable = false;
    if (isSupabaseConfigured() && supabase) {
      try {
        // Quick connectivity test
        await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 3000)
          )
        ]);
        supabaseAvailable = true;
      } catch (error) {
        console.log('Supabase unavailable, using demo mode for signup:', error);
        supabaseAvailable = false;
      }
    }

    if (!supabaseAvailable) {
      // Demo mode signup
      const existingUser = DEMO_USERS.find(u => u.email === email);
      if (existingUser) {
        return { success: false, error: 'Este email ya está registrado. Intenta iniciar sesión.' };
      }

      const newUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: email,
        role: userData.role,
        license: userData.license
      };

      setUser(newUser);
      localStorage.setItem('demo-user', JSON.stringify(newUser));
      
      return { success: true };
    }

    try {
      setLoading(true);
      
        const { data, error } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
            license: userData.license
          }
        }
      });

      if (error) {
        console.error('SignUp error:', error);
        return { success: false, error: handleSupabaseError(error) };
      }

      if (data.user && !data.session) {
        // Usuario creado, necesita confirmar email o ya puede iniciar sesión
        // Crear perfil manualmente si no se creó automáticamente
        if (data.user.id) {
          try {
              const { error: profileError } = await supabase!
                .from('profiles')
                .insert({
                id: data.user.id,
                name: userData.name,
                role: userData.role,
                license: userData.license || null
              });
            
            if (profileError && profileError.code !== '23505') { // Ignore duplicate key error
              console.error('Error creating profile:', profileError);
            }
          } catch (profileError) {
            console.error('Failed to create profile:', profileError);
          }
        }
        
        return { 
          success: true, 
          error: 'Usuario registrado exitosamente. Ya puedes iniciar sesión con tus credenciales.' 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('SignUp error:', error);
      return { success: false, error: handleSupabaseError(error) };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    // Check for Supabase connectivity
    const supabaseAvailable = await testSupabaseConnection();

    if (!supabaseAvailable) {
      // Demo mode login
      const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
      if (!demoUser) {
        return { success: false, error: 'Credenciales incorrectas. Usa ana.garcia@animalsweet.com o maria.lopez@animalsweet.com con contraseña: demo123' };
      }

      const { password: _, ...userWithoutPassword } = demoUser;
      setUser(userWithoutPassword);
      localStorage.setItem('demo-user', JSON.stringify(userWithoutPassword));
      
      return { success: true };
    }

    try {
      setLoading(true);
      
        const { error } = await supabase!.auth.signInWithPassword({
          email,
          password
        });

      if (error) {
        console.error('SignIn error:', error);
        
        // Provide more helpful error messages for common cases
        if (error.message === 'Invalid login credentials') {
          return { 
            success: false, 
            error: 'Credenciales incorrectas. Verifica tu email y contraseña. Si es tu primera vez, necesitas registrarte primero.' 
          };
        }
        
        if (error.message.includes('User not found') || error.message.includes('user_not_found')) {
          return { 
            success: false, 
            error: 'No existe una cuenta con este email. ¿Es tu primera vez? Regístrate para crear una cuenta nueva.' 
          };
        }
        
        return { success: false, error: handleSupabaseError(error) };
      }

      return { success: true };
    } catch (error) {
      console.error('SignIn network error:', error);
      
      // If it's a network error, fall back to demo mode
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const demoUser = DEMO_USERS.find(u => u.email === email);
        if (demoUser) {
          return { 
            success: false, 
            error: 'No se puede conectar al servidor. Usando modo demo. Credenciales: ana.garcia@animalsweet.com / demo123 o maria.lopez@animalsweet.com / demo123' 
          };
        }
      }
      
      return { success: false, error: handleSupabaseError(error) };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode logout
      setUser(null);
      localStorage.removeItem('demo-user');
      return;
    }

    try {
      setLoading(true);
      
      // First check if there's an active session before attempting to sign out
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.warn('Error checking session during logout (proceeding with local cleanup):', sessionError);
      } else if (session) {
        // Only attempt to sign out if there's an active session
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.warn('Error during sign out (proceeding with local cleanup):', error);
        }
      } else {
        console.log('No active session found, skipping server sign out');
      }
    } catch (error) {
      console.warn('Network error during logout (proceeding with local cleanup):', error);
    } finally {
      // Always clear local state regardless of server response
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode update
      if (!user) {
        return { success: false, error: 'No hay usuario autenticado' };
      }

      const updatedUser = {
        ...user,
        name: profileData.name || user.name,
        license: profileData.license || user.license
      };

      setUser(updatedUser);
      localStorage.setItem('demo-user', JSON.stringify(updatedUser));
      
      return { success: true };
    }

    try {
      if (!user) {
        return { success: false, error: 'No hay usuario autenticado' };
      }

      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }

      setUser(prev => prev ? { 
        ...prev, 
        name: profileData.name || prev.name,
        role: profileData.role || prev.role,
        license: profileData.license || prev.license
      } : null);
      
      return { success: true };
    } catch (error) {
      console.error('UpdateProfile error:', error);
      return { success: false, error: handleSupabaseError(error) };
    }
  };

  const clearSession = async () => {
    try {
      setLoading(true);
      
      if (!isSupabaseConfigured() || !supabase) {
        // Demo mode clear
        setUser(null);
        localStorage.removeItem('demo-user');
        setLoading(false);
        return;
      }

      await clearStaleSession();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Error clearing session:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    logout,
    updateProfile,
    clearSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};