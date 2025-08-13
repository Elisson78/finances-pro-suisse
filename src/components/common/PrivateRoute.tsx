import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string; // Papel exigido para acessar a rota (opcional)
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // Verificar se estamos na rota de admin
  const isAdminRoute = location.pathname.startsWith('/dashboard-admin');

  // Mostrar um spinner enquanto verifica a autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  // Redirecionar para login se não estiver autenticado
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Verificar se o usuário é administrador para rotas de admin
  if (isAdminRoute) {
    console.log('Verificando permissão para rota de admin:', user);
    console.log('Metadados do usuário:', user.user_metadata);
    console.log('Papel do usuário:', user.user_metadata?.role);
    
    if (user.user_metadata?.role !== 'admin') {
      console.log('Usuário não é administrador, redirecionando para dashboard padrão');
      return <Navigate to="/dashboard" replace />;
    } else {
      console.log('Usuário é administrador, permitindo acesso');
    }
  }
  
  // Se estiver autenticado e tiver as permissões corretas, renderizar o conteúdo protegido
  return <>{children}</>;
};

export default PrivateRoute;