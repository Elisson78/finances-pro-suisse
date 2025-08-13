import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { setupClientsRPC } from "../utils/setupRPC";
import { testClientsLoad, testCreateClient } from "../utils/testClients";
import { diagnosticClients, createTestClient } from "../utils/diagnosticClients";
import { fixClientsLoad, loadClientsFixed } from "../utils/fixClientsLoad";

// Ícones usando o Material Icons (já disponível no projeto)
const IconNames = {
  Plus: "add",
  Search: "search",
  Users: "people",
  Eye: "visibility",
  Edit: "edit",
  Trash2: "delete",
  MapPin: "location_on",
  Mail: "email",
  Phone: "phone"
};

// Componente de ícone simplificado
const Icon = ({ name, className }) => (
  <span className={`material-icons ${className || ''}`}>{IconNames[name] || name}</span>
);

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRPCInstructions, setShowRPCInstructions] = useState(false);
  
  // Estado para o modal
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' ou 'edit'
  const [currentClient, setCurrentClient] = useState(null);
  
  // Estado para o formulário - nomes corretos conforme tabela Supabase
  const [formData, setFormData] = useState({
    company: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal: '',
    country: 'Suisse',
    vat: '',
    is_active: true
  });
  
  // Estado para erros de validação
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Tentar configurar RPC na primeira carga
    setupClientsRPC().then(() => {
      loadClients();
    });
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Primeiro, tentar usar RPC para buscar clientes
      const { data: { user } } = await supabase.auth.getUser();
      
      let clientsData = null;
      let clientsError = null;
      
      if (user) {
        // Tentar usar RPC fetch_all_clients
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('fetch_all_clients', { user_uuid: user.id });
        
        if (rpcError) {
          console.log('RPC não disponível, usando consulta direta:', rpcError.message);
          setShowRPCInstructions(true);
          // Fallback: buscar diretamente da tabela
          const { data: directData, error: directError } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', user.id);
          
          clientsData = directData;
          clientsError = directError;
        } else {
          clientsData = rpcData;
          clientsError = rpcError;
        }
      } else {
        throw new Error('Utilisateur non authentifié');
      }
        
      if (clientsError) throw clientsError;
      setClients(clientsData || []);
      console.log('Clientes carregados:', clientsData);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      setError(`Erreur lors du chargement des clients: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.company?.toLowerCase().includes(searchLower) ||
      client.contact?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower)
    );
  });

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      company: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postal: '',
      country: 'Suisse',
      vat: '',
      is_active: true
    });
    setFormErrors({});
  };

  // Abrir modal para criar cliente
  const openCreateModal = () => {
    setFormMode('create');
    setCurrentClient(null);
    resetForm();
    setShowModal(true);
  };
  
  // Abrir modal para editar cliente
  const openEditModal = (client) => {
    setFormMode('edit');
    setCurrentClient(client);
    setFormData({
      company: client.company || '',
      contact: client.contact || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      city: client.city || '',
      postal: client.postal || '',
      country: client.country || 'Suisse',
      vat: client.vat || '',
      is_active: client.is_active !== false
    });
    setFormErrors({});
    setShowModal(true);
  };
  
  // Fechar modal
  const closeModal = () => {
    setShowModal(false);
    setCurrentClient(null);
    resetForm();
  };
  
  // Manipular mudanças no formulário
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpar erro ao editar campo
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validar formulário
  const validateForm = () => {
    const errors = {};
    
    if (!formData.company.trim()) {
      errors.company = "Le nom de l'entreprise est requis";
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Submeter formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      if (formMode === 'create') {
        // Obter o usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Utilisateur non authentifié');
        }
        
        // Adicionar user_id e status aos dados
        const clientData = {
          ...formData,
          user_id: user.id,
          status: 'active'
        };
        
        const { data, error } = await supabase
          .from('clients')
          .insert([clientData])
          .select();
          
        if (error) throw error;
        console.log('Client créé avec succès:', data);
      } else {
        const { data, error } = await supabase
          .from('clients')
          .update(formData)
          .eq('id', currentClient.id)
          .select();
          
        if (error) throw error;
        console.log('Client mis à jour avec succès:', data);
      }
      
      closeModal();
      await loadClients();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      setError(`Erreur: ${error.message || 'Une erreur est survenue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Ações dos botões
  const handleCreateClient = () => {
    openCreateModal();
  };

  // Função para corrigir carregamento usando a versão fixed
  const handleFixClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const clientsData = await loadClientsFixed();
      setClients(clientsData);
      console.log('✅ Clientes carregados (versão corrigida):', clientsData);
    } catch (error) {
      console.error('❌ Erro na versão corrigida:', error);
      setError(`Erro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewClient = (client) => {
    openEditModal(client);
  };

  const handleEditClient = (client) => {
    openEditModal(client);
  };

  const handleDeleteClient = async (client) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', client.id);
          
        if (error) throw error;
        await loadClients();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        setError(`Erreur: ${error.message || 'Une erreur est survenue'}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des clients</h1>
              <p className="text-gray-600">Gérez votre portefeuille client</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={handleFixClients}
                className="bg-green-600 text-white px-3 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition-colors text-xs"
              >
                🔧 Fix Load
              </button>
              <button 
                onClick={() => diagnosticClients()}
                className="bg-purple-600 text-white px-3 py-2 rounded-lg font-semibold shadow hover:bg-purple-700 transition-colors text-xs"
              >
                🔍 Diagnóstico
              </button>
              <button 
                onClick={handleCreateClient}
                className="bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Icon name="Plus" className="text-sm" />
                Nouveau client
              </button>
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="text-red-800">
                  <p className="text-sm">{error}</p>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <span className="material-icons text-sm">close</span>
                </button>
              </div>
            </div>
          )}

          {/* Instructions RPC */}
          {showRPCInstructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="text-blue-800">
                  <p className="text-sm font-medium mb-2">RPC fetch_all_clients non configuré</p>
                  <p className="text-sm mb-2">Pour de meilleures performances, créez cette fonction dans Supabase SQL Editor:</p>
                  <p className="text-xs bg-blue-100 p-2 rounded font-mono">
                    Ouvrez le console Supabase → SQL Editor → Exécutez le script fetch_all_clients.sql
                  </p>
                </div>
                <button 
                  onClick={() => setShowRPCInstructions(false)}
                  className="ml-auto text-blue-400 hover:text-blue-600"
                >
                  <span className="material-icons text-sm">close</span>
                </button>
              </div>
            </div>
          )}

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg border-0">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-50">
                    <Icon name="Users" className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total clients</p>
                    <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg border-0">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-50">
                    <Icon name="Users" className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Clients actifs</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {clients.filter(c => c.is_active !== false).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg border-0">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-50">
                    <Icon name="MapPin" className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nouveaux ce mois</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {clients.filter(c => {
                        const created = new Date(c.created_at);
                        const now = new Date();
                        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recherche */}
          <div className="mb-6 bg-white rounded-lg shadow-lg border-0">
            <div className="p-6">
              <div className="relative">
                <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  placeholder="Rechercher par nom d'entreprise, contact ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-red-300 focus:ring-red-200 w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
            </div>
          </div>

          {/* Liste des clients */}
          <div className="bg-white rounded-lg shadow-lg border-0">
            <div className="bg-white border-b border-gray-50 p-6">
              <h3 className="text-xl font-bold text-gray-900">
                Tous les clients ({filteredClients.length})
              </h3>
            </div>
            <div className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="border-b">
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700">Entreprise</th>
                      <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700">Contact</th>
                      <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700">Localisation</th>
                      <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700">Email</th>
                      <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700">Statut</th>
                      <th className="h-12 px-4 text-left align-middle font-semibold text-gray-700 w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {isLoading ? (
                      Array(3).fill(0).map((_, i) => (
                        <tr key={i} className="border-b transition-colors hover:bg-gray-50">
                          <td colSpan={6} className="p-4 align-middle text-center py-8">
                            <div className="animate-pulse text-gray-400">Chargement...</div>
                          </td>
                        </tr>
                      ))
                    ) : filteredClients.length === 0 ? (
                      <tr className="border-b transition-colors hover:bg-gray-50">
                        <td colSpan={6} className="p-4 align-middle text-center py-12">
                          <div className="text-gray-400">
                            <Icon name="Users" className="text-3xl mx-auto mb-3 opacity-50" />
                            <p className="font-medium">Aucun client trouvé</p>
                            <p className="text-sm mt-1">
                              {searchTerm 
                                ? "Essayez de modifier votre recherche" 
                                : "Ajoutez votre premier client pour commencer"
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredClients.map((client) => (
                        <tr 
                          key={client.id}
                          className="hover:bg-gray-50 transition-colors border-b border-gray-50"
                        >
                          <td className="p-4 align-middle">
                            <div className="font-semibold text-gray-900">
                              {client.company}
                            </div>
                            {client.vat && (
                              <div className="text-xs text-gray-500 mt-1 font-mono">
                                TVA: {client.vat}
                              </div>
                            )}
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-2">
                              {client.contact && (
                                <span className="text-gray-800 font-medium">
                                  {client.contact}
                                </span>
                              )}
                            </div>
                            {client.phone && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                <Icon name="Phone" className="text-xs" />
                                {client.phone}
                              </div>
                            )}
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Icon name="MapPin" className="text-xs" />
                              <span className="text-sm">{client.city || 'Non défini'}</span>
                            </div>
                            {client.country && client.country !== 'Suisse' && (
                              <div className="text-xs text-gray-500 mt-1">
                                {client.country}
                              </div>
                            )}
                          </td>
                          <td className="p-4 align-middle">
                            {client.email ? (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Icon name="Mail" className="text-xs" />
                                {client.email}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">Non défini</span>
                            )}
                          </td>
                          <td className="p-4 align-middle">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              client.is_active !== false 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {client.is_active !== false ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleViewClient(client)}
                                className="p-2 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                title="Voir"
                              >
                                <Icon name="Eye" className="text-sm" />
                              </button>
                              <button
                                onClick={() => handleEditClient(client)}
                                className="p-2 rounded-full hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
                                title="Modifier"
                              >
                                <Icon name="Edit" className="text-sm" />
                              </button>
                              <button
                                onClick={() => handleDeleteClient(client)}
                                className="p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                                title="Supprimer"
                              >
                                <Icon name="Trash2" className="text-sm" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de formulário de cliente */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 flex justify-between items-center border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {formMode === 'create' ? 'Nouveau client' : 'Modifier le client'}
              </h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl focus:outline-none transition-colors"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Informações da empresa */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations de l'entreprise</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className={`w-full border ${formErrors.company ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500`}
                    required
                  />
                  {formErrors.company && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.company}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro TVA
                  </label>
                  <input
                    type="text"
                    name="vat"
                    value={formData.vat}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="CHE-123.456.789"
                  />
                </div>
                
                {/* Informações de contato */}
                <div className="md:col-span-2 mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations de contact</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Personne de contact
                  </label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="+41 XX XXX XX XX"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500`}
                    placeholder="contact@entreprise.ch"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>
                
                {/* Endereço */}
                <div className="md:col-span-2 mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Adresse</h3>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Rue de la Paix 123"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    name="postal"
                    value={formData.postal}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="1000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Genève"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pays
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="md:col-span-2 mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Client actif</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 border-t pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading 
                    ? 'Enregistrement...' 
                    : formMode === 'create' 
                      ? 'Créer le client' 
                      : 'Enregistrer les modifications'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}