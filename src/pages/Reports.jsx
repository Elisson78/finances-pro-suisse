import React, { useState } from "react";

const mockReports = [
  {
    id: 1,
    mois: "Janv. 2024",
    chiffreAffaires: "2 500 CHF",
    factures: 8,
    payees: 6,
    enAttente: 2,
    enRetard: 0
  },
  {
    id: 2,
    mois: "Févr. 2024",
    chiffreAffaires: "3 200 CHF",
    factures: 10,
    payees: 7,
    enAttente: 2,
    enRetard: 1
  },
  {
    id: 3,
    mois: "Mars 2024",
    chiffreAffaires: "2 800 CHF",
    factures: 9,
    payees: 8,
    enAttente: 1,
    enRetard: 0
  }
];

export default function Reports() {
  const [period, setPeriod] = useState("mois");

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Rapports & Analytics</h1>
              <p className="text-gray-600">Analyse de votre performance financière</p>
            </div>
              <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md focus:border-red-300 focus:ring-red-200 bg-white"
              >
          <option value="mois">Ce mois</option>
          <option value="trimestre">Ce trimestre</option>
          <option value="annee">Cette année</option>
              </select>
            </div>
      {/* Cards de KPIs mockados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-2">
          <div className="text-xs text-gray-500">Chiffre d'affaires</div>
          <div className="text-2xl font-bold text-gray-900">8 500 CHF</div>
                  </div>
        <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-2">
          <div className="text-xs text-gray-500">Factures payées</div>
          <div className="text-2xl font-bold text-gray-900">21</div>
                  </div>
        <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-2">
          <div className="text-xs text-gray-500">En attente</div>
          <div className="text-2xl font-bold text-gray-900">5</div>
                </div>
        <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-2">
          <div className="text-xs text-gray-500">En retard</div>
          <div className="text-2xl font-bold text-gray-900">1</div>
                  </div>
                </div>
      {/* Tabela de relatórios mockados */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Synthèse par mois</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-left border-b">
                <th className="py-2 pr-4">Mois</th>
                <th className="py-2 pr-4">Chiffre d'affaires</th>
                <th className="py-2 pr-4">Factures</th>
                <th className="py-2 pr-4">Payées</th>
                <th className="py-2 pr-4">En attente</th>
                <th className="py-2 pr-4">En retard</th>
              </tr>
            </thead>
            <tbody>
              {mockReports.map(report => (
                <tr key={report.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 pr-4 font-semibold text-gray-900">{report.mois}</td>
                  <td className="py-2 pr-4">{report.chiffreAffaires}</td>
                  <td className="py-2 pr-4">{report.factures}</td>
                  <td className="py-2 pr-4">{report.payees}</td>
                  <td className="py-2 pr-4">{report.enAttente}</td>
                  <td className="py-2 pr-4">{report.enRetard}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}