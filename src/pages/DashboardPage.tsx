import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const facturesRecentes = [
  {
    numero: '2024–001',
    client: 'Client non défini',
    date: '15 janv. 2024',
    montant: '646.20 CHF',
    statut: 'payée',
  },
  {
    numero: '2024–002',
    client: 'Client non défini',
    date: '22 janv. 2024',
    montant: '1830.90 CHF',
    statut: 'envoyée',
  },
  {
    numero: '2024–003',
    client: 'Client non défini',
    date: '28 janv. 2024',
    montant: '1534.73 CHF',
    statut: 'brouillon',
  },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Usar o contexto de autenticação para obter informações do usuário
  const { user } = useAuth();
  const location = useLocation();
  
  // Verificar se estamos no dashboard de administração
  const isAdminDashboard = location.pathname.startsWith('/dashboard-admin');
  
  // Nome e empresa do usuário
  const fullName = user?.user_metadata?.full_name || 'Jean Perrin SA';
  const companyName = user?.user_metadata?.company_name || 'Genève, GE';
  const userRole = user?.user_metadata?.role || 'entreprise';
  
  // Iniciais para o avatar
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white border-r w-64 ${isSidebarOpen ? 'block' : 'hidden'} md:block flex-shrink-0 transition-all duration-300`}>
        <div className="p-4 flex items-center gap-2">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            F
          </div>
          <div>
            <div className="font-bold text-gray-900">FinancesPro</div>
            <div className="text-xs text-red-500">Suisse</div>
          </div>
        </div>
        <nav className="mt-8">
          <div className="px-4 mb-3 text-xs font-semibold text-gray-400 uppercase">NAVIGATION</div>
          
          {/* Menu pour entreprises (normal) */}
          {!isAdminDashboard && (
            <>
              <Link to="/dashboard" className="flex items-center px-4 py-2 text-gray-900 font-medium hover:bg-red-50 rounded-lg mb-1">
                <span className="material-icons mr-3">dashboard</span>Tableau de bord
              </Link>
              <Link to="/dashboard/factures" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <span className="material-icons mr-3">receipt_long</span>Factures
              </Link>
              <Link to="/dashboard/services" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <span className="material-icons mr-3">work_outline</span>Services
              </Link>
              <Link to="/dashboard/clients" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <span className="material-icons mr-3">groups</span>Clients
              </Link>
              <Link to="/dashboard/reports" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <span className="material-icons mr-3">schedule</span>Rapports
              </Link>
            </>
          )}
          
          {/* Menu pour administrateurs */}
          {isAdminDashboard && (
            <>
              <Link to="/dashboard-admin" className="flex items-center px-4 py-2 text-gray-900 font-medium hover:bg-red-50 rounded-lg mb-1">
                <span className="material-icons mr-3">dashboard</span>Tableau de bord
              </Link>
              
              <div className="px-4 mt-6 mb-3 text-xs font-semibold text-gray-400 uppercase">GESTION</div>
              
              <Link to="/dashboard-admin/utilisateurs" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <span className="material-icons mr-3">person</span>Utilisateurs
              </Link>
              
              <Link to="/dashboard-admin/entreprises" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <span className="material-icons mr-3">business</span>Entreprises
              </Link>
              
              <Link to="/dashboard-admin/plans" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <span className="material-icons mr-3">card_membership</span>Plans et Abonnements
              </Link>
              
              <Link to="/dashboard-admin/facturation" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <span className="material-icons mr-3">payments</span>Facturation
              </Link>
              
              <div className="px-4 mt-6 mb-3 text-xs font-semibold text-gray-400 uppercase">SYSTÈME</div>
              
              <Link to="/dashboard-admin/configuration" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <span className="material-icons mr-3">settings</span>Configuration
              </Link>
              
              <Link to="/dashboard-admin/support" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <span className="material-icons mr-3">support_agent</span>Support
              </Link>
              
              <Link to="/dashboard-admin/rapports" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <span className="material-icons mr-3">bar_chart</span>Rapports et Analyses
              </Link>
              
              <Link to="/dashboard-admin/audit" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mb-1">
                <span className="material-icons mr-3">history</span>Audits et Logs
              </Link>
            </>
          )}
        </nav>
        {/* Plan actuel - n'afficher que pour les entreprises */}
        {!isAdminDashboard && (
          <div className="mt-8 mx-4 bg-yellow-100 rounded-lg p-4 flex flex-col items-start">
            <span className="bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded mb-2">Gratuit</span>
            <span className="text-sm font-semibold text-gray-800 mb-1">3/5 factures</span>
            <span className="text-xs text-gray-600 mb-3">ce mois-ci</span>
            <button className="w-full bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition mb-2">Passer à PME</button>
          </div>
        )}
        
        {/* Informations du système - afficher uniquement pour les administrateurs */}
        {isAdminDashboard && (
          <div className="mt-8 mx-4 bg-blue-50 rounded-lg p-4 flex flex-col items-start">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mb-2">Administrateur</span>
            <span className="text-sm font-semibold text-gray-800 mb-1">Version: 0.1.0</span>
            <span className="text-xs text-gray-600 mb-3">Dernière mise à jour: 23/07/2025</span>
          </div>
        )}
        {/* User */}
        <div className="absolute bottom-0 left-0 w-64 p-4 border-t bg-white flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">{initials}</div>
          <div>
            <div className="text-sm font-bold">{fullName}</div>
            <div className="text-xs text-gray-500">{companyName}</div>
            {isAdminDashboard && (
              <div className="text-xs text-blue-600 font-semibold">Administrateur</div>
            )}
          </div>
          <button onClick={handleLogout} className="ml-auto text-gray-400 hover:text-red-600">
            <span className="material-icons">logout</span>
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-gray-600 focus:outline-none">
              <span className="material-icons">menu</span>
            </button>
            <div className="flex items-center ml-auto">
              <div className="relative">
                <button className="flex items-center text-gray-700 focus:outline-none">
                  <div className="mr-2 text-right hidden sm:block">
                    <div className="text-sm font-medium">{fullName}</div>
                    <div className="text-xs text-gray-500">{companyName}</div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
                    {initials || "U"}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>
        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;