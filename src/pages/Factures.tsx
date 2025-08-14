import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { PDFService } from '../services/pdf.service';
import { loadClientsFixed } from '../utils/fixClientsLoad';

// Define tipos para os artigos e faturas
interface Article {
  description: string;
  qty: number;
  price: number;
}

interface Facture {
  id?: string;
  numero_facture: string;
  client_name: string;
  client_id: string;
  date: string;
  echeance: string;
  articles: Article[];
  subtotal: number;
  tva: number;
  total: number;
  statut: string;
}

// Função auxiliar para formatar dados da fatura (definida antes de ser usada)
const formatFactureData = (facture: any): Facture => {
  // Extrair informações do cliente da descrição
  const clientMatch = facture.description?.match(/Client: ([^;]+)/) || [];
  const clientName = clientMatch[1] || 'Client inconnu';
  
  // Extrair artigos da descrição
  let articles: Article[] = [];
  const articlesMatch = facture.description?.match(/Articles: (.+)/);
  if (articlesMatch && articlesMatch[1]) {
    articles = articlesMatch[1].split(', ').map((item: string) => {
      const parts = item.match(/(.+) - (\d+)x (\d+(?:\.\d+)?)CHF/);
      if (parts) {
        return {
          description: parts[1],
          qty: parseInt(parts[2], 10),
          price: parseFloat(parts[3])
        };
      }
      return { description: item, qty: 1, price: 0 };
    });
  }
  
  // Calcular valores
  const total = facture.unit_price / 100;
  // TVA apenas para exibição, não afeta o total
  const tva = total * (facture.vat_rate || TVA);
  const subtotal = total; // Subtotal é igual ao total
  
  return {
    id: facture.id,
    numero_facture: facture.name,
    client_name: clientName,
    client_id: '',
    date: facture.created_at ? new Date(facture.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    echeance: facture.created_at ? new Date(new Date(facture.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    total,
    subtotal,
    tva,
    statut: facture.is_active ? 'envoyée' : 'brouillon',
    articles
  };
};

const getStatusClass = (statut: string) => {
  switch (statut) {
    case 'payée':
      return 'bg-green-100 text-green-700';
    case 'envoyée':
      return 'bg-blue-100 text-blue-700';
    case 'brouillon':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

// Taxa de TVA suíça (7.7%)
const TVA = 0.077;

const Factures = () => {
  const [factures, setFactures] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedFacture, setSelectedFacture] = useState<any | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{type: string, message: string} | null>(null);
  const [form, setForm] = useState<any>({
    numero_facture: '',
    client_id: '',
    date: '',
    echeance: '',
    articles: [
      { description: '', qty: 1, price: 0 }
    ]
  });

  // Buscar faturas da tabela
  useEffect(() => {
    async function fetchFactures() {
      try {
        const { data: directData, error: directError } = await supabase
          .from('Factures')
          .select('*')
          .eq('category', 'facture')
          .order('created_at', { ascending: false });
        
        if (directError) {
          console.error('Erro ao buscar faturas:', directError);
          setFactures([]);
          return;
        }
        
        if (directData && directData.length > 0) {
          // Usar a função formatFactureData para padronizar os dados
          const facturesFormatted = directData.map(formatFactureData);
          setFactures(facturesFormatted);
        } else {
          setFactures([]);
        }
      } catch (e) {
        console.error('Erro ao buscar faturas:', e);
        setFactures([]);
      }
    }
    fetchFactures();
  }, []);

  // Buscar clientes do Supabase filtrados pelo usuário atual
  useEffect(() => {
    async function fetchClients() {
      try {
        // Usar a função corrigida que filtra clientes pelo usuário atual
        const clientsData = await loadClientsFixed();
        // Garantir que temos apenas os campos necessários
        setClients(clientsData.map((client: any) => ({
          id: client.id,
          company: client.company
        })));
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        setClients([]);
      }
    }
    fetchClients();
  }, []);

  const handleArticleChange = (idx: number, field: string, value: any) => {
    setForm((f: any) => {
      const articles = [...f.articles];
      // Garantir que valores numéricos sejam convertidos corretamente
      if (field === 'qty' || field === 'price') {
        // Substituir vírgula por ponto para aceitar ambos formatos
        const numericValue = value.toString().replace(',', '.');
        // Converter para número e garantir que não seja NaN
        articles[idx][field] = parseFloat(numericValue) || 0;
      } else {
        articles[idx][field] = value;
      }
      return { ...f, articles };
    });
  };

  const addArticle = () => {
    setForm((f: any) => ({ ...f, articles: [...f.articles, { description: '', qty: 1, price: 0 }] }));
  };

  const removeArticle = (idx: number) => {
    setForm((f: any) => ({ ...f, articles: f.articles.filter((_: any, i: any) => i !== idx) }));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f: any) => ({ ...f, [name]: value }));
  };

  // Calcular subtotal garantindo que seja um número válido
  const subtotal = form.articles.reduce((sum: number, a: { description: string; qty: number; price: number }) => {
    // Garantir que qty e price sejam números
    const qty = typeof a.qty === 'number' ? a.qty : parseFloat(a.qty) || 0;
    const price = typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0;
    return sum + (qty * price);
  }, 0);
  
  // Calcular TVA apenas para exibição (não é somado ao total)
  const tva = subtotal * TVA;
  // O total é igual ao subtotal, TVA é apenas para exibição
  const total = subtotal;

  // Visualizar fatura
  const handleView = (facture: any) => {
    setSelectedFacture(facture);
    setModalMode('view');
    setShowModal(true);
  };

  // Editar fatura
  const handleEdit = (facture: any) => {
    // Encontrar o ID do cliente pelo nome
    const clientId = clients.find(c => c.company === facture.client_name)?.id || '';
    
    setForm({
      numero_facture: facture.numero_facture || '', // Número da fatura
      client_id: clientId, // ID do cliente
      date: facture.date || '',
      echeance: facture.echeance || '',
      articles: Array.isArray(facture.articles) && facture.articles.length > 0
        ? facture.articles.map((a: any) => ({
            description: a.description || '',
            qty: a.qty || 1,
            price: a.price || 0
          }))
        : [{ description: '', qty: 1, price: 0 }],
      id: facture.id
    });
    setModalMode('edit');
    setShowModal(true);
  };

  // Gerar PDF da fatura
  const handleGeneratePDF = (facture: any) => {
    try {
      PDFService.generateInvoicePDF(facture);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setAlert({ type: 'error', message: 'Erreur lors de la génération du PDF' });
    }
  };

  // Deletar fatura
  const handleDelete = async (facture: any) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette facture ?')) return;
    setLoading(true);
    
    const { error } = await supabase
      .from('Factures')
      .delete()
      .eq('name', facture.numero_facture);  // Usando name como identificador
    
    if (error) {
      console.error('Erro ao deletar fatura:', error);
      setAlert({ type: 'error', message: `Erreur lors de la suppression: ${error.message}` });
    }
    
    // Recarregar faturas após deletar
    try {
      const { data: directData, error: directError } = await supabase
        .from('Factures')
        .select('*')
        .eq('category', 'facture')
        .order('created_at', { ascending: false });
      
      if (directError) {
        console.error('Erro ao recarregar faturas:', directError);
        setLoading(false);
        return;
      }
      
      if (directData) {
        // Usar a função formatFactureData para formatar os dados
        const facturesFormatted = directData.map(formatFactureData);
        setFactures(facturesFormatted);
      }
    } catch (e) {
      console.error('Erro ao recarregar faturas:', e);
    }
    setLoading(false);
  };

  // Salvar edição ou criação
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    
    
    // Verificar se há pelo menos um artigo com preço maior que zero
    if (form.articles.every((a: { price: number }) => !a.price || a.price <= 0)) {
      setAlert({ type: 'error', message: 'Veuillez ajouter au moins un article avec un prix supérieur à zéro.' });
      setLoading(false);
      return;
    }

    // Garantir que o valor total é maior que zero
    if (total <= 0) {
      setAlert({ type: 'error', message: 'Le montant total de la facture doit être supérieur à zéro.' });
      setLoading(false);
      return;
    }

    // Validar que client_id não está vazio
    if (!form.client_id) {
      setAlert({ type: 'error', message: 'Veuillez sélectionner un client.' });
      setLoading(false);
      return;
    }

    // Garantir que o número da fatura está preenchido
    if (!form.numero_facture) {
      setAlert({ type: 'error', message: 'Veuillez saisir un numéro de facture.' });
      setLoading(false);
      return;
    }

    // Esta verificação já foi feita anteriormente, é redundante
    
    // Calcular valor total em centavos, garantindo que seja um número inteiro válido
    const unitPriceInCents = Math.round(Math.max(0, total) * 100);
    
    // Preparar dados para salvar na tabela Factures - apenas incluindo colunas que existem na tabela
    // Garantir que todos os preços dos artigos estão corretamente formatados
    const formattedArticles = form.articles.map((a: any) => {
      // Garantir que qty e price são números válidos
      const qty = typeof a.qty === 'number' ? a.qty : parseFloat(a.qty) || 0;
      const price = typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0;
      return {
        ...a,
        qty,
        price
      };
    });
    
    const invoiceData = {
      name: form.numero_facture, // Número da fatura
      description: `Client: ${clients.find(c => c.id === form.client_id)?.company || 'Client inconnu'}; Articles: ${formattedArticles.map((a: any) => `${a.description} - ${a.qty}x ${a.price}CHF`).join(', ')}`, // Descrição com cliente e artigos
      category: 'facture', // Categoria
      unit_price: unitPriceInCents, // Preço total da fatura em centavos (bigint)
      unit: 'facture', // Unidade
      vat_rate: Number(TVA), // Taxa de TVA como número
      is_active: true // Ativo
    };
    
    
    let result;
    if (modalMode === 'edit' && form.id) {
      // Para edição, atualizar apenas os campos necessários
      // Reutilizar o valor de unitPriceInCents já calculado anteriormente
      
      const updateData = {
        name: form.numero_facture,
        description: `Client: ${clients.find(c => c.id === form.client_id)?.company || 'Client inconnu'}; Articles: ${form.articles.map((a: any) => `${a.description} - ${a.qty}x ${a.price}CHF`).join(', ')}`,
        unit_price: unitPriceInCents, // Preço total da fatura em centavos (bigint)
        vat_rate: Number(TVA) // Taxa de TVA como número
      };
      result = await supabase
        .from('Factures')
        .update(updateData)
        .eq('id', form.id)
        .select();
    } else {
      result = await supabase
        .from('Factures')
        .insert([invoiceData])
        .select();
    }
    
    
    setLoading(false);
    if (result.error) {
      console.error('Erro do Supabase:', result.error);
      setAlert({ type: 'error', message: result.error.message });
      return;
    }
    if (result.data && result.data[0]) {
      // Recarregar faturas após salvar
      try {
        const { data: directData, error: directError } = await supabase
          .from('Factures')
          .select('*')
          .eq('category', 'facture')
          .order('created_at', { ascending: false });
        
        if (directError) {
          console.error('Erro ao recarregar faturas:', directError);
          return;
        }
        
        if (directData) {
          // Usar a função formatFactureData para formatar os dados
          const facturesFormatted = directData.map(formatFactureData);
          setFactures(facturesFormatted);
        }
      } catch (e) {
        console.error('Erro ao recarregar faturas:', e);
      }
      
      setAlert({ type: 'success', message: modalMode === 'edit' ? 'Facture modifiée avec succès!' : 'Facture créée avec succès!' });
      setShowModal(false);
      setForm({
        numero_facture: '',
        client_id: '',
        date: '',
        echeance: '',
        articles: [
          { description: '', qty: 1, price: 0 }
        ]
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Gestion des factures</h1>
          <p className="text-gray-600">Créez et gérez vos factures clients</p>
        </div>
        <button
          className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-red-700 flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <span className="material-icons">add</span>
          Nouvelle facture
        </button>
      </div>
      {alert && (
        <div className={`mb-4 px-4 py-3 rounded ${alert.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{alert.message}</div>
      )}
      <div className="bg-white rounded-xl shadow p-6 mb-8 flex flex-col md:flex-row md:items-center gap-4">
        <input
          type="text"
          placeholder="Rechercher par numéro de facture ou nom du client..."
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
        />
        <select className="border border-gray-200 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-600 min-w-[180px]">
          <option value="">Tous les statuts</option>
          <option value="payée">Payée</option>
          <option value="envoyée">Envoyée</option>
          <option value="brouillon">Brouillon</option>
        </select>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Toutes les factures ({factures.length})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-left border-b">
                <th className="py-2 pr-4">N° Facture</th>
                <th className="py-2 pr-4">Client</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Échéance</th>
                <th className="py-2 pr-4">Montant</th>
                <th className="py-2 pr-4">TVA (7.7%)</th>
                <th className="py-2 pr-4">Statut</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {factures.map((facture: any, idx: any) => (
                <tr key={facture.id || idx} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-mono">{facture.numero_facture}</td>
                  <td className="py-2 pr-4">{facture.client_name}</td>
                  <td className="py-2 pr-4">{facture.date}</td>
                  <td className="py-2 pr-4">{facture.echeance}</td>
                  <td className="py-2 pr-4 font-semibold">{facture.total ? `${facture.total.toFixed(2)} CHF` : ''}</td>
                  <td className="py-2 pr-4 text-red-600 font-semibold">{facture.tva ? `${facture.tva.toFixed(2)} CHF` : ''}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusClass(facture.statut)}`}>{facture.statut}</span>
                  </td>
                  <td className="py-2 flex gap-2">
                    <button className="text-gray-400 hover:text-gray-700" title="Voir" onClick={() => handleView(facture)}>
                      <span className="material-icons">visibility</span>
                    </button>
                    <button className="text-gray-400 hover:text-gray-700" title="Éditer" onClick={() => handleEdit(facture)}>
                      <span className="material-icons">edit</span>
                    </button>
                    <button className="text-gray-400 hover:text-red-600" title="Supprimer" onClick={() => handleDelete(facture)}>
                      <span className="material-icons">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal de nova facture, edição ou visualização */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-8 relative animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-red-600 text-2xl"
              onClick={() => setShowModal(false)}
              aria-label="Fermer"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-2">
              {modalMode === 'view' ? 'Détails de la facture' : modalMode === 'edit' ? 'Modifier la facture' : 'Nouvelle facture'}
            </h2>
            {modalMode === 'view' && selectedFacture ? (
              <div className="space-y-4">
                <div><b>N° Facture:</b> {selectedFacture.numero_facture}</div>
                <div><b>Client:</b> {selectedFacture.client_name}</div>
                <div><b>Date:</b> {selectedFacture.date}</div>
                <div><b>Échéance:</b> {selectedFacture.echeance}</div>
                <div><b>Articles:</b>
                  <ul className="list-disc ml-6">
                    {selectedFacture.articles && selectedFacture.articles.map((a: any, i: number) => (
                      <li key={i}>{a.description} — {a.qty} x {a.price} CHF</li>
                    ))}
                  </ul>
                </div>
                <div><b>Sous-total:</b> {selectedFacture.subtotal.toFixed(2)} CHF</div>
                <div><b>TVA:</b> {selectedFacture.tva.toFixed(2)} CHF</div>
                <div><b>Total:</b> {selectedFacture.total.toFixed(2)} CHF</div>
                <div><b>Statut:</b> {selectedFacture.statut}</div>
                
                {/* Botão para gerar PDF */}
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                  <button
                    onClick={() => handleGeneratePDF(selectedFacture)}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-red-700 flex items-center gap-2"
                  >
                    <span className="material-icons">print</span>
                    Imprimer PDF
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">N° Facture *</label>
                    <input
                      type="text"
                      name="numero_facture"
                      value={form.numero_facture}
                      onChange={handleFormChange}
                      placeholder="Ex: FACT-2025-001"
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Client *</label>
                    <select
                      name="client_id"
                      value={form.client_id}
                      onChange={handleFormChange}
                      required
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Sélectionner un client</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.company}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Date de facturation</label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleFormChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Date d'échéance</label>
                    <input
                      type="date"
                      name="echeance"
                      value={form.echeance}
                      onChange={handleFormChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 mt-4">Articles de la facture</h3>
                  <div className="grid grid-cols-12 gap-2 items-center mb-2 text-xs font-semibold text-gray-500">
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2">Qté</div>
                    <div className="col-span-3">Prix unitaire</div>
                    <div className="col-span-2">Total HT</div>
                  </div>
                  {form.articles.map((a: any, idx: any) => (
                    <div className="grid grid-cols-12 gap-2 items-center mb-2" key={idx}>
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Description du service"
                          value={a.description}
                          onChange={e => handleArticleChange(idx, 'description', e.target.value)}
                          className="w-full border rounded px-2 py-1"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={1}
                          value={a.qty}
                          onChange={e => handleArticleChange(idx, 'qty', e.target.value)}
                          className="w-full border rounded px-2 py-1"
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          min={0}
                          value={a.price}
                          onChange={e => handleArticleChange(idx, 'price', e.target.value)}
                          className="w-full border rounded px-2 py-1"
                          required
                        />
                      </div>
                      <div className="col-span-2 text-right font-semibold">
                        {(a.qty * a.price).toFixed(2)} CHF
                      </div>
                      <div className="col-span-12 text-right">
                        {form.articles.length > 1 && (
                          <button type="button" className="text-red-500 hover:text-red-700" onClick={() => removeArticle(idx)} title="Supprimer">
                            <span className="material-icons">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button type="button" className="mt-2 px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 flex items-center gap-2" onClick={addArticle}>
                    <span className="material-icons">add</span> Ajouter un article
                  </button>
                </div>
                <div className="flex flex-col items-end gap-1 mt-6">
                  <div className="text-sm text-gray-600">Sous-total HT: <span className="font-semibold text-gray-900">{subtotal.toFixed(2)} CHF</span></div>
                  <div className="text-sm text-gray-600">TVA (7.7%): <span className="font-semibold text-gray-900">{tva.toFixed(2)} CHF</span></div>
                  <div className="text-lg font-bold text-gray-900">Total TTC: {total.toFixed(2)} CHF</div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100">Annuler</button>
                  <button type="submit" className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700" disabled={loading}>{loading ? 'Enregistrement...' : 'Créer la facture'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Factures; 