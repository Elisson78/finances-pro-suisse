import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
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
  );
};

export default Footer;