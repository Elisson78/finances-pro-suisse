import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session, SignInCredentials, SignUpCredentials } from '../types/global';
import apiService from '../services/api.service';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<any>; // Retorna dados do usuário registrado
  signOut: () => Promise<void>;
}

// Serviço de autenticação usando API
const authService = {
  getSession: async (): Promise<Session | null> => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    console.log('🔍 authService.getSession - Verificando localStorage:', {
      hasToken: !!token,
      hasUser: !!userStr,
      tokenLength: token?.length,
      userStrLength: userStr?.length
    });
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('🔍 authService.getSession - Usuário parseado:', user);
        return { user, access_token: token };
      } catch (error) {
        console.error('❌ authService.getSession - Erro ao fazer parse do usuário:', error);
        return null;
      }
    }
    console.log('🔍 authService.getSession - Nenhuma sessão válida encontrada');
    return null;
  },
  getCurrentUser: async (): Promise<User | null> => {
    try {
      console.log('🔍 authService.getCurrentUser - Chamando API...');
      const user = await apiService.getCurrentUser();
      console.log('🔍 authService.getCurrentUser - Resposta da API:', user);
      return user;
    } catch (error) {
      console.error('❌ authService.getCurrentUser - Erro na API:', error);
      return null;
    }
  },
  signIn: async (credentials: SignInCredentials): Promise<{ user: User; session: Session }> => {
    const result = await apiService.login(credentials.email, credentials.password);
    const session = { user: result.user, access_token: result.token };
    return { user: result.user, session };
  },
  signUp: async (credentials: SignUpCredentials): Promise<{ user: User; session: Session }> => {
    const result = await apiService.register({
      email: credentials.email,
      password: credentials.password,
      full_name: credentials.fullName,
      company: credentials.companyName
    });
    const session = { user: result.user, access_token: result.token };
    return { user: result.user, session };
  },
  signOut: async (): Promise<void> => {
    await apiService.logout();
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 AuthContext - Iniciando verificação de usuário');
        
        // Verificar se há uma sessão ativa
        const session = await authService.getSession();
        console.log('🔍 AuthContext - Sessão encontrada:', session);
        setSession(session);
        
        if (session) {
          console.log('🔍 AuthContext - Buscando dados do usuário...');
          const user = await authService.getCurrentUser();
          console.log('🔍 AuthContext - Usuário carregado:', user);
          setUser(user);
        } else {
          console.log('🔍 AuthContext - Nenhuma sessão ativa encontrada');
        }
      } catch (error) {
        console.error('❌ AuthContext - Erro ao verificar usuário:', error);
      } finally {
        setIsLoading(false);
        console.log('🔍 AuthContext - Verificação concluída, isLoading:', false);
      }
    };

    checkUser();

    // TODO: Substituir por SQLite - Configurar listener para mudanças de autenticação
    // const { data: { subscription } } = auth.onAuthStateChange(
    //   async (event, session) => {
    //     setSession(session);
    //     setUser(session?.user || null);
    //     setIsLoading(false);
    //   }
    // );

    // TODO: Substituir por SQLite - Limpar inscrição
    // return () => {
    //   subscription.unsubscribe();
    // };
  }, []);

  const signIn = async (credentials: SignInCredentials) => {
    try {
      setIsLoading(true);
      const { user, session } = await authService.signIn(credentials);
      setUser(user);
      setSession(session);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (credentials: SignUpCredentials) => {
    try {
      setIsLoading(true);
      console.log('Iniciando processo de registro com credentials:', { ...credentials, password: '[REDACTED]' });
      const data = await authService.signUp(credentials);
      console.log('Resposta do registro:', data);
      
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
      }
      
      return data; // Retornar os dados para uso no componente de registro
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};