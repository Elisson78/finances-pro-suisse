import React from 'react';
import StatsCard from './StatsCard';
import RecentInvoices from './RecentInvoices';
import RecentClients from './RecentClients';
import { Invoice } from './RecentInvoices';

const DashboardHome: React.FC = () => {
  // Dados de exemplo para demonstração
  const stats = [
    {
      title: 'Chiffre d\'affaires',
      value: '15,240 CHF',
      change: '+12.5%',
      isPositive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Factures en attente',
      value: '8',
      change: '+2',
      isPositive: false,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: 'Clients actifs',
      value: '24',
      change: '+3',
      isPositive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: 'Taux de conversion',
      value: '68%',
      change: '+5.2%',
      isPositive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  // Dados de exemplo para as faturas recentes
  const recentInvoices: Invoice[] = [
    {
      id: 'INV-001',
      client: 'TechnoServ SA',
      date: '15/07/2025',
      amount: '2,450 CHF',
      status: 'paid' as const
    },
    {
      id: 'INV-002',
      client: 'Alpine Consulting',
      date: '12/07/2025',
      amount: '1,850 CHF',
      status: 'pending' as const
    },
    {
      id: 'INV-003',
      client: 'Swiss Innovation AG',
      date: '10/07/2025',
      amount: '3,200 CHF',
      status: 'paid' as const
    },
    {
      id: 'INV-004',
      client: 'Montreux Solutions',
      date: '08/07/2025',
      amount: '980 CHF',
      status: 'overdue' as const
    },
    {
      id: 'INV-005',
      client: 'Geneva Tech',
      date: '05/07/2025',
      amount: '1,500 CHF',
      status: 'paid' as const
    }
  ];

  // Dados de exemplo para os clientes recentes
  const recentClients = [
    {
      id: 'C001',
      name: 'TechnoServ SA',
      email: 'contact@technoserv.ch',
      location: 'Genève',
      invoices: 12,
      joinedDate: '10/01/2025'
    },
    {
      id: 'C002',
      name: 'Alpine Consulting',
      email: 'info@alpine-consulting.ch',
      location: 'Lausanne',
      invoices: 8,
      joinedDate: '15/02/2025'
    },
    {
      id: 'C003',
      name: 'Swiss Innovation AG',
      email: 'office@swiss-innovation.ch',
      location: 'Zürich',
      invoices: 15,
      joinedDate: '03/03/2025'
    },
    {
      id: 'C004',
      name: 'Montreux Solutions',
      email: 'contact@montreux-solutions.ch',
      location: 'Montreux',
      invoices: 5,
      joinedDate: '22/04/2025'
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
        <p className="text-gray-600">Bienvenue sur votre espace FinancesPro Suisse</p>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard 
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            isPositive={stat.isPositive}
            icon={stat.icon}
          />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices Section */}
        <div className="lg:col-span-2">
          <RecentInvoices invoices={recentInvoices} />
        </div>
        
        {/* Recent Clients Section */}
        <div>
          <RecentClients clients={recentClients} />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;