import { supabase } from '../services/supabase';

export const diagnosticClients = async () => {
  console.log('🔍 === DIAGNÓSTICO COMPLETO DE CLIENTES ===');
  
  try {
    // 1. Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Usuário não autenticado:', authError);
      return false;
    }
    
    console.log('✅ Usuário autenticado:', {
      id: user.id,
      email: user.email,
      metadata: user.user_metadata
    });

    // 2. Verificar estrutura da tabela
    console.log('🔍 Verificando estrutura da tabela clients...');
    
    // Tentar consulta básica para ver que colunas existem
    const { data: sampleData, error: structureError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Erro na estrutura da tabela:', structureError);
      
      // Tentar outras estruturas possíveis
      console.log('🔍 Tentando estruturas alternativas...');
      
      // Teste 1: Tentar com nomes em camelCase
      const { data: camelTest, error: camelError } = await supabase
        .from('clients')
        .select('id, companyName, contactName, email')
        .limit(1);
        
      if (!camelError) {
        console.log('✅ Estrutura camelCase encontrada:', camelTest);
      } else {
        console.log('❌ Estrutura camelCase falhou:', camelError.message);
      }
      
      // Teste 2: Tentar com nomes em snake_case
      const { data: snakeTest, error: snakeError } = await supabase
        .from('clients')
        .select('id, company_name, contact_name, email')
        .limit(1);
        
      if (!snakeError) {
        console.log('✅ Estrutura snake_case encontrada:', snakeTest);
      } else {
        console.log('❌ Estrutura snake_case falhou:', snakeError.message);
      }
      
    } else {
      console.log('✅ Estrutura da tabela clients:', sampleData);
    }

    // 3. Buscar todos os clientes (sem filtro de usuário primeiro)
    console.log('🔍 Buscando TODOS os clientes na tabela...');
    const { data: allClients, error: allError } = await supabase
      .from('clients')
      .select('*');
    
    if (allError) {
      console.error('❌ Erro ao buscar todos os clientes:', allError);
    } else {
      console.log('📊 Total de clientes na tabela:', allClients?.length || 0);
      console.log('🗂️ Primeiros registros:', allClients?.slice(0, 3));
    }

    // 4. Buscar clientes do usuário atual
    console.log('🔍 Buscando clientes do usuário atual...');
    const { data: userClients, error: userError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id);
    
    if (userError) {
      console.error('❌ Erro ao buscar clientes do usuário:', userError);
    } else {
      console.log('📊 Clientes do usuário:', userClients?.length || 0);
      console.log('🗂️ Dados dos clientes do usuário:', userClients);
    }

    // 5. Testar criação de cliente
    console.log('🔍 Testando estrutura para criação...');
    const testClient = {
      company: 'Teste Diagnóstico',
      contact: 'João Teste',
      email: 'teste@diagnostic.com',
      phone: '+41 XX XXX XX XX',
      address: 'Rua Teste',
      city: 'Genève',
      postal: '1200',
      country: 'Suisse',
      vat: 'CHE-999.999.999',
      is_active: true,
      status: 'active',
      user_id: user.id
    };
    
    // Não vamos criar, apenas simular para ver o erro
    console.log('📝 Estrutura de teste que seria enviada:', testClient);

    return {
      user,
      allClients,
      userClients,
      structureError,
      testClient
    };

  } catch (error) {
    console.error('❌ Erro geral no diagnóstico:', error);
    return false;
  }
};

export const createTestClient = async () => {
  console.log('🧪 Criando cliente de teste...');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ Usuário não autenticado');
      return false;
    }

    const testClient = {
      company: 'Empresa Teste Diagnóstico',
      contact: 'Contact Teste',
      email: 'teste.diagnostic@empresa.ch',
      phone: '+41 22 123 45 67',
      address: 'Rue de Test 123',
      city: 'Genève',
      postal: '1200',
      country: 'Suisse',
      vat: 'CHE-123.456.789',
      is_active: true,
      status: 'active',
      user_id: user.id
    };

    console.log('📝 Dados enviados:', testClient);

    const { data, error } = await supabase
      .from('clients')
      .insert([testClient])
      .select();

    if (error) {
      console.error('❌ Erro ao criar cliente:', error);
      console.error('💡 Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }

    console.log('✅ Cliente criado com sucesso:', data);
    return data;

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
}; 