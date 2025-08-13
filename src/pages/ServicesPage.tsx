import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

// Interface para os serviços
interface Service {
  id: string;
  nom: string;
  description: string;
  categorie: string;
  prix: string;
  unite: string;
  duree: string;
  statut: string;
}

// Serviços de exemplo como fallback
const servicesMock = [
  {
    id: '1',
    nom: 'Consultation stratégique',
    description: "Analyse et conseil stratégique pour votre entreprise.",
    categorie: 'consultation',
    prix: '150.00 CHF',
    unite: 'par heure',
    duree: '2h',
    statut: 'Actif',
  },
  {
    id: '2',
    nom: 'Développement web sur mesure',
    description: "Création d'applications web personnalisées.",
    categorie: 'développement',
    prix: '95.00 CHF',
    unite: 'par heure',
    duree: '40h',
    statut: 'Actif',
  },
  {
    id: '3',
    nom: 'Formation équipe technique',
    description: "Formation personnalisée pour votre équipe technique.",
    categorie: 'formation',
    prix: '800.00 CHF',
    unite: 'par jour',
    duree: '8h',
    statut: 'Actif',
  },
  {
    id: '4',
    nom: 'Audit de sécurité',
    description: "Évaluation complète de la sécurité de vos systèmes.",
    categorie: 'audit',
    prix: '1200.00 CHF',
    unite: 'par projet',
    duree: '5j',
    statut: 'Actif',
  },
  {
    id: '5',
    nom: 'Support technique',
    description: "Assistance technique continue pour vos opérations.",
    categorie: 'support',
    prix: '50.00 CHF',
    unite: 'par heure',
    duree: 'selon besoin',
    statut: 'Actif',
  },
];

const getCategorieClass = (cat: string) => {
  switch (cat) {
    case 'consultation':
      return 'bg-blue-100 text-blue-700';
    case 'développement':
      return 'bg-green-100 text-green-700';
    case 'formation':
      return 'bg-purple-100 text-purple-700';
    case 'audit':
      return 'bg-yellow-100 text-yellow-700';
    case 'support':
      return 'bg-pink-100 text-pink-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Buscar serviços do Supabase
  const fetchServices = async () => {
    try {
      setLoading(true);
      console.log('Buscando serviços do Supabase...');
      
      // Tentar usar a função RPC
      const { data: servicesData, error: rpcError } = await supabase.rpc('fetch_all_services');
      
      if (rpcError) {
        console.error('Erro ao buscar serviços via RPC:', rpcError);
        
        // Fallback: buscar diretamente da tabela
        const { data: directData, error: directError } = await supabase
          .from('Services')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (directError) {
          console.error('Erro ao buscar serviços diretamente:', directError);
          setError('Erro ao carregar serviços');
          setServices(servicesMock); // Usar dados de exemplo como fallback
        } else if (directData) {
          console.log('Serviços obtidos diretamente:', directData);
          
          // Mapear dados para o formato esperado
          const formattedServices = directData.map((service: any) => ({
            id: service.id,
            nom: service.name,
            description: service.description || '',
            categorie: service.category || '',
            prix: `${(service.unit_price / 100).toFixed(2)} CHF`,
            unite: service.unit || '',
            duree: service.estimated_duration || '',
            statut: service.is_active ? 'Actif' : 'Inactif'
          }));
          
          setServices(formattedServices);
        }
      } else if (servicesData) {
        console.log('Serviços obtidos via RPC:', servicesData);
        
        // Mapear dados para o formato esperado
        const formattedServices = servicesData.map((service: any) => ({
          id: service.id,
          nom: service.name,
          description: service.description || '',
          categorie: service.category || '',
          prix: `${(service.unit_price / 100).toFixed(2)} CHF`,
          unite: service.unit || '',
          duree: service.estimated_duration || '',
          statut: service.is_active ? 'Actif' : 'Inactif'
        }));
        
        setServices(formattedServices);
      } else {
        console.warn('Nenhum serviço encontrado');
        setServices(servicesMock); // Usar dados de exemplo como fallback
      }
    } catch (err) {
      console.error('Erro ao buscar serviços:', err);
      setError('Erro ao carregar serviços');
      setServices(servicesMock); // Usar dados de exemplo como fallback
    } finally {
      setLoading(false);
    }
  };

  // Buscar serviços ao montar o componente
  useEffect(() => {
    fetchServices();
  }, []);

  // Filtrar serviços com base na busca e categoria
  const filteredServices = services.filter((service) => {
    const matchesSearch = searchTerm === '' || 
      service.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || service.categorie === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Calcular estatísticas
  const activeServices = services.filter(s => s.statut === 'Actif').length;
  const averagePrice = services.length > 0 
    ? Math.round(services.reduce((sum, service) => sum + parseFloat(service.prix.replace(' CHF', '')), 0) / services.length)
    : 0;
  const premiumPrice = services.length > 0 
    ? Math.max(...services.map(service => parseFloat(service.prix.replace(' CHF', ''))))
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Gestion des services</h1>
          <p className="text-gray-600">Gérez votre catalogue de services et prestations</p>
        </div>
        <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-red-700 flex items-center gap-2">
          <span className="material-icons">add</span>
          Nouveau service
        </button>
      </div>
      
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="material-icons text-blue-600 bg-blue-100 rounded-lg p-2">inventory_2</span>
            <div>
              <div className="text-xs text-gray-500">Total services</div>
              <div className="text-2xl font-bold text-gray-900">{services.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="material-icons text-green-600 bg-green-100 rounded-lg p-2">work</span>
            <div>
              <div className="text-xs text-gray-500">Services actifs</div>
              <div className="text-2xl font-bold text-gray-900">{activeServices}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="material-icons text-purple-600 bg-purple-100 rounded-lg p-2">attach_money</span>
            <div>
              <div className="text-xs text-gray-500">Prix moyen</div>
              <div className="text-2xl font-bold text-gray-900">{averagePrice} CHF</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="material-icons text-yellow-600 bg-yellow-100 rounded-lg p-2">paid</span>
            <div>
              <div className="text-xs text-gray-500">Service premium</div>
              <div className="text-2xl font-bold text-gray-900">{premiumPrice} CHF</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Busca e filtro */}
      <div className="bg-white rounded-xl shadow p-6 mb-8 flex flex-col md:flex-row md:items-center gap-4">
        <input
          type="text"
          placeholder="Rechercher par nom ou description..."
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="border border-gray-200 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-600 min-w-[180px]"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Toutes les catégories</option>
          <option value="consultation">Consultation</option>
          <option value="développement">Développement</option>
          <option value="formation">Formation</option>
          <option value="audit">Audit</option>
          <option value="support">Support</option>
        </select>
      </div>
      
      {/* Tabela de serviços */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          Tous les services ({filteredServices.length})
          {loading && <span className="ml-2 text-sm text-gray-500">(Chargement...)</span>}
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-left border-b">
                <th className="py-2 pr-4">Service</th>
                <th className="py-2 pr-4">Catégorie</th>
                <th className="py-2 pr-4">Prix unitaire</th>
                <th className="py-2 pr-4">Unité</th>
                <th className="py-2 pr-4">Durée estimée</th>
                <th className="py-2 pr-4">Statut</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Esqueleto de carregamento
                Array(3).fill(0).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="border-b last:border-0 animate-pulse">
                    <td colSpan={7} className="py-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </td>
                  </tr>
                ))
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Aucun service trouvé
                  </td>
                </tr>
              ) : (
                filteredServices.map((service, idx) => (
                  <tr key={service.id || idx} className="border-b last:border-0">
                    <td className="py-2 pr-4">
                      <div className="font-semibold text-gray-900">{service.nom}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{service.description}</div>
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategorieClass(service.categorie)}`}>{service.categorie}</span>
                    </td>
                    <td className="py-2 pr-4 font-semibold">{service.prix}</td>
                    <td className="py-2 pr-4">{service.unite}</td>
                    <td className="py-2 pr-4">{service.duree}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${service.statut === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {service.statut}
                      </span>
                    </td>
                    <td className="py-2 flex gap-2">
                      <button className="text-gray-400 hover:text-gray-700" title="Voir">
                        <span className="material-icons">visibility</span>
                      </button>
                      <button className="text-gray-400 hover:text-gray-700" title="Éditer">
                        <span className="material-icons">edit</span>
                      </button>
                      <button className="text-gray-400 hover:text-red-600" title="Supprimer">
                        <span className="material-icons">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage; 