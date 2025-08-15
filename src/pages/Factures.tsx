import React, { useState, useEffect } from 'react';
import { PDFService } from '../services/pdf.service';
import apiService, { Facture } from '../services/api.service';

export default function Factures() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar faturas
  useEffect(() => {
    async function fetchFactures() {
      try {
        const data = await apiService.getFactures();
        setFactures(data);
      } catch (err) {
        console.error('Erro ao buscar faturas:', err);
        setError('Erro ao carregar faturas');
      } finally {
        setLoading(false);
      }
    }
    fetchFactures();
  }, []);

  // Gerar PDF
  const handleGeneratePDF = async (facture: Facture) => {
    try {
      await PDFService.generateInvoicePDF({
        numero_facture: facture.numero_facture,
        client_name: facture.client_name,
        date: facture.date,
        echeance: facture.echeance,
        articles: facture.articles,
        subtotal: facture.subtotal,
        tva: facture.tva,
        total: facture.total,
        statut: facture.status
      });
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    }
  };

  if (loading) {
  return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Carregando faturas...</div>
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Faturas</h1>
      
      {factures.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma fatura encontrada</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {factures.map((facture) => (
            <div key={facture.id} className="bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{facture.numero_facture}</h3>
                  <p className="text-gray-600">{facture.client_name}</p>
                  <p className="text-sm text-gray-500">
                    Data: {new Date(facture.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">CHF {facture.total.toFixed(2)}</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    facture.status === 'paid' ? 'bg-green-100 text-green-800' :
                    facture.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {facture.status === 'paid' ? 'Pago' :
                     facture.status === 'overdue' ? 'Vencido' : 'Pendente'}
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Artigos:</h4>
                <ul className="space-y-1">
                  {facture.articles.map((article, index) => (
                    <li key={index} className="flex justify-between text-sm">
                      <span>{article.description} (x{article.qty})</span>
                      <span>CHF {(article.price * article.qty).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                  </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => handleGeneratePDF(facture)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Gerar PDF
                          </button>
                      </div>
                    </div>
                  ))}
        </div>
      )}
    </div>
  );
}