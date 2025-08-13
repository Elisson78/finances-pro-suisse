import React from 'react';
import { Link } from 'react-router-dom';

interface Client {
  id: string;
  name: string;
  email: string;
  location: string;
  invoices: number;
  joinedDate: string;
}

interface RecentClientsProps {
  clients: Client[];
}

const RecentClients: React.FC<RecentClientsProps> = ({ clients }) => {
  return (
    <div className="bg-white rounded-lg shadow h-full">
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800">Clients récents</h3>
          <Link to="/dashboard/clients" className="text-sm text-primary hover:underline font-medium">
            Voir tous
          </Link>
        </div>
      </div>
      
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {clients.map((client) => (
            <li key={client.id} className="hover:bg-gray-50">
              <Link to={`/dashboard/clients/${client.id}`} className="block p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {client.invoices} factures
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <div>{client.location}</div>
                  <div>Client depuis {client.joinedDate}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <Link 
          to="/dashboard/clients/new" 
          className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none"
        >
          Ajouter un client
        </Link>
      </div>
    </div>
  );
};

export default RecentClients;