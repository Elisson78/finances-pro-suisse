import { supabase } from '../services/supabase';

// Cliente Entity
export const Client = {
  // Listar todos os clientes
  list: async (order = '-created_at') => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order(order.replace('-', ''), { ascending: !order.startsWith('-') });

    if (error) throw error;
    return data || [];
  },

  // Obter um cliente por ID
  get: async (id) => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Criar um novo cliente
  create: async (clientData) => {
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Atualizar um cliente
  update: async (id, clientData) => {
    const { data, error } = await supabase
      .from('clients')
      .update(clientData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Excluir um cliente
  delete: async (id) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};