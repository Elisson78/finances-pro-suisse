import React, { useState, useEffect } from 'react';
import { Service } from '../types/global';
import apiService from '../services/api.service';

interface NewServiceData {
  name: string;
  description: string;
  price: number;
  category: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  const [newService, setNewService] = useState<NewServiceData>({
    name: '',
    description: '',
    price: 0,
    category: 'service'
  });

  // Données d'exemple basées sur des services typiques suisses
  const sampleServices: Service[] = [
    {
      id: '1',
      name: 'Conseil Technique',
      description: 'Conseil spécialisé en technologie de l\'information et développement de logiciels.',
      price: 120.00,
      category: 'Conseil',
      user_id: 'user_1',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Audit Financier',
      description: 'Audit complet des états financiers et des processus comptables.',
      price: 2500.00,
      category: 'Comptabilité',
      user_id: 'user_1',
      created_at: '2024-01-20T14:30:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    },
    {
      id: '3',
      name: 'Conseil Juridique',
      description: 'Conseil juridique d\'entreprise et contrats commerciaux.',
      price: 180.00,
      category: 'Juridique',
      user_id: 'user_1',
      created_at: '2024-02-01T09:15:00Z',
      updated_at: '2024-02-01T09:15:00Z'
    },
    {
      id: '4',
      name: 'Développement Web',
      description: 'Développement de sites web et d\'applications web personnalisées.',
      price: 85.00,
      category: 'Technologie',
      user_id: 'user_1',
      created_at: '2024-02-10T16:45:00Z',
      updated_at: '2024-02-10T16:45:00Z'
    },
    {
      id: '5',
      name: 'Marketing Digital',
      description: 'Stratégies de marketing digital, SEO et gestion des réseaux sociaux.',
      price: 95.00,
      category: 'Marketing',
      user_id: 'user_1',
      created_at: '2024-02-15T11:20:00Z',
      updated_at: '2024-02-15T11:20:00Z'
    }
  ];

  // Buscar serviços
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      console.log('🔍 Services - Iniciando busca de serviços...');
      setLoading(true);
      
      // Tentar buscar da API primeiro
      try {
        const result = await apiService.getServices();
        console.log('🔍 Services - Dados da API:', result);
        
        if (result && result.length > 0) {
          setServices(result);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.log('🔍 Services - API não disponível, usando dados de exemplo:', apiError);
      }
      
      // Se API não funcionar, usar dados de exemplo
      console.log('🔍 Services - Usando dados de exemplo para desenvolvimento');
      setServices(sampleServices);
      
    } catch (err) {
      console.error('❌ Services - Erro ao buscar serviços:', err);
      setError('Erro ao carregar serviços. Usando dados de exemplo para desenvolvimento.');
      setServices(sampleServices);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar serviços baseado na busca
  const filteredServices = services.filter(service => {
    const searchLower = searchTerm.toLowerCase();
    return (
      service.name.toLowerCase().includes(searchLower) ||
      service.description?.toLowerCase().includes(searchLower) ||
      service.category?.toLowerCase().includes(searchLower)
    );
  });

  // Calcular estatísticas
  const totalServices = services.length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newThisMonth = services.filter(s => {
    const created = new Date(s.created_at);
    return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
  }).length;

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      console.log('🔍 Services - Iniciando criação/edição de serviço...');
      
      if (isEditing && editingService) {
        // Atualizar serviço existente
        try {
          const updatedService = await apiService.updateService(editingService.id, {
            ...newService
          });
          console.log('🔍 Services - Serviço atualizado via API:', updatedService);
          setServices(prev => prev.map(s => s.id === editingService.id ? updatedService : s));
        } catch (apiError) {
          console.log('🔍 Services - API não disponível, atualizando localmente:', apiError);
          
          // Atualizar localmente se API não funcionar
          const updatedService: Service = {
            ...editingService,
            ...newService,
            updated_at: new Date().toISOString()
          };
          setServices(prev => prev.map(s => s.id === editingService.id ? updatedService : s));
        }
      } else {
        // Criar novo serviço
        try {
          const createdService = await apiService.createService({
            ...newService,
            user_id: 'user_1'
          });
          console.log('🔍 Services - Serviço criado via API:', createdService);
          setServices(prev => [...prev, createdService]);
        } catch (apiError) {
          console.log('🔍 Services - API não disponível, criando localmente:', apiError);
          
          // Criar localmente se API não funcionar
          const newServiceWithId: Service = { 
            ...newService, 
            id: Date.now().toString(),
            user_id: 'user_1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setServices(prev => [...prev, newServiceWithId]);
        }
      }
      
      // Resetar formulário
      setNewService({
        name: '',
        description: '',
        price: 0,
        category: 'service'
      });
      
      setShowModal(false);
      setIsEditing(false);
      setEditingService(null);
      
    } catch (err) {
      console.error('❌ Services - Erro ao salvar serviço:', err);
      setError('Erro ao salvar serviço. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setNewService({
      name: service.name,
      description: service.description || '',
      price: service.price,
      category: service.category || 'service'
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteService = async (service: Service) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le service ${service.name} ?`)) {
      return;
    }
    
    try {
      console.log('🔍 Services - Deletando serviço:', service.name);
      
      try {
        await apiService.deleteService(service.id);
        console.log('🔍 Services - Serviço deletado via API');
      } catch (apiError) {
        console.log('🔍 Services - API não disponível, deletando localmente:', apiError);
      }
      
      // Remover da lista localmente (funciona tanto para API quanto local)
      setServices(prev => prev.filter(s => s.id !== service.id));
      
    } catch (error) {
      console.error('❌ Services - Erro ao deletar serviço:', error);
      setError('Erro ao deletar serviço');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Chargement des services...</div>
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des services</h1>
          <p className="text-gray-600 mt-2">Gérez vos services proposés</p>
        </div>
        <button
          onClick={() => {
            setEditingService(null);
            setIsEditing(false);
            setNewService({
              name: '',
              description: '',
              price: 0,
              category: 'service'
            });
            setShowModal(true);
          }}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium"
        >
          <span className="material-icons">add</span>
          + Nouveau service
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50">
              <span className="material-icons text-blue-600">work</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total services</p>
              <p className="text-2xl font-bold text-gray-900">{totalServices}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-50">
              <span className="material-icons text-green-600">category</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Catégories</p>
              <p className="text-2xl font-bold text-gray-900">
                {Array.from(new Set(services.map(s => s.category))).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-50">
              <span className="material-icons text-purple-600">new_releases</span>
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
            placeholder="Rechercher par nom, description ou catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de serviços */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Tous les services ({filteredServices.length})
          </h2>
        </div>
        
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="material-icons text-4xl">work_outline</span>
            </div>
            <p className="text-gray-500">Aucun service trouvé</p>
            <button 
              onClick={() => {
                setEditingService(null);
                setIsEditing(false);
                setNewService({
                  name: '',
                  description: '',
                  price: 0,
                  category: 'service'
                });
                setShowModal(true);
              }}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Créer votre premier service
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{service.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {service.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {service.category || 'service'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      CHF {service.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditService(service)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded"
                          title="Modifier"
                        >
                          <span className="material-icons text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteService(service)}
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

      {/* Modal de Novo/Editar Serviço */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isEditing ? 'Modifier le service' : 'Nouveau service'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {isEditing ? 'Modifiez les informations du service.' : 'Ajoutez un nouveau service à votre liste.'}
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

            <form onSubmit={handleCreateService} className="p-6 space-y-6">
              {/* Nome do Serviço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du service *
                </label>
                <input
                  type="text"
                  required
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ex: Conseil technique"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Décrivez le service proposé..."
                />
              </div>

              {/* Categoria e Preço */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ex: Conseil"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (CHF) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newService.price || ''}
                    onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
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
                      {isEditing ? 'Enregistrer les modifications' : 'Créer le service'}
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