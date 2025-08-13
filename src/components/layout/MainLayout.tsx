import React from 'react';
import { Link } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
                F
              </div>
              <div>
                <div className="font-bold text-gray-800">FinancesPro</div>
                <div className="text-xs text-gray-500">Suisse</div>
              </div>
            </Link>
            
            <nav>
              <ul className="flex gap-6 items-center">
                <li>
                  <Link to="/" className="text-gray-600 hover:text-red-600 font-medium">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="px-4 py-2 border border-red-600 text-red-600 font-medium rounded-lg hover:bg-red-600 hover:text-white transition-colors">
                    Se connecter
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors">
                    Essai gratuit
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="border-t border-gray-700 pt-6 flex justify-between items-center">
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} FinancesPro Suisse. Tous droits réservés.
            </div>
            <div className="text-sm text-gray-400 font-medium">
              🇨🇭 Fait en Suisse
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;