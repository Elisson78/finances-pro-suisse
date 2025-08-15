import React, { useState, useEffect } from 'react';
import { Facture } from '../types/global';
import apiService from '../services/api.service';

interface NewFactureData {
  client_name: string;
  description: string;
  date: string;
  due_date: string;
  total_amount: number;
  status: 'envoyée' | 'payée' | 'brouillon';
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function Factures() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'envoyée' | 'payée' | 'brouillon'>('all');
  const [newFacture, setNewFacture] = useState<NewFactureData>({
    client_name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    due_date: '',
    total_amount: 0,
    status: 'brouillon'
  });
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      description: 'Description du service',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
  ]);

  // Clientes disponíveis para seleção
  const availableClients = [
    'TechnoServ SA',
    'Alpine Consulting Sàrl',
    'Swiss Innovation AG',
    'FinancesPro Suisse',
    'Consulting Plus'
  ];

  // Calcular totais
  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const tva = subtotal * 0.077; // 7.7% TVA
    const total = subtotal + tva;
    
    setNewFacture(prev => ({
      ...prev,
      total_amount: total
    }));
    
    return { subtotal, tva, total };
  };

  // Atualizar item da fatura
  const updateInvoiceItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  // Adicionar novo item
  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setInvoiceItems(prev => [...prev, newItem]);
  };

  // Remover item
  const removeInvoiceItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Formatar moeda
  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} CHF`;
  };

  // Dados de exemplo para desenvolvimento (baseados na foto)
  const sampleFactures: Facture[] = [
    {
      id: '1',
      numero_facture: 'FAC-2024-001',
      client_id: 'client_1',
      client_name: 'Tech Solutions SA',
      date: '2024-01-15',
      echeance: '2024-02-14',
      articles: [
        {
          description: 'Consultoria técnica - Projet A',
          qty: 1,
          price: 1550.88
        }
      ],
      subtotal: 1292.40,
      tva: 258.48,
      total: 1550.88,
      status: 'envoyée',
      user_id: 'user_1',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      numero_facture: 'FAC-2024-002',
      client_id: 'client_2',
      client_name: 'FinancesPro Suisse',
      date: '2024-01-18',
      echeance: '2024-02-02',
      articles: [
        {
          description: 'Développement de système',
          qty: 1,
          price: 3231.00
        }
      ],
      subtotal: 2692.50,
      tva: 538.50,
      total: 3231.00,
      status: 'payée',
      user_id: 'user_1',
      created_at: '2024-01-18T14:30:00Z',
      updated_at: '2024-01-18T14:30:00Z'
    },
    {
      id: '3',
      numero_facture: '2024-002',
      client_id: 'client_3',
      client_name: 'Silva & Associados',
      date: '2024-01-22',
      echeance: '2024-02-21',
      articles: [
        {
          description: 'Audit comptable',
          qty: 1,
          price: 1830.90
        }
      ],
      subtotal: 1525.75,
      tva: 305.15,
      total: 1830.90,
      status: 'envoyée',
      user_id: 'user_1',
      created_at: '2024-01-22T11:20:00Z',
      updated_at: '2024-01-22T11:20:00Z'
    },
    {
      id: '4',
      numero_facture: '2024-003',
      client_id: 'client_4',
      client_name: 'Consulting Plus',
      date: '2024-01-28',
      echeance: '2024-02-27',
      articles: [
        {
          description: 'Conseil en gestion',
          qty: 1,
          price: 1534.73
        }
      ],
      subtotal: 1278.94,
      tva: 255.79,
      total: 1534.73,
      status: 'brouillon',
      user_id: 'user_1',
      created_at: '2024-01-28T09:15:00Z',
      updated_at: '2024-01-28T09:15:00Z'
    },
    {
      id: '5',
      numero_facture: '2024-001',
      client_id: 'client_5',
      client_name: 'Innovation Lab',
      date: '2024-01-15',
      echeance: '2024-02-14',
      articles: [
        {
          description: 'Recherche et développement',
          qty: 1,
          price: 646.20
        }
      ],
      subtotal: 538.50,
      tva: 107.70,
      total: 646.20,
      status: 'payée',
      user_id: 'user_1',
      created_at: '2024-01-15T16:45:00Z',
      updated_at: '2024-01-15T16:45:00Z'
    }
  ];

  // Buscar faturas
  useEffect(() => {
    async function fetchFactures() {
      try {
        console.log('🔍 Factures - Iniciando busca de faturas...');
        
        // Tentar buscar da API primeiro
        try {
          const result = await apiService.getFactures();
          console.log('🔍 Factures - Dados da API:', result);
          
          if (result && result.length > 0) {
            setFactures(result);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.log('🔍 Factures - API não disponível, usando dados de exemplo:', apiError);
        }
        
        // Se API não funcionar, usar dados de exemplo
        console.log('🔍 Factures - Usando dados de exemplo para desenvolvimento');
        setFactures(sampleFactures);
        
      } catch (err) {
        console.error('❌ Factures - Erro ao buscar faturas:', err);
        setError('Erro ao carregar faturas. Usando dados de exemplo para desenvolvimento.');
        setFactures(sampleFactures);
      } finally {
        setLoading(false);
      }
    }
    fetchFactures();
  }, []);

  // Filtrar faturas baseado na busca e filtro de status
  const filteredFactures = factures.filter(facture => {
    const matchesSearch = 
      facture.numero_facture.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facture.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || facture.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Formatar data em francês
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Obter badge de status
  const getStatusBadge = (status: string) => {
    const styles = {
      envoyée: 'bg-blue-100 text-blue-800',
      payée: 'bg-green-100 text-green-800',
      brouillon: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      envoyée: 'envoyée',
      payée: 'payée',
      brouillon: 'brouillon'
    };
    
    return (
      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  // Criar nova fatura
  const handleCreateFacture = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      console.log('🔍 Factures - Criando nova fatura...');
      
      // Calcular totais finais
      const { subtotal, tva, total } = calculateTotals();
      
      // Gerar número da fatura
      const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(factures.length + 1).padStart(3, '0')}`;
      
      const factureData = {
        numero_facture: invoiceNumber,
        client_id: 'temp_client_id',
        client_name: newFacture.client_name || 'Cliente Temporário',
        date: newFacture.date,
        echeance: newFacture.due_date || newFacture.date,
        articles: invoiceItems.map(item => ({
          description: item.description,
          qty: item.quantity,
          price: item.unitPrice
        })),
        subtotal: subtotal,
        tva: tva,
        total: total,
        status: newFacture.status,
        user_id: 'user_1'
      };

      console.log('🔍 Factures - Dados da fatura:', factureData);

      // Tentar criar via API primeiro
      try {
        const result = await apiService.createFacture(factureData);
        console.log('🔍 Factures - Fatura criada via API:', result);
        
        // Recarregar faturas
        const updatedFactures = await apiService.getFactures();
        if (updatedFactures && updatedFactures.length > 0) {
          setFactures(updatedFactures);
        } else {
          // Se API não retornar dados, adicionar localmente
          const newFactureWithId = { 
            ...factureData, 
            id: Date.now().toString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setFactures(prev => [...prev, newFactureWithId]);
        }
      } catch (apiError) {
        console.log('🔍 Factures - API não disponível, criando localmente:', apiError);
        
        // Criar localmente se API não funcionar
        const newFactureWithId = { 
          ...factureData, 
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setFactures(prev => [...prev, newFactureWithId]);
      }
      
      // Resetar formulário
      setNewFacture({
        client_name: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        due_date: '',
        total_amount: 0,
        status: 'brouillon'
      });
      
      // Resetar itens da fatura
      setInvoiceItems([{
        id: '1',
        description: 'Description du service',
        quantity: 1,
        unitPrice: 0,
        total: 0
      }]);
      
      setShowModal(false);
      
    } catch (err) {
      console.error('❌ Factures - Erro ao criar fatura:', err);
      setError('Erro ao criar fatura. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  // Gerar PDF (simplificado)
  const handleGeneratePDF = async (facture: Facture) => {
    try {
      alert(`PDF da fatura ${facture.numero_facture} seria gerado aqui.`);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    }
  };

  if (loading) {
  return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Carregando faturas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header com título e botão */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des factures</h1>
          <p className="text-gray-600 mt-2">Créez et gérez vos factures clients</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium"
        >
          <span className="material-icons">add</span>
          + Nouvelle facture
        </button>
      </div>

      {/* Barra de busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-icons text-gray-400">search</span>
          </div>
          <input
            type="text"
            placeholder="Rechercher par numéro de facture ou nom du client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'envoyée' | 'payée' | 'brouillon')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="envoyée">Envoyée</option>
            <option value="payée">Payée</option>
            <option value="brouillon">Brouillon</option>
          </select>
        </div>
      </div>

      {/* Lista de faturas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Toutes les factures ({filteredFactures.length})
          </h2>
        </div>
        
        {filteredFactures.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune facture trouvée</p>
            <button 
              onClick={() => setShowModal(true)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Créer votre première facture
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Facture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Échéance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
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
                {filteredFactures.map((facture) => (
                  <tr key={facture.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {facture.numero_facture}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {facture.client_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(facture.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(facture.echeance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {facture.total?.toFixed(2) || facture.total_amount?.toFixed(2) || '0.00'} CHF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(facture.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleGeneratePDF(facture)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Voir"
                        >
                          <span className="material-icons text-sm">visibility</span>
                        </button>
                        <button
                          onClick={() => alert('Éditer la facture ' + facture.numero_facture)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded"
                          title="Éditer"
                        >
                          <span className="material-icons text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => alert('Supprimer la facture ' + facture.numero_facture)}
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
        )}
      </div>

      {/* Modal de Nova Fatura - VERSÃO MODERNIZADA */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Nouvelle facture</h2>
                  <p className="text-gray-600 mt-1">Remplissez les détails de la facture.</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <span className="material-icons text-xl">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateFacture} className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client *
                  </label>
                  <select
                    required
                    value={newFacture.client_name}
                    onChange={(e) => setNewFacture({ ...newFacture, client_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un client</option>
                    {availableClients.map(client => (
                      <option key={client} value={client}>{client}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={newFacture.status}
                    onChange={(e) => setNewFacture({ ...newFacture, status: e.target.value as 'envoyée' | 'payée' | 'brouillon' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="brouillon">Brouillon</option>
                    <option value="envoyée">Envoyée</option>
                    <option value="payée">Payée</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de facturation
                  </label>
                  <input
                    type="date"
                    required
                    value={newFacture.date}
                    onChange={(e) => setNewFacture({ ...newFacture, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    value={newFacture.due_date}
                    onChange={(e) => setNewFacture({ ...newFacture, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Artigos de la facture */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Articles de la facture</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Qté
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Prix unitaire
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Total HT
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoiceItems.map((item, index) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                              placeholder="Description du service"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updateInvoiceItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {formatCurrency(item.total)}
                          </td>
                          <td className="px-4 py-3">
                            {invoiceItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeInvoiceItem(item.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Supprimer"
                              >
                                <span className="material-icons text-sm">delete</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={addInvoiceItem}
                  className="mt-3 text-red-600 hover:text-red-800 font-medium flex items-center gap-2"
                >
                  <span className="material-icons text-sm">add</span>
                  + Ajouter un article
                </button>
              </div>

              {/* Résumé des totaux */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sous-total HT:</span>
                      <span className="font-medium">{formatCurrency(calculateTotals().subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">TVA (7.7%):</span>
                      <span className="font-medium">{formatCurrency(calculateTotals().tva)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                      <span>Total TTC:</span>
                      <span>{formatCurrency(calculateTotals().total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
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
                      Création...
                    </>
                  ) : (
                    <>
                      <span className="material-icons text-sm mr-1">description</span>
                      Créer la facture
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