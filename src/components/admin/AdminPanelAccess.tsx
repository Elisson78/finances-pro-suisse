import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Settings } from 'lucide-react';

interface AdminPanelAccessProps {
  userType?: string;
  className?: string;
}

const AdminPanelAccess: React.FC<AdminPanelAccessProps> = ({ userType, className = '' }) => {
  // Verificar se o usuário é administrador DA PLATAFORMA (não da empresa)
  const isPlatformAdmin = userType === 'administrateur';

  if (!isPlatformAdmin) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-4 text-white ${className}`}>
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6" />
        <div className="flex-1">
          <h3 className="font-semibold">Painel Administrativo</h3>
          <p className="text-sm text-purple-100">
            Acesse ferramentas avançadas de administração
          </p>
        </div>
        <Link
          to="/dashboard-admin"
          className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Acessar
        </Link>
      </div>
    </div>
  );
};

export default AdminPanelAccess;