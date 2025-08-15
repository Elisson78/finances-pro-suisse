import React, { useState, useEffect } from 'react';

interface NewFactureData {
  client_name: string;
  description: string;
  date: string;
  due_date: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue';
}

interface Facture {
  id: string;
  invoice_number: string;
  description: string;
  date: string;
  total_amount: number;
  status: string;
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

  // Buscar faturas
  useEffect(() => {
    async function fetchFactures() {
      try {
        const response = await fetch('/api/factures', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          setFactures(result.data || []);
        } else if (response.status === 401) {
          setError('Sessão expirada. Faça login novamente.');
          // Redirecionar para login em 3 segundos
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }, 3000);
        } else {
          throw new Error('Erro ao buscar faturas');
        }
      } catch (err) {
        console.error('Erro ao buscar faturas:', err);
        setError('Erro ao carregar faturas. Tente fazer login novamente.');
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
      // Gerar número da fatura
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(factures.length + 1).padStart(3, '0')}`;
      
      const factureData = {
        client_id: 'temp_client_id',
        client_name: 'Cliente Temporário',
        date: newFacture.date,
        echeance: newFacture.due_date || newFacture.date,
        articles: [
          {
            description: newFacture.description,
            qty: 1,
            price: newFacture.total_amount,
            total: newFacture.total_amount
          }
        ],
        subtotal: newFacture.total_amount,
        tva: 0,
        total: newFacture.total_amount,
        status: newFacture.status
      };

      const response = await fetch('/api/factures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(factureData)
      });

      if (response.ok) {
        // Recarregar faturas
        const newResponse = await fetch('/api/factures', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (newResponse.ok) {
          const result = await newResponse.json();
          setFactures(result.data || []);
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
      } else {
        throw new Error('Erro ao criar fatura');
      }
    } catch (err) {
      console.error('Erro ao criar fatura:', err);
      setError('Erro ao criar fatura');
    } finally {
      setIsCreating(false);
    }
  };

  // Gerar PDF (simplificado)
  const handleGeneratePDF = async (facture: Facture) => {
    try {
      alert(`PDF da fatura ${facture.invoice_number} seria gerado aqui.`);
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
                  <h3 className="text-lg font-semibold">{facture.invoice_number}</h3>
                  <p className="text-gray-600">{facture.description}</p>
                  <p className="text-sm text-gray-500">
                    Data: {new Date(facture.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">CHF {facture.total_amount?.toFixed(2)}</p>
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