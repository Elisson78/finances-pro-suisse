import { createClient } from '@supabase/supabase-js';

// Obtenha essas variáveis do painel do Supabase
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Verificação para garantir que as variáveis de ambiente estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para autenticação
export type SignUpCredentials = {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  role?: string; // role opcional: 'entreprise' ou 'admin'
};

export type SignInCredentials = {
  email: string;
  password: string;
};

// Serviço de autenticação
export const authService = {
  // Registro de usuário
  signUp: async ({ email, password, fullName, companyName, role = 'entreprise' }: SignUpCredentials) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
          role: role, // Incluir o papel (role) nos metadados do usuário
        },
      },
    });

    if (error) throw error;

    // Se o usuário foi criado com sucesso, salvar também na tabela users personalizada
    if (data.user) {
      try {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              full_name: fullName,
              company_name: companyName,
              role: role,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

        if (profileError) {
          console.error('Erro ao criar perfil do usuário:', profileError);
          // Não falha o registro, apenas loga o erro
        }
      } catch (profileError) {
        console.error('Erro ao criar perfil do usuário:', profileError);
      }
    }

    return data;
  },

  // Login de usuário
  signIn: async ({ email, password }: SignInCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Logout de usuário
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Obter usuário atual
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  // Verificar se há uma sessão ativa
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
};