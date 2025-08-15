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
