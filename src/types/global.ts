// Tipos globais para substituir o Supabase

export interface User {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  company?: string; // Para compatibilidade com AdminUsers
  role: string;
  account_type: 'entreprise' | 'administrateur';
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  status?: 'active' | 'inactive' | 'suspended';
  password_hash?: string; // Para compatibilidade com postgres.service
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

export interface Client {
  id: string;
  company: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  vat_number?: string;
  payment_terms?: number;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  category?: string;
  tax_number?: string; // Para compatibilidade com postgres.service
}

export interface Facture {
  id: string;
  numero_facture: string;
  invoice_number?: string; // Para compatibilidade com postgres.service
  client_id: string;
  client_name: string;
  date: string;
  echeance: string;
  due_date?: string; // Para compatibilidade com postgres.service
  articles: Array<{
    description: string;
    qty: number;
    price: number;
  }>;
  subtotal: number;
  tva: number;
  total: number;
  total_amount?: number; // Para compatibilidade com postgres.service
  status: 'envoyée' | 'payée' | 'brouillon';
  user_id: string;
  created_at: string;
  updated_at: string;
  description?: string; // Para compatibilidade com postgres.service
  currency?: string; // Para compatibilidade com postgres.service
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  unit_price?: number; // Para compatibilidade com postgres.service
  category: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  currency?: string; // Para compatibilidade com postgres.service
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
