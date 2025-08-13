import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

const HomePage: React.FC = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-block px-4 py-2 bg-red-100 text-red-600 rounded-full text-sm font-medium mb-8 border border-red-200">
            🇨🇭 Solution 100% Suisse
          </div>
          
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            La comptabilité suisse<br />
            <span className="text-red-600">simplifiée</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            FinancesPro est la solution comptable tout-en-un conçue spécialement pour les PME suisses.
            Facturation, QR-Bill, TVA automatique et conformité garantie.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link to="/register" className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">
              Commencer gratuitement <span className="ml-1">→</span>
            </Link>
            <Link to="/demo" className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 hover:border-red-600 hover:text-red-600">
              Voir la démo
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Plans adaptés à vos besoins</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choisissez le plan qui convient à votre entreprise, sans frais cachés.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Gratuit</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-800">0 CHF</span>
                  <span className="text-gray-500 ml-2">/mois</span>
                </div>
                <p className="text-gray-600 mb-6">
                  Parfait pour démarrer et tester la plateforme.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    5 factures par mois
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    QR-Bill intégré
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    2 clients maximum
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Rapports de base
                  </li>
                </ul>
                <Link to="/register" className="block w-full text-center py-3 px-4 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition">
                  Commencer gratuitement
                </Link>
              </div>
            </div>

            {/* Basic Plan */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-red-100 transition-all hover:shadow-lg relative transform md:scale-105">
              <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1">
                POPULAIRE
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">PME</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-800">15 CHF</span>
                  <span className="text-gray-500 ml-2">/mois</span>
                </div>
                <p className="text-gray-600 mb-6">
                  Idéal pour les petites entreprises en croissance.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Factures illimitées
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    QR-Bill personnalisé
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    20 clients maximum
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    TVA automatique
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Rapports avancés
                  </li>
                </ul>
                <Link to="/register" className="block w-full text-center py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition">
                  S'abonner maintenant
                </Link>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Entreprise</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-800">35 CHF</span>
                  <span className="text-gray-500 ml-2">/mois</span>
                </div>
                <p className="text-gray-600 mb-6">
                  Pour les entreprises avec des besoins avancés.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Factures illimitées
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    QR-Bill Premium
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Clients illimités
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    TVA automatique
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Rapports premium
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Support prioritaire
                  </li>
                </ul>
                <Link to="/register" className="block w-full text-center py-3 px-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition">
                  Démarrer votre essai
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Fonctionnalités conçues pour les PME suisses</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des outils qui simplifient votre quotidien et vous font gagner du temps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Facturation QR</h3>
              <p className="text-gray-600">
                Créez et envoyez des factures avec QR-Bill conformes aux normes suisses en quelques clics.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">TVA automatique</h3>
              <p className="text-gray-600">
                Calcul automatique de la TVA à 7.7% et préparation des déclarations conformes aux exigences suisses.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Gestion des clients</h3>
              <p className="text-gray-600">
                Organisez votre base de clients, avec historique complet des factures et communications.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Ce que disent nos clients</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez pourquoi les PME suisses choisissent FinancesPro pour leur comptabilité.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                    ML
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Marie Leclerc</h4>
                  <p className="text-gray-500 text-sm">Graphiste indépendante, Lausanne</p>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 italic">
                "Avant FinancesPro, je passais des heures sur ma facturation. Maintenant, je peux me concentrer sur ma passion. Le QR-Bill intégré est un vrai plus pour mes clients."
              </p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                    TD
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Thomas Dubois</h4>
                  <p className="text-gray-500 text-sm">Menuiserie Dubois Sàrl, Fribourg</p>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 italic">
                "Le calcul automatique de la TVA m'a fait gagner un temps précieux. L'interface est intuitive et mon comptable est ravi de la qualité des documents générés."
              </p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                    SB
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Sophie Blanc</h4>
                  <p className="text-gray-500 text-sm">Restaurant Le Terroir, Genève</p>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 italic">
                "Avec FinancesPro, je peux gérer mes fournisseurs, mes factures et ma comptabilité en un seul endroit. Un outil indispensable pour mon restaurant."
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-red-600 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Prêt à simplifier votre comptabilité?</h2>
            <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de PME suisses qui font confiance à FinancesPro pour leur gestion financière.
            </p>
            <Link to="/register" className="inline-flex items-center px-8 py-4 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition">
              Essayer gratuitement pendant 14 jours <span className="ml-2">→</span>
            </Link>
            <p className="text-red-200 mt-4 text-sm">Aucune carte de crédit requise. Annulez à tout moment.</p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;