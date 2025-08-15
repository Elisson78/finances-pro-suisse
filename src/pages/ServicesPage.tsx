import React, { useState, useEffect } from 'react';
import { Service } from '../types/global';
import apiService from '../services/api.service';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar serviços
  useEffect(() => {
    async function fetchServices() {
      try {
        const data = await apiService.getServices();
        setServices(data);
      } catch (err) {
        console.error('Erro ao buscar serviços:', err);
        setError('Erro ao carregar serviços');
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Carregando serviços...</div>
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Serviços</h1>
      
      {services.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum serviço encontrado</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.id} className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              
              <div className="flex justify-between items-end">
                <div>
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    {service.category}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">CHF {service.price.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}