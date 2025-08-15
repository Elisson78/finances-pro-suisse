import React, { useState, useEffect } from 'react';
import { Facture } from '../types/global';
import apiService from '../services/api.service';

interface NewFactureData {
  client_name: string;
  description: string;
  date: string;
  due_date: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue';
}

export default function Factures() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFacture, setNewFacture] = useState<NewFactureData>({
    client_name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    due_date: '',
    total_amount: 0,
    status: 'pending'
  });

  // Dados de exemplo para desenvolvimento
  const sampleFactures: Facture[] = [
    {
      id: '1',
      numero_facture: 'INV-2025-001',
      client_id: 'client_1',
      client_name: 'Tech Solutions SA',
      date: '2025-08-15',
      echeance: '2025-09-15',
      articles: [
        {
          description: 'Consultoria técnica - Projeto A',
          qty: 1,
          price: 1500.00
        }
      ],
      subtotal: 1500.00,
      tva: 300.00,
      total: 1800.00,
      status: 'pending',
      user_id: 'user_1',
      created_at: '2025-08-15T10:00:00Z',
      updated_at: '2025-08-15T10:00:00Z'
    },
    {
      id: '2',
      numero_facture: 'INV-2025-002',
      client_id: 'client_2',
      client_name: 'FinancesPro Suisse',
      date: '2025-08-10',
      echeance: '2025-09-10',
      articles: [
        {
          description: 'Desenvolvimento de sistema',
          qty: 1,
          price: 2500.00
        }
      ],
      subtotal: 2500.00,
      tva: 500.00,
      total: 3000.00,
      status: 'paid',
      user_id: 'user_1',
      created_at: '2025-08-10T14:30:00Z',
      updated_at: '2025-08-12T09:15:00Z'
    },
    {
      id: '3',
      numero_facture: 'INV-2025-003',
      client_id: 'client_3',
      client_name: 'Silva & Associados',
      date: '2025-08-05',
      echeance: '2025-08-20',
      articles: [
        {
          description: 'Auditoria contábil',
          qty: 1,
          price: 800.00
        }
      ],
      subtotal: 800.00,
      tva: 160.00,
      total: 960.00,
      status: 'overdue',
      user_id: 'user_1',
      created_at: '2025-08-05T11:20:00Z',
      updated_at: '2025-08-05T11:20:00Z'
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

  // Criar nova fatura
  const handleCreateFacture = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      console.log('🔍 Factures - Criando nova fatura...');
      
      // Gerar número da fatura
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(factures.length + 1).padStart(3, '0')}`;
      
      const factureData = {
        numero_facture: invoiceNumber,
        client_id: 'temp_client_id',
        client_name: newFacture.client_name || 'Cliente Temporário',
        date: newFacture.date,
        echeance: newFacture.due_date || newFacture.date,
        articles: [
          {
            description: newFacture.description,
            qty: 1,
            price: newFacture.total_amount
          }
        ],
        subtotal: newFacture.total_amount,
        tva: newFacture.total_amount * 0.2, // 20% de TVA
        total: newFacture.total_amount * 1.2,
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
        status: 'pending'
      });
      
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Faturas</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium"
        >
          <span className="material-icons">add</span>
          Nova Fatura
        </button>
      </div>
      
      {factures.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma fatura encontrada</p>
          <button 
            onClick={() => setShowModal(true)}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Criar Primeira Fatura
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {factures.map((facture) => (
            <div key={facture.id} className="bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{facture.numero_facture}</h3>
                  <p className="text-gray-600">{facture.articles?.[0]?.description || 'Sem descrição'}</p>
                  <p className="text-sm text-gray-500">
                    Cliente: {facture.client_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Data: {new Date(facture.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Vencimento: {new Date(facture.echeance).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">CHF {facture.total?.toFixed(2) || facture.total_amount?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-gray-500">
                    Subtotal: CHF {facture.subtotal?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-sm text-gray-500">
                    TVA: CHF {facture.tva?.toFixed(2) || '0.00'}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    facture.status === 'paid' ? 'bg-green-100 text-green-800' :
                    facture.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {facture.status === 'paid' ? 'Pago' :
                     facture.status === 'overdue' ? 'Vencido' : 'Pendente'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => handleGeneratePDF(facture)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Gerar PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Nova Fatura */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Nova Fatura</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateFacture} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  required
                  value={newFacture.client_name}
                  onChange={(e) => setNewFacture({ ...newFacture, client_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ex: Tech Solutions SA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  value={newFacture.description}
                  onChange={(e) => setNewFacture({ ...newFacture, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ex: Consultoria técnica - Projeto A"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="material-icons text-sm inline mr-1">calendar_today</span>
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={newFacture.date}
                    onChange={(e) => setNewFacture({ ...newFacture, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vencimento
                  </label>
                  <input
                    type="date"
                    value={newFacture.due_date}
                    onChange={(e) => setNewFacture({ ...newFacture, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="material-icons text-sm inline mr-1">attach_money</span>
                  Valor Total (CHF)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={newFacture.total_amount}
                  onChange={(e) => setNewFacture({ ...newFacture, total_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newFacture.status}
                  onChange={(e) => setNewFacture({ ...newFacture, status: e.target.value as 'pending' | 'paid' | 'overdue' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="overdue">Vencido</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Criando...
                    </>
                  ) : (
                    <>
                      <span className="material-icons text-sm mr-1">description</span>
                      Criar Fatura
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