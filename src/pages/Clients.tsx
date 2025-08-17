import React, { useState, useEffect } from 'react';
import { Client } from '../types/global';
import apiService from '../services/api.service';

interface NewClientData {
  company: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  vat_number: string;
  payment_terms: number;
  is_active: boolean;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  const [newClient, setNewClient] = useState<NewClientData>({
    company: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Suisse',
    vat_number: '',
    payment_terms: 30,
    is_active: true
  });

  // Dados de exemplo baseados na imagem
  const sampleClients: Client[] = [
    {
      id: '1',
      company: 'TechnoServ SA',
      contact_person: 'Marie Dubois',
      email: 'marie@technoserv.ch',
      phone: '+41 22 123 45 67',
      address: 'Route de Meyrin 123',
      city: 'Genève',
      postal_code: '1217',
      country: 'Suisse',
      vat_number: 'CHE-123.456.789',
      payment_terms: 30,
      is_active: true,
      user_id: 'user_1',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      company: 'Alpine Consulting',
      contact_person: 'Jean-Pierre Martin',
      email: 'jp.martin@alpine-consulting.ch',
      phone: '+41 21 987 65 43',
      address: 'Avenue de la Gare 45',
      city: 'Lausanne',
      postal_code: '1003',
      country: 'Suisse',
      vat_number: 'CHE-987.654.321',
      payment_terms: 15,
      is_active: true,
      user_id: 'user_1',
      created_at: '2024-01-20T14:30:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    },
    {
      id: '3',
      company: 'Swiss Innovation AG',
      contact_person: 'Anna Mueller',
      email: 'anna.mueller@swiss-innovation.ch',
      phone: '+41 44 555 66 77',
      address: 'Bahnhofstrasse 100',
      city: 'Zürich',
      postal_code: '8001',
      country: 'Suisse',
      vat_number: 'CHE-555.666.777',
      payment_terms: 30,
      is_active: true,
      user_id: 'user_1',
      created_at: '2024-02-01T09:15:00Z',
      updated_at: '2024-02-01T09:15:00Z'
    }
  ];

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      console.log('🔍 Clients - Iniciando busca de clientes...');
      setLoading(true);
      
      // Sempre usar dados de exemplo por enquanto (até API estar pronta)
      console.log('🔍 Clients - Carregando dados de exemplo');
      setClients(sampleClients);
      
      // Tentativa de buscar da API em background (sem bloquear)
      try {
        const result = await apiService.getClients();
        console.log('🔍 Clients - Dados da API:', result);
        
        if (result && result.length > 0) {
          console.log('🔍 Clients - API funcionando, usando dados da API');
          setClients(result);
        }
      } catch (apiError) {
        console.log('🔍 Clients - API não disponível, mantendo dados de exemplo:', apiError);
        // Manter dados de exemplo já carregados
      }
      
    } catch (err) {
      console.error('❌ Clients - Erro ao buscar clientes:', err);
      // Garantir que sempre carrega dados de exemplo
      setClients(sampleClients);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar clientes baseado na busca
  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.company.toLowerCase().includes(searchLower) ||
      client.contact_person?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower)
    );
  });

  // Calcular estatísticas
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.is_active).length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newThisMonth = clients.filter(c => {
    const created = new Date(c.created_at);
    return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
  }).length;

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      console.log('🔍 Clients - Criando novo cliente...');
      
      // Criar novo cliente - sempre criar localmente primeiro
      const newClientWithId: Client = { 
        ...newClient, 
        id: Date.now().toString(),
        user_id: 'user_1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Adicionar à lista imediatamente
      setClients(prev => [...prev, newClientWithId]);
      console.log('🔍 Clients - Cliente criado localmente:', newClientWithId);
      
      // Tentar sincronizar com API em background
      try {
        const createdClient = await apiService.createClient({
          ...newClient,
          user_id: 'user_1'
        });
        console.log('🔍 Clients - Cliente sincronizado com API:', createdClient);
        
        // Atualizar com dados da API se sucesso
        setClients(prev => prev.map(c => 
          c.id === newClientWithId.id ? createdClient : c
        ));
      } catch (apiError) {
        console.log('🔍 Clients - API não disponível para sincronização:', apiError);
        // Manter dados locais
      }
      
      // Resetar formulário
      setNewClient({
        company: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        country: 'Suisse',
        vat_number: '',
        payment_terms: 30,
        is_active: true
      });
      
      setShowModal(false);
      
    } catch (err) {
      console.error('❌ Clients - Erro ao criar cliente:', err);
      setError('Erro ao criar cliente. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setNewClient({
      company: client.company,
      contact_person: client.contact_person || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      city: client.city || '',
      postal_code: client.postal_code || '',
      country: client.country || 'Suisse',
      vat_number: client.vat_number || '',
      payment_terms: client.payment_terms || 30,
      is_active: client.is_active
    });
    setShowModal(true);
  };

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le client ${client.company} ?`)) {
      return;
    }
    
    try {
      await apiService.deleteClient(client.id);
      setClients(prev => prev.filter(c => c.id !== client.id));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      // Supprimer localement même si API échoue
      setClients(prev => prev.filter(c => c.id !== client.id));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Chargement des clients...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des clients</h1>
          <p className="text-gray-600 mt-2">Gérez votre portefeuille clients</p>
        </div>
        <button
          onClick={() => {
            setEditingClient(null);
            setNewClient({
              company: '',
              contact_person: '',
              email: '',
              phone: '',
              address: '',
              city: '',
              postal_code: '',
              country: 'Suisse',
              vat_number: '',
              payment_terms: 30,
              is_active: true
            });
            setShowModal(true);
          }}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium"
        >
          <span className="material-icons">add</span>
          + Nouveau client
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50">
              <span className="material-icons text-blue-600">people</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total clients</p>
              <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-50">
              <span className="material-icons text-green-600">verified</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Clients actifs</p>
              <p className="text-2xl font-bold text-gray-900">{activeClients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-50">
              <span className="material-icons text-purple-600">location_on</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Nouveaux ce mois</p>
              <p className="text-2xl font-bold text-gray-900">{newThisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de pesquisa */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">search</span>
          <input
            type="text"
            placeholder="Rechercher par nom d'entreprise, contact ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Tous les clients ({filteredClients.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Délai paiement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{client.company}</div>
                    {client.vat_number && (
                      <div className="text-xs text-gray-500">IVA: {client.vat_number}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.contact_person}</div>
                    {client.phone && (
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="material-icons text-xs">phone</span>
                        {client.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span className="material-icons text-xs">location_on</span>
                      {client.city}, {client.country}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span className="material-icons text-xs">email</span>
                      {client.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.payment_terms} jours
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      client.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {client.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditClient(client)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Voir"
                      >
                        <span className="material-icons text-sm">visibility</span>
                      </button>
                      <button
                        onClick={() => handleEditClient(client)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded"
                        title="Modifier"
                      >
                        <span className="material-icons text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Supprimer"
                      >
                        <span className="material-icons text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Novo/Editar Cliente */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingClient ? 'Modifier le client' : 'Nouveau client'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {editingClient ? 'Modifiez les informations du client.' : 'Ajoutez un nouveau client à votre portefeuille.'}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <span className="material-icons text-xl">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateClient} className="p-6 space-y-6">
              {/* Informações da Empresa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de l'entreprise</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    required
                    value={newClient.company}
                    onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="TechnoServ SA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro TVA
                  </label>
                  <input
                    type="text"
                    value={newClient.vat_number}
                    onChange={(e) => setNewClient({ ...newClient, vat_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="CHE-123.456.789"
                  />
                </div>
              </div>

              {/* Informações de Contato */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de contact</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personne de contact
                  </label>
                  <input
                    type="text"
                    value={newClient.contact_person}
                    onChange={(e) => setNewClient({ ...newClient, contact_person: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Marie Dubois"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="+41 22 123 45 67"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="marie@technoserv.ch"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h3>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Route de Meyrin 123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={newClient.postal_code}
                    onChange={(e) => setNewClient({ ...newClient, postal_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="1217"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={newClient.city}
                    onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Genève"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays
                  </label>
                  <input
                    type="text"
                    value={newClient.country}
                    onChange={(e) => setNewClient({ ...newClient, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Délai de paiement (jours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={newClient.payment_terms}
                    onChange={(e) => setNewClient({ ...newClient, payment_terms: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={newClient.is_active}
                  onChange={(e) => setNewClient({ ...newClient, is_active: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Client actif
                </label>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <span className="material-icons text-sm mr-1">save</span>
                      {editingClient ? 'Enregistrer les modifications' : 'Créer le client'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}