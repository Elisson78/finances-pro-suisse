import axios, { AxiosResponse } from 'axios';

// Base URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Interface para resposta padrão da API
interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: any[];
}

// Configurar axios
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  console.log('🔍 Interceptor Request - Token encontrado:', !!token, 'URL:', config.url);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔍 Interceptor Request - Token adicionado ao header');
  }
  return config;
});

// Interceptor para tratamento de erros
apiClient.interceptors.response.use(
  (response) => {
    console.log('🔍 Interceptor Response - Sucesso:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Interceptor Response - Erro:', error.response?.status, error.config?.url, error.message);
    
    if (error.response?.status === 401) {
      console.log('🔍 Interceptor Response - Token inválido, fazendo logout...');
      // Token expirado ou inválido
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class ApiService {
  // Autenticação
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    console.log('🔍 apiService.login - Iniciando login para:', email);
    
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = await apiClient.post('/auth/login', {
      email,
      password
    });
    
    console.log('🔍 apiService.login - Resposta da API:', response.data);
    
    if (!response.data.data) {
      console.error('❌ apiService.login - Falha no login: sem dados na resposta');
      throw new Error('Falha no login');
    }
    
    // Salvar token no localStorage
    localStorage.setItem('authToken', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    
    console.log('🔍 apiService.login - Dados salvos no localStorage:', {
      hasToken: !!localStorage.getItem('authToken'),
      hasUser: !!localStorage.getItem('user'),
      user: response.data.data.user
    });
    
    return response.data.data;
  }

  async register(userData: { email: string; password: string; full_name: string; company: string }): Promise<{ user: User; token: string }> {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = await apiClient.post('/auth/register', userData);
    
    if (!response.data.data) {
      throw new Error('Falha no registro');
    }
    
    // Salvar token no localStorage
    localStorage.setItem('authToken', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    
    return response.data.data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      console.log('🔍 apiService.getCurrentUser - Iniciando chamada...');
      const response: AxiosResponse<ApiResponse<{ user: User }>> = await apiClient.get('/auth/me');
      console.log('🔍 apiService.getCurrentUser - Resposta da API:', response.data);
      
      if (response.data.data?.user) {
        console.log('🔍 apiService.getCurrentUser - Usuário encontrado:', response.data.data.user);
        return response.data.data.user;
      } else {
        console.log('🔍 apiService.getCurrentUser - Nenhum usuário na resposta');
        return null;
      }
    } catch (error) {
      console.error('❌ apiService.getCurrentUser - Erro na chamada:', error);
      this.logout();
      return null;
    }
  }

  // Clientes
  async getClients(): Promise<Client[]> {
    const response: AxiosResponse<ApiResponse<Client[]>> = await apiClient.get('/clients');
    return response.data.data || [];
  }

  async getClient(id: string): Promise<Client> {
    const response: AxiosResponse<ApiResponse<Client>> = await apiClient.get(`/clients/${id}`);
    if (!response.data.data) {
      throw new Error('Client not found');
    }
    return response.data.data;
  }

  async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const response: AxiosResponse<ApiResponse<Client>> = await apiClient.post('/clients', clientData);
    if (!response.data.data) {
      throw new Error('Failed to create client');
    }
    return response.data.data;
  }

  async updateClient(id: string, clientData: Partial<Client>): Promise<Client> {
    const response: AxiosResponse<ApiResponse<Client>> = await apiClient.put(`/clients/${id}`, clientData);
    if (!response.data.data) {
      throw new Error('Failed to update client');
    }
    return response.data.data;
  }

  async deleteClient(id: string): Promise<void> {
    await apiClient.delete(`/clients/${id}`);
  }

  // Faturas
  async getFactures(): Promise<Facture[]> {
    const response: AxiosResponse<ApiResponse<Facture[]>> = await apiClient.get('/factures');
    return response.data.data || [];
  }

  async getFacture(id: string): Promise<Facture> {
    const response: AxiosResponse<ApiResponse<Facture>> = await apiClient.get(`/factures/${id}`);
    if (!response.data.data) {
      throw new Error('Facture not found');
    }
    return response.data.data;
  }

  async createFacture(factureData: Omit<Facture, 'id' | 'created_at' | 'updated_at'>): Promise<Facture> {
    const response: AxiosResponse<ApiResponse<Facture>> = await apiClient.post('/factures', factureData);
    if (!response.data.data) {
      throw new Error('Failed to create facture');
    }
    return response.data.data;
  }

  async updateFacture(id: string, factureData: Partial<Facture>): Promise<Facture> {
    const response: AxiosResponse<ApiResponse<Facture>> = await apiClient.put(`/factures/${id}`, factureData);
    if (!response.data.data) {
      throw new Error('Failed to update facture');
    }
    return response.data.data;
  }

  async deleteFacture(id: string): Promise<void> {
    await apiClient.delete(`/factures/${id}`);
  }

  async getDashboardStats(): Promise<{
    totalFactures: number;
    totalPaid: number;
    totalPending: number;
    overdueCount: number;
  }> {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get('/factures/stats/dashboard');
    return response.data.data || { totalFactures: 0, totalPaid: 0, totalPending: 0, overdueCount: 0 };
  }

  // Serviços
  async getServices(): Promise<Service[]> {
    const response: AxiosResponse<ApiResponse<Service[]>> = await apiClient.get('/services');
    return response.data.data || [];
  }

  async getService(id: string): Promise<Service> {
    const response: AxiosResponse<ApiResponse<Service>> = await apiClient.get(`/services/${id}`);
    if (!response.data.data) {
      throw new Error('Service not found');
    }
    return response.data.data;
  }

  async createService(serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> {
    const response: AxiosResponse<ApiResponse<Service>> = await apiClient.post('/services', serviceData);
    if (!response.data.data) {
      throw new Error('Failed to create service');
    }
    return response.data.data;
  }

  async updateService(id: string, serviceData: Partial<Service>): Promise<Service> {
    const response: AxiosResponse<ApiResponse<Service>> = await apiClient.put(`/services/${id}`, serviceData);
    if (!response.data.data) {
      throw new Error('Failed to update service');
    }
    return response.data.data;
  }

  async deleteService(id: string): Promise<void> {
    await apiClient.delete(`/services/${id}`);
  }
}

// Tipos exportados do backend
export interface User {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  company: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  category: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Facture {
  id: string;
  numero_facture: string;
  client_id: string;
  client_name: string;
  date: string;
  echeance: string;
  articles: Array<{
    description: string;
    qty: number;
    price: number;
  }>;
  subtotal: number;
  tva: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Instância singleton
const apiService = new ApiService();
export default apiService;