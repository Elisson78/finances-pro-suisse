import { supabase } from '../services/supabase';

export const testRegistrationWithRole = async (role = 'entreprise') => {
  console.log(`🧪 Testando registro com role: ${role}`);
  
  try {
    const testEmail = `test.${role}.${Date.now()}@example.com`;
    const testUser = {
      email: testEmail,
      password: 'password123',
      fullName: `Utilisateur Test ${role}`,
      companyName: `Entreprise Test ${role}`,
      role: role
    };

    console.log('📝 Dados de teste:', testUser);

    // Testar registro
    const { data, error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          full_name: testUser.fullName,
          company_name: testUser.companyName,
          role: testUser.role
        },
      },
    });

    if (error) {
      console.error('❌ Erro no registro:', error);
      return false;
    }

    console.log('✅ Usuário registrado:', data.user);
    console.log('📊 Metadados do usuário:', data.user?.user_metadata);

    // Verificar se foi salvo na tabela users (se existir)
    if (data.user) {
      console.log('🔍 Verificando se foi salvo na tabela users...');
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.log('⚠️ Tabela users não existe ou erro:', userError.message);
      } else {
        console.log('✅ Dados na tabela users:', userData);
      }
    }

    return data;

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
};

export const checkUserRole = async () => {
  console.log('🔍 Verificando role do usuário atual...');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.log('⚠️ Usuário não autenticado');
      return null;
    }

    console.log('✅ Usuário atual:', user.email);
    console.log('📊 Metadados:', user.user_metadata);
    console.log('🎭 Role:', user.user_metadata?.role || 'não definida');

    return user.user_metadata?.role;

  } catch (error) {
    console.error('❌ Erro ao verificar role:', error);
    return null;
  }
}; 