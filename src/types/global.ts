// Tipos globais para substituir o Supabase

export interface User {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  role: string;
  user_metadata?: {
    full_name?: string;
    company_name?: string;
    role?: string;
  };
}

export interface Session {
  user: User;
  access_token: string;
  refresh_token?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  role?: string;
}

// Mock do Supabase para compatibilidade
export const supabase = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
    signUp: async () => ({ data: { user: null, session: null }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: (callback: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: (table: string) => ({
    select: async (columns?: string) => ({ data: [], error: null }),
    insert: async (data: any) => ({ data: null, error: null }),
    update: async (data: any) => ({ data: [], error: null }),
    delete: async () => ({ data: [], error: null }),
    eq: (column: string, value: any) => ({
      select: async (columns?: string) => ({ data: [], error: null }),
      update: async (data: any) => ({ data: [], error: null }),
      delete: async () => ({ data: [], error: null }),
    }),
  }),
  rpc: (func: string, params?: any) => Promise.resolve({ data: null, error: null }),
};

// Mock do loadClientsFixed
export const loadClientsFixed = async () => {
  console.log('⚠️ loadClientsFixed não implementado - usando dados de exemplo');
  return [
    {
      id: 'client_1',
      company: 'TechnoServ SA',
      contact: 'Jean Dupont',
      email: 'contact@technoserv.ch',
      phone: '+41 22 123 45 67',
      address: 'Rue de la Corraterie 15',
      city: 'Genève',
      postal: '1204',
      country: 'Suisse',
      vat: 'CHE-123.456.789',
      is_active: true
    }
  ];
};
