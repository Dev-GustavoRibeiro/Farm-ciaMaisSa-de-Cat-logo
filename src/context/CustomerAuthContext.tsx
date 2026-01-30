'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient, User, Session, SupabaseClient } from '@supabase/supabase-js';

// Tipo para dados do cliente
export interface CustomerProfile {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  neighborhood?: string;
  complement?: string;
  created_at: string;
}

// Criar cliente Supabase singleton para CLIENTES
let customerSupabaseInstance: SupabaseClient | null = null;

function getCustomerSupabase() {
  if (!customerSupabaseInstance) {
    customerSupabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'farmacia-customer-auth',
        },
      }
    );
  }
  return customerSupabaseInstance;
}

interface CustomerAuthContextType {
  user: User | null;
  session: Session | null;
  profile: CustomerProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<CustomerProfile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() => getCustomerSupabase());

  // Criar perfil temporário em memória
  const createTemporaryProfile = (userId: string, userEmail?: string, userName?: string): CustomerProfile => ({
    id: '',
    user_id: userId,
    name: userName || '',
    email: userEmail || '',
    phone: '',
    created_at: new Date().toISOString(),
  });

  // Buscar perfil do cliente
  const fetchProfile = async (userId: string, userEmail?: string, userName?: string) => {
    try {
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) {
        setProfile(createTemporaryProfile(userId, userEmail, userName));
        return;
      }

      setProfile(data);
    } catch {
      setProfile(createTemporaryProfile(userId, userEmail, userName));
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(
            currentSession.user.id,
            currentSession.user.email,
            currentSession.user.user_metadata?.name
          );
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Auth error:', err);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await fetchProfile(
            newSession.user.id,
            newSession.user.email,
            newSession.user.user_metadata?.name
          );
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: 'E-mail ou senha incorretos' };
      }

      if (data.user) {
        // Verificar se é admin (admins não podem usar área de clientes)
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (adminData) {
          await supabase.auth.signOut();
          return { error: 'Esta conta é de administrador. Use a área administrativa.' };
        }
      }

      return { error: null };
    } catch {
      return { error: 'Erro ao fazer login' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone: string
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone },
        },
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch {
      return { error: 'Erro ao criar conta' };
    }
  };

  const signOut = async () => {
    try {
      // Limpar estados primeiro para feedback imediato
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro ao fazer logout:', error);
      }
      
      // Limpar storage manualmente para garantir
      if (typeof window !== 'undefined') {
        localStorage.removeItem('farmacia-customer-auth');
        // Limpar outros tokens possíveis
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      // Mesmo com erro, limpar estados locais
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  const updateProfile = async (data: Partial<CustomerProfile>): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const { data: existingProfile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        const { error } = await supabase
          .from('customer_profiles')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);

        if (error) return { error: error.message };
      } else {
        const { error } = await supabase
          .from('customer_profiles')
          .insert({ user_id: user.id, email: user.email, ...data });

        if (error) return { error: error.message };
      }

      await fetchProfile(user.id, user.email, data.name);
      return { error: null };
    } catch {
      return { error: 'Erro ao atualizar perfil' };
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isAuthenticated: !!session,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
