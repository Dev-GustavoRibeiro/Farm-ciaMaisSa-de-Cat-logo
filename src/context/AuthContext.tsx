'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient, User, Session, SupabaseClient } from '@supabase/supabase-js';

// Criar cliente Supabase singleton para ADMIN
let adminSupabaseInstance: SupabaseClient | null = null;

function getAdminSupabase() {
  if (!adminSupabaseInstance) {
    adminSupabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'farmacia-admin-auth',
        },
      }
    );
  }
  return adminSupabaseInstance;
}

// Eventos de autenticação para notificações
export type AuthEvent = 'login_success' | 'login_error' | 'logout' | 'session_expired' | 'timeout_error';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  hasError: boolean;
  errorMessage: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null; success: boolean }>;
  signOut: () => Promise<void>;
  retryAuth: () => Promise<void>;
  isAuthenticated: boolean;
  supabase: SupabaseClient;
  // Callback para notificações externas
  onAuthEvent?: (event: AuthEvent, message: string) => void;
  setOnAuthEvent: (callback: (event: AuthEvent, message: string) => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [supabase] = useState(() => getAdminSupabase());
  const [onAuthEvent, setOnAuthEventState] = useState<((event: AuthEvent, message: string) => void) | undefined>();

  const setOnAuthEvent = useCallback((callback: (event: AuthEvent, message: string) => void) => {
    setOnAuthEventState(() => callback);
  }, []);

  const notifyAuthEvent = useCallback((event: AuthEvent, message: string) => {
    if (onAuthEvent) {
      onAuthEvent(event, message);
    }
  }, [onAuthEvent]);

  const initAuth = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage(null);
    
    try {
      // Timeout de segurança para evitar carregamento infinito
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos de timeout

      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      clearTimeout(timeoutId);

      if (sessionError) {
        throw sessionError;
      }

      if (currentSession?.user) {
        // Verificar se é admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', currentSession.user.id)
          .maybeSingle();

        if (adminError) {
          console.error('Admin check error:', adminError);
          // Em caso de erro de verificação, permitir tentar novamente
          setHasError(true);
          setErrorMessage('Erro ao verificar permissões. Tente novamente.');
          notifyAuthEvent('timeout_error', 'Erro ao verificar permissões');
          return;
        }

        if (adminData) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAdmin(true);
        } else {
          // Não é admin - limpar sessão
          setSession(null);
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        // Sem sessão ativa
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      
      // Verificar se é timeout ou abort
      if (err instanceof Error) {
        if (err.name === 'AbortError' || err.message.includes('timeout')) {
          setHasError(true);
          setErrorMessage('Tempo limite excedido. Verifique sua conexão e tente novamente.');
          notifyAuthEvent('timeout_error', 'Tempo limite de conexão excedido');
        } else {
          setHasError(true);
          setErrorMessage('Erro ao conectar. Tente novamente.');
          notifyAuthEvent('timeout_error', 'Erro de conexão');
        }
      }
      
      // Manter estado limpo para permitir retry
      setSession(null);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, notifyAuthEvent]);

  // Função de retry para quando há erro
  const retryAuth = useCallback(async () => {
    await initAuth();
  }, [initAuth]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (mounted) {
        await initAuth();
      }
    };

    init();

    // Listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        // Notificar evento de logout
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setIsLoading(false);
          notifyAuthEvent('logout', 'Você saiu do sistema');
          return;
        }

        // Notificar expiração de sessão
        if (event === 'TOKEN_REFRESHED' && !newSession) {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setIsLoading(false);
          notifyAuthEvent('session_expired', 'Sua sessão expirou. Faça login novamente.');
          return;
        }

        if (newSession?.user) {
          try {
            const { data } = await supabase
              .from('admin_users')
              .select('id')
              .eq('user_id', newSession.user.id)
              .maybeSingle();

            if (!mounted) return;

            if (data) {
              setSession(newSession);
              setUser(newSession.user);
              setIsAdmin(true);
              setHasError(false);
              setErrorMessage(null);
            } else {
              setSession(null);
              setUser(null);
              setIsAdmin(false);
            }
          } catch {
            // Silenciar erros
          }
        } else {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
        }
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, initAuth, notifyAuthEvent]);

  const signIn = async (email: string, password: string): Promise<{ error: string | null; success: boolean }> => {
    setHasError(false);
    setErrorMessage(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const errorMsg = 'E-mail ou senha incorretos';
        notifyAuthEvent('login_error', errorMsg);
        return { error: errorMsg, success: false };
      }

      if (data.user) {
        // Verificar se é admin
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (!adminData) {
          await supabase.auth.signOut();
          const errorMsg = 'Acesso negado. Esta área é restrita a administradores.';
          notifyAuthEvent('login_error', errorMsg);
          return { error: errorMsg, success: false };
        }

        setSession(data.session);
        setUser(data.user);
        setIsAdmin(true);
        notifyAuthEvent('login_success', `Bem-vindo, ${data.user.email?.split('@')[0] || 'Admin'}!`);
        return { error: null, success: true };
      }

      const errorMsg = 'Erro ao criar sessão';
      notifyAuthEvent('login_error', errorMsg);
      return { error: errorMsg, success: false };
    } catch {
      const errorMsg = 'Erro ao fazer login. Verifique sua conexão.';
      notifyAuthEvent('login_error', errorMsg);
      return { error: errorMsg, success: false };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Mesmo se falhar, limpar estado local
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setHasError(false);
    setErrorMessage(null);
    // Notificação será disparada pelo onAuthStateChange
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin,
        hasError,
        errorMessage,
        signIn,
        signOut,
        retryAuth,
        isAuthenticated: !!session && isAdmin,
        supabase,
        onAuthEvent,
        setOnAuthEvent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
