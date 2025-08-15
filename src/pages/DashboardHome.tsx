import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminPanelAccess from '../components/admin/AdminPanelAccess';

interface Facture {
  id: string;
  numero_facture: string;
  client_name: string;
  date: string;
  total: number;
  statut: string;
}

// Formatar data para exibição amigável
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('fr-FR', options);
};

// Formatar número para exibição monetária
const formatCurrency = (amount: number) => {
  return `${amount.toFixed(2)} CHF`;
};

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para dados do dashboard
  const [facturesRecentes, setFacturesRecentes] = useState<Facture[]>([]);
  const [totalFactures, setTotalFactures] = useState<number>(0);
  const [chiffreAffaires, setChiffreAffaires] = useState<number>(0);
  const [montantEnAttente, setMontantEnAttente] = useState<number>(0);
  const [facturesEnRetard, setFacturesEnRetard] = useState<number>(0);
  const [clientsActifs, setClientsActifs] = useState<number>(0);
  
  // Taxa de crescimento (a ser calculada posteriormente)
  const [croissanceFactures, setCroissanceFactures] = useState<number>(0);
  const [croissanceChiffreAffaires, setCroissanceChiffreAffaires] = useState<number>(0);
  
  // Buscar dados do Supabase
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // TODO: Substituir por SQLite - 1. Buscar faturas recentes
        const fetchFactures = async () => {
          console.log('Buscando faturas do SQLite...');
          // TODO: Implementar com SQLite
          // const data = await sqliteService.getFactures(userId);
          // return data || [];
          
          // Por enquanto, usar dados de exemplo
          return [
            {
              id: 'INV-001',
              description: 'Client: TechnoServ SA; Articles: Consultoria - 1x 150CHF',
              unit_price: 15000,
              created_at: '2025-08-14',
              is_active: true
            }
          ];
        };
        
        // TODO: Substituir por SQLite - 2. Buscar clientes ativos
        const fetchClients = async () => {
          console.log('Buscando clientes do SQLite...');
          // TODO: Implementar com SQLite
          // const data = await sqliteService.getClients(userId);
          // return data || [];
          
          // Por enquanto, usar dados de exemplo
          return [
            { id: 'client_1' },
            { id: 'client_2' }
          ];
        };
        
        // Executar buscas em paralelo
        const [facturesData, clientsData] = await Promise.all([
          fetchFactures(),
          fetchClients()
        ]);
        
        console.log('Dados obtidos:', { facturesData, clientsData });
        
        // Processar dados de faturas
        if (facturesData.length > 0) {
          // Formatar faturas para exibição
          const formattedFactures = facturesData.map((facture: any) => {
            // Extrair informações do cliente da descrição
            const clientMatch = facture.description?.match(/Client: ([^;]+)/) || [];
            const clientName = clientMatch[1] || 'Client non défini';
            
            // Calcular valor total
            const total = facture.unit_price / 100;
            
            // Determinar status (simplificado)
            const statut = facture.is_active ? 'envoyée' : 'brouillon';
            
            return {
              id: facture.id,
              numero_facture: facture.name,
              client_name: clientName,
              date: facture.created_at ? formatDate(facture.created_at) : '',
              total: total,
              statut: statut
            };
          });
          
          // Pegar apenas as 5 faturas mais recentes para exibição
          setFacturesRecentes(formattedFactures.slice(0, 5));
          
          // Calcular métricas
          setTotalFactures(facturesData.length);
          
          // Total faturado (faturas pagas - simplificação)
          const totalPaid = facturesData
            .filter((f: any) => f.is_active)
            .reduce((sum: number, f: any) => sum + (f.unit_price / 100), 0);
          setChiffreAffaires(totalPaid);
          
          // Montante em espera (faturas enviadas mas não pagas - simplificação)
          const totalPending = facturesData
            .filter((f: any) => f.is_active)
            .reduce((sum: number, f: any) => sum + (f.unit_price / 100), 0);
          setMontantEnAttente(totalPending);
          
          // Faturas em atraso (simplificação)
          const overdueCount = facturesData
            .filter((f: any) => {
              const createdDate = new Date(f.created_at);
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return f.is_active && createdDate < thirtyDaysAgo;
            })
            .length;
          setFacturesEnRetard(overdueCount);
          
          // Taxa de crescimento (exemplo simplificado, 12% crescimento)
          setCroissanceFactures(12);
          setCroissanceChiffreAffaires(8);
        }
        
        // Definir número de clientes ativos
        setClientsActifs(clientsData.length);
        
      } catch (err: any) {
        console.error('Erro ao buscar dados do dashboard:', err);
        setError('Erreur lors du chargement des données du tableau de bord');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Função para ir para a página de criação de fatura
  const goToNewInvoice = () => {
    navigate('/dashboard/factures');
    // Idealmente, aqui abriríamos diretamente o modal de nova fatura
  };
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre activité comptable</p>
      </div>

      {/* Painel de Administração (apenas para admins) */}
      <AdminPanelAccess userType={user?.account_type} className="mb-6" />
      
      {/* Alerta de erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Indicador de carregamento */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-5 flex flex-col gap-2 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
      /* Cards de estatísticas */
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Total de faturas */}
        <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="material-icons text-blue-600 bg-blue-100 rounded-lg p-2">description</span>
            <div>
              <div className="text-xs text-gray-500">Total factures</div>
              <div className="text-2xl font-bold text-gray-900">{totalFactures}</div>
              <div className="text-xs text-gray-500">ce mois-ci</div>
            </div>
          </div>
          {croissanceFactures > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-green-600 text-xs font-semibold bg-green-100 rounded px-2">+{croissanceFactures}%</span>
            </div>
          )}
        </div>
        
        {/* Faturamento */}
        <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="material-icons text-green-600 bg-green-100 rounded-lg p-2">attach_money</span>
            <div>
              <div className="text-xs text-gray-500">Chiffre d'affaires</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(chiffreAffaires)}</div>
              <div className="text-xs text-gray-500">factures payées</div>
            </div>
          </div>
          {croissanceChiffreAffaires > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-green-600 text-xs font-semibold bg-green-100 rounded px-2">+{croissanceChiffreAffaires}%</span>
            </div>
          )}
        </div>
        
        {/* Montante pendente */}
        <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="material-icons text-yellow-600 bg-yellow-100 rounded-lg p-2">trending_up</span>
            <div>
              <div className="text-xs text-gray-500">En attente</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(montantEnAttente)}</div>
              <div className="text-xs text-gray-500">factures envoyées</div>
            </div>
          </div>
        </div>
        
        {/* Faturas em atraso */}
        <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="material-icons text-red-600 bg-red-100 rounded-lg p-2">warning</span>
            <div>
              <div className="text-xs text-gray-500">En retard</div>
              <div className="text-2xl font-bold text-gray-900">{facturesEnRetard}</div>
              <div className="text-xs text-gray-500">factures échues</div>
            </div>
          </div>
          {facturesEnRetard > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-red-600 text-xs font-semibold bg-red-100 rounded px-2">Action requise</span>
            </div>
          )}
        </div>
        
        {/* Clientes ativos */}
        <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="material-icons text-purple-600 bg-purple-100 rounded-lg p-2">groups</span>
            <div>
              <div className="text-xs text-gray-500">Clients actifs</div>
              <div className="text-2xl font-bold text-gray-900">{clientsActifs}</div>
              <div className="text-xs text-gray-500">clients enregistrés</div>
            </div>
          </div>
        </div>
      </div>
      )}
      {/* Factures récentes e Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Factures récentes</h2>
            <button 
              onClick={goToNewInvoice}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold"
            >
              + Nouvelle facture
            </button>
          </div>
          
          {loading ? (
            // Estado de carregamento para a tabela
            <div className="animate-pulse">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="border-b py-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : facturesRecentes.length === 0 ? (
            // Mensagem para quando não há faturas
            <div className="py-8 text-center text-gray-500">
              <span className="material-icons text-gray-300 text-5xl mb-2">receipt_long</span>
              <p>Aucune facture trouvée</p>
              <button 
                onClick={goToNewInvoice}
                className="mt-2 text-red-600 hover:underline"
              >
                Créer votre première facture
              </button>
            </div>
          ) : (
            // Tabela de faturas recentes
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-left border-b">
                    <th className="py-2 pr-4">N° Facture</th>
                    <th className="py-2 pr-4">Client</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Montant</th>
                    <th className="py-2 pr-4">Statut</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {facturesRecentes.map((facture) => (
                    <tr key={facture.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-mono">{facture.numero_facture}</td>
                      <td className="py-2 pr-4">{facture.client_name}</td>
                      <td className="py-2 pr-4">{facture.date}</td>
                      <td className="py-2 pr-4 font-semibold">{formatCurrency(facture.total)}</td>
                      <td className="py-2 pr-4">
                        {facture.statut === 'payée' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">payée</span>}
                        {facture.statut === 'envoyée' && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">envoyée</span>}
                        {facture.statut === 'brouillon' && <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">brouillon</span>}
                      </td>
                      <td className="py-2">
                        <Link to={`/dashboard/factures`} className="text-gray-400 hover:text-gray-700">
                          <span className="material-icons">visibility</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Ações rápidas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={goToNewInvoice}
              className="flex flex-col items-center justify-center px-3 py-4 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200"
            >
              <span className="material-icons mb-1">add</span>
              Créer une facture
              <span className="text-xs font-normal text-gray-500">Nouvelle facture client</span>
            </button>
            <Link to="/dashboard/clients" className="flex flex-col items-center justify-center px-3 py-4 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200">
              <span className="material-icons mb-1">person_add</span>
              Ajouter un client
              <span className="text-xs font-normal text-gray-500">Nouveau client</span>
            </Link>
            <Link to="/dashboard/reports" className="flex flex-col items-center justify-center px-3 py-4 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200">
              <span className="material-icons mb-1">insights</span>
              Voir les rapports
              <span className="text-xs font-normal text-gray-500">Analytics & insights</span>
            </Link>
            <button className="flex flex-col items-center justify-center px-3 py-4 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200">
              <span className="material-icons mb-1">download</span>
              Exporter les données
              <span className="text-xs font-normal text-gray-500">Export Excel/CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 