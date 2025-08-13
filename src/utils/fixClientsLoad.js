import { supabase } from '../services/supabase';

export const fixClientsLoad = async () => {
  console.log('🔧 Corrigindo carregamento de clientes...');
  
  try {
    // 1. Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Usuário não autenticado:', authError);
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    console.log('✅ Usuário autenticado:', user.email);

    // 2. Buscar todos os clientes primeiro (sem filtro para testar)
    console.log('🔍 Buscando todos os clientes...');
    const { data: allClients, error: allError } = await supabase
      .from('clients')
      .select('*');
    
    if (allError) {
      console.error('❌ Erro ao buscar todos os clientes:', allError);
      return { success: false, error: allError.message };
    }
    
    console.log('📊 Total de clientes na tabela:', allClients?.length || 0);
    console.log('🗂️ Amostra de dados:', allClients?.slice(0, 2));

    // 3. Buscar clientes do usuário (com diferentes tentativas de campo user_id)
    console.log('🔍 Buscando clientes do usuário...');
    
    // Tentativa 1: user_id
    let userClients = null;
    let userError = null;
    
    const { data: clients1, error: error1 } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id);
    
    if (!error1) {
      userClients = clients1;
      console.log('✅ Encontrados com user_id:', clients1?.length || 0);
    } else {
      console.log('⚠️ user_id falhou:', error1.message);
      
      // Tentativa 2: userId (camelCase)
      const { data: clients2, error: error2 } = await supabase
        .from('clients')
        .select('*')
        .eq('userId', user.id);
      
      if (!error2) {
        userClients = clients2;
        console.log('✅ Encontrados com userId:', clients2?.length || 0);
      } else {
        console.log('⚠️ userId falhou:', error2.message);
        userError = error2;
      }
    }

    // 4. Se ainda não encontrou, verificar estrutura da tabela
    if (!userClients && allClients?.length > 0) {
      console.log('🔍 Analisando estrutura da tabela...');
      const sampleClient = allClients[0];
      console.log('📋 Campos disponíveis:', Object.keys(sampleClient));
      
      // Verificar se há campo relacionado a usuário
      const userFields = Object.keys(sampleClient).filter(key => 
        key.toLowerCase().includes('user') || 
        key.toLowerCase().includes('owner') ||
        key.toLowerCase().includes('created_by')
      );
      
      console.log('👤 Campos relacionados a usuário:', userFields);
    }

    return {
      success: true,
      user,
      allClients,
      userClients,
      totalClients: allClients?.length || 0,
      userClientsCount: userClients?.length || 0,
      sampleData: allClients?.slice(0, 2)
    };

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return { success: false, error: error.message };
  }
};

export const loadClientsFixed = async () => {
  console.log('🔄 Carregando clientes (versão corrigida)...');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Buscar sem order by created_at (que pode não existir)
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      // Se user_id falhar, tentar userId
      const { data: data2, error: error2 } = await supabase
        .from('clients')
        .select('*')
        .eq('userId', user.id);
      
      if (error2) {
        throw new Error(`Erro ao buscar clientes: ${error.message}`);
      }
      
      return data2 || [];
    }

    return data || [];

  } catch (error) {
    console.error('❌ Erro ao carregar clientes:', error);
    throw error;
  }
}; 