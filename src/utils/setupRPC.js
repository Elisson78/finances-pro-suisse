import { supabase } from '../services/supabase';

// RPC SQL para buscar clientes
const fetchClientsRPC = `
-- Função RPC para buscar todos os clientes
CREATE OR REPLACE FUNCTION fetch_all_clients(user_uuid UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  company TEXT,
  contact TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal TEXT,
  country TEXT,
  vat TEXT,
  is_active BOOLEAN,
  status TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.company,
    c.contact,
    c.email,
    c.phone,
    c.address,
    c.city,
    c.postal,
    c.country,
    c.vat,
    c.is_active,
    c.status,
    c.user_id,
    c.created_at,
    c.updated_at
  FROM clients c
  WHERE (user_uuid IS NULL OR c.user_id = user_uuid)
  ORDER BY c.created_at DESC;
END;
$$;
`;

export const setupClientsRPC = async () => {
  try {
    console.log('Tentando configurar RPC fetch_all_clients...');
    
    // Tentar executar o RPC
    const { data, error } = await supabase.rpc('fetch_all_clients');
    
    if (error && error.message.includes('function fetch_all_clients')) {
      console.log('RPC não existe, precisa ser criado manualmente no Supabase SQL Editor');
      console.log('Execute este SQL no Supabase Dashboard > SQL Editor:');
      console.log(fetchClientsRPC);
      return false;
    }
    
    console.log('RPC fetch_all_clients está disponível');
    return true;
  } catch (error) {
    console.log('Erro ao verificar RPC:', error.message);
    return false;
  }
};

export { fetchClientsRPC }; 