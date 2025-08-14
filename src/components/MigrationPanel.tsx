import React, { useState, useEffect } from 'react';
import { migrationService, MigrationResult } from '../services/migration.service';

const MigrationPanel: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationData, setMigrationData] = useState<{
    hasUsers: boolean;
    hasClients: boolean;
    hasFactures: boolean;
    hasServices: boolean;
    totalRecords: number;
  } | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Verificar dados disponíveis para migração
  const checkDataForMigration = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      const data = await migrationService.checkDataForMigration();
      setMigrationData(data);
      console.log('📊 Dados para migração:', data);
    } catch (err) {
      setError(`Erro ao verificar dados: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      console.error('❌ Erro ao verificar dados:', err);
    } finally {
      setIsChecking(false);
    }
  };

  // Executar migração completa
  const executeMigration = async () => {
    setIsMigrating(true);
    setError(null);
    setMigrationResult(null);
    
    try {
      const result = await migrationService.migrateAllData();
      setMigrationResult(result);
      
      if (result.success) {
        console.log('✅ Migração concluída com sucesso:', result);
        // Recarregar dados após migração
        setTimeout(() => {
          checkDataForMigration();
        }, 1000);
      } else {
        setError(result.message);
        console.error('❌ Erro na migração:', result);
      }
    } catch (err) {
      const errorMsg = `Erro na migração: ${err instanceof Error ? err.message : 'Erro desconhecido'}`;
      setError(errorMsg);
      console.error('❌ Erro na migração:', err);
    } finally {
      setIsMigrating(false);
    }
  };

  // Verificar dados automaticamente ao montar o componente
  useEffect(() => {
    checkDataForMigration();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔄 Migração de Dados
        </h2>
        <p className="text-gray-600">
          Transfira todos os dados do Supabase para o banco SQLite local
        </p>
      </div>

      {/* Status dos dados */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            📊 Dados Disponíveis para Migração
          </h3>
          <button
            onClick={checkDataForMigration}
            disabled={isChecking}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? '🔍 Verificando...' : '🔄 Verificar Novamente'}
          </button>
        </div>

        {migrationData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${migrationData.hasUsers ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="text-sm font-medium text-gray-600">👥 Usuários</div>
              <div className={`text-2xl font-bold ${migrationData.hasUsers ? 'text-green-600' : 'text-gray-400'}`}>
                {migrationData.hasUsers ? '✓' : '✗'}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border ${migrationData.hasClients ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="text-sm font-medium text-gray-600">🏢 Clientes</div>
              <div className={`text-2xl font-bold ${migrationData.hasClients ? 'text-green-600' : 'text-gray-400'}`}>
                {migrationData.hasClients ? '✓' : '✗'}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border ${migrationData.hasFactures ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="text-sm font-medium text-gray-600">📄 Faturas</div>
              <div className={`text-2xl font-bold ${migrationData.hasFactures ? 'text-green-600' : 'text-gray-400'}`}>
                {migrationData.hasFactures ? '✓' : '✗'}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border ${migrationData.hasServices ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="text-sm font-medium text-gray-600">🔧 Serviços</div>
              <div className={`text-2xl font-bold ${migrationData.hasServices ? 'text-green-600' : 'text-gray-400'}`}>
                {migrationData.hasServices ? '✓' : '✗'}
              </div>
            </div>
          </div>
        )}

        {migrationData && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Total de registros encontrados:</strong> {migrationData.totalRecords}
            </div>
            {migrationData.totalRecords === 0 && (
              <div className="text-sm text-blue-600 mt-1">
                ℹ️ Nenhum dado encontrado para migrar. O banco SQLite já está configurado com dados de exemplo.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botão de migração */}
      {migrationData && migrationData.totalRecords > 0 && (
        <div className="mb-6">
          <button
            onClick={executeMigration}
            disabled={isMigrating}
            className="w-full px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isMigrating ? '🔄 Migrando Dados...' : '🚀 Iniciar Migração Completa'}
          </button>
          <p className="text-sm text-gray-500 mt-2 text-center">
            ⚠️ Esta operação transferirá todos os dados do Supabase para o SQLite local
          </p>
        </div>
      )}

      {/* Resultado da migração */}
      {migrationResult && (
        <div className={`p-4 rounded-lg border ${
          migrationResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <h4 className={`font-semibold mb-2 ${
            migrationResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {migrationResult.success ? '✅ Migração Concluída' : '❌ Erro na Migração'}
          </h4>
          
          <p className={`text-sm ${
            migrationResult.success ? 'text-green-700' : 'text-red-700'
          }`}>
            {migrationResult.message}
          </p>

          {migrationResult.success && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
              {migrationResult.usersMigrated !== undefined && (
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{migrationResult.usersMigrated}</div>
                  <div className="text-xs text-green-600">Usuários</div>
                </div>
              )}
              {migrationResult.clientsMigrated !== undefined && (
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{migrationResult.clientsMigrated}</div>
                  <div className="text-xs text-green-600">Clientes</div>
                </div>
              )}
              {migrationResult.facturesMigrated !== undefined && (
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{migrationResult.facturesMigrated}</div>
                  <div className="text-xs text-green-600">Faturas</div>
                </div>
              )}
              {migrationResult.servicesMigrated !== undefined && (
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{migrationResult.servicesMigrated}</div>
                  <div className="text-xs text-green-600">Serviços</div>
                </div>
              )}
            </div>
          )}

          {migrationResult.errors && migrationResult.errors.length > 0 && (
            <div className="mt-3">
              <h5 className="font-medium text-red-800 mb-2">⚠️ Erros durante a migração:</h5>
              <ul className="text-sm text-red-700 space-y-1">
                {migrationResult.errors.map((error, index) => (
                  <li key={index} className="pl-2 border-l-2 border-red-300">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Mensagens de erro */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800 font-medium">❌ Erro:</div>
          <div className="text-red-700 text-sm">{error}</div>
        </div>
      )}

      {/* Informações sobre a migração */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">ℹ️ Sobre a Migração</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Todos os dados serão transferidos do Supabase para o SQLite local</li>
          <li>• O banco SQLite será criado na pasta <code className="bg-gray-200 px-1 rounded">tmp/database/</code></li>
          <li>• Após a migração, você pode remover completamente o Supabase</li>
          <li>• Os dados ficarão persistentes localmente</li>
          <li>• A aplicação funcionará offline após a migração</li>
        </ul>
      </div>
    </div>
  );
};

export default MigrationPanel;
