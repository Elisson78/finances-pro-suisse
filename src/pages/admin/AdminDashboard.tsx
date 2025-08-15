import React, { useState, useEffect } from 'react';
import { Users, Building, CreditCard, TrendingUp, Activity, DollarSign } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalCompanies: number;
  totalInvoices: number;
  totalRevenue: number;
  activeUsers: number;
  pendingInvoices: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCompanies: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingInvoices: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Aqui faremos chamadas para as APIs de estatísticas
        // Por enquanto, dados simulados
        setStats({
          totalUsers: 127,
          totalCompanies: 89,
          totalInvoices: 1543,
          totalRevenue: 245800,
          activeUsers: 94,
          pendingInvoices: 23
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, change, color }: any) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% vs mês anterior
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <div className="text-sm text-gray-500">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total de Usuários"
          value={stats.totalUsers}
          icon={Users}
          change={12}
          color="bg-blue-500"
        />
        <StatCard
          title="Empresas Ativas"
          value={stats.totalCompanies}
          icon={Building}
          change={8}
          color="bg-green-500"
        />
        <StatCard
          title="Faturas Totais"
          value={stats.totalInvoices.toLocaleString()}
          icon={CreditCard}
          change={15}
          color="bg-purple-500"
        />
        <StatCard
          title="Receita Total"
          value={`CHF ${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          change={22}
          color="bg-green-600"
        />
        <StatCard
          title="Usuários Ativos"
          value={stats.activeUsers}
          icon={Activity}
          color="bg-blue-600"
        />
        <StatCard
          title="Faturas Pendentes"
          value={stats.pendingInvoices}
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>

      {/* Gráficos e tabelas resumidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuários Recentes */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usuários Recentes</h3>
          <div className="space-y-3">
            {[
              { name: 'João Silva', email: 'joao@example.com', date: '15/08/2025' },
              { name: 'Maria Santos', email: 'maria@example.com', date: '14/08/2025' },
              { name: 'Carlos Oliveira', email: 'carlos@example.com', date: '13/08/2025' },
            ].map((user, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <span className="text-sm text-gray-400">{user.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Atividade do Sistema */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade do Sistema</h3>
          <div className="space-y-3">
            {[
              { action: 'Nova fatura criada', user: 'João Silva', time: '2 min atrás' },
              { action: 'Usuário registrado', user: 'Maria Santos', time: '15 min atrás' },
              { action: 'Pagamento recebido', user: 'Carlos Oliveira', time: '32 min atrás' },
              { action: 'Fatura enviada', user: 'Ana Costa', time: '1h atrás' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.user}</p>
                </div>
                <span className="text-sm text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas do Sistema */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas do Sistema</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                23 faturas pendentes precisam de atenção
              </p>
              <p className="text-sm text-yellow-700">
                Algumas faturas estão próximas do vencimento
              </p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                Backup automático realizado com sucesso
              </p>
              <p className="text-sm text-blue-700">
                Último backup: hoje às 03:00
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;