import { supabase } from '../services/supabase';

export const testClientsLoad = async () => {
  console.log('🧪 Testando carregamento de clientes...');
  
  try {
    // 1. Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('❌ Erro de autenticação:', authError);
      return false;
    }
    
    if (!user) {
      console.log('⚠️ Usuário não autenticado');
      return false;
    }
    
    console.log('✅ Usuário autenticado:', user.email);
    
    // 2. Testar RPC
    console.log('🔄 Testando RPC fetch_all_clients...');
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('fetch_all_clients', { user_uuid: user.id });
    
    if (rpcError) {
      console.log('⚠️ RPC não disponível:', rpcError.message);
      
      // 3. Testar consulta direta
      console.log('🔄 Testando consulta direta...');
      const { data: directData, error: directError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (directError) {
        console.error('❌ Erro na consulta direta:', directError);
        return false;
      }
      
      console.log('✅ Consulta direta funcionou!');
      console.log('📊 Clientes encontrados:', directData?.length || 0);
      console.log('🗂️ Dados:', directData);
      return directData;
    } else {
      console.log('✅ RPC funcionou!');
      console.log('📊 Clientes encontrados:', rpcData?.length || 0);
      console.log('🗂️ Dados:', rpcData);
      return rpcData;
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
    return false;
  }
};

export const testCreateClient = async () => {
  console.log('🧪 Testando criação de cliente...');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('⚠️ Usuário não autenticado');
      return false;
    }
    
    // Criar cliente de teste
    const testClient = {
      company: 'Empresa Teste',
      contact: 'João Silva',
      email: 'teste@empresa.com',
      phone: '+41 XX XXX XX XX',
      address: 'Rua Teste, 123',
      city: 'Genève',
      postal: '1200',
      country: 'Suisse',
      vat: 'CHE-123.456.789',
      is_active: true,
      status: 'active',
      user_id: user.id
    };
    
    console.log('🔄 Criando cliente de teste...');
    const { data, error } = await supabase
      .from('clients')
      .insert([testClient])
      .select();
    
    if (error) {
      console.error('❌ Erro ao criar cliente:', error);
      return false;
    }
    
    console.log('✅ Cliente criado com sucesso!');
    console.log('🗂️ Dados do cliente:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Erro geral na criação:', error);
    return false;
  }
}; 