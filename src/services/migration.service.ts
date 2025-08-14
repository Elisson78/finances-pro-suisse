import { supabase } from '../types/global';
import { sqliteService, User, Client, Facture, Service } from './sqlite.service';

export interface MigrationResult {
  success: boolean;
  message: string;
  usersMigrated?: number;
  clientsMigrated?: number;
  facturesMigrated?: number;
  servicesMigrated?: number;
  errors?: string[];
}

class MigrationService {
  private errors: string[] = [];

  // Migrar todos os dados
  async migrateAllData(): Promise<MigrationResult> {
    console.log('🚀 Iniciando migração completa do Supabase para SQLite...');
    
    try {
      // 1. Migrar usuários
      const usersResult = await this.migrateUsers();
      
      // 2. Migrar clientes
      const clientsResult = await this.migrateClients();
      
      // 3. Migrar faturas
      const facturesResult = await this.migrateFactures();
      
      // 4. Migrar serviços
      const servicesResult = await this.migrateServices();

      const totalMigrated = {
        users: usersResult.usersMigrated || 0,
        clients: clientsResult.clientsMigrated || 0,
        factures: facturesResult.facturesMigrated || 0,
        services: servicesResult.servicesMigrated || 0
      };

      console.log('✅ Migração concluída:', totalMigrated);
      
      return {
        success: true,
        message: `Migração concluída com sucesso! ${totalMigrated.users} usuários, ${totalMigrated.clients} clientes, ${totalMigrated.factures} faturas, ${totalMigrated.services} serviços migrados.`,
        usersMigrated: totalMigrated.users,
        clientsMigrated: totalMigrated.clients,
        facturesMigrated: totalMigrated.factures,
        servicesMigrated: totalMigrated.services,
        errors: this.errors.length > 0 ? this.errors : undefined
      };

    } catch (error) {
      console.error('❌ Erro na migração:', error);
      return {
        success: false,
        message: `Erro na migração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        errors: this.errors
      };
    }
  }

  // Migrar usuários
  private async migrateUsers(): Promise<{ usersMigrated: number }> {
    console.log('👥 Migrando usuários...');
    
    try {
      // Buscar usuários do Supabase
      const { data: users, error } = await supabase
        .from('users')
        .select('*');

      if (error) {
        console.log('⚠️ Tabela users não existe no Supabase ou erro:', error.message);
        return { usersMigrated: 0 };
      }

      if (!users || users.length === 0) {
        console.log('ℹ️ Nenhum usuário encontrado para migrar');
        return { usersMigrated: 0 };
      }

      let migratedCount = 0;
      
      for (const user of users) {
        try {
          // Verificar se usuário já existe no SQLite
          const existingUser = await sqliteService.getUserByEmail(user.email);
          
          if (!existingUser) {
            await sqliteService.createUser({
              email: user.email,
              full_name: user.full_name || 'Usuário',
              company_name: user.company_name || 'Empresa',
              role: user.role || 'entreprise'
            });
            migratedCount++;
            console.log(`✅ Usuário migrado: ${user.email}`);
          } else {
            console.log(`ℹ️ Usuário já existe: ${user.email}`);
          }
        } catch (userError) {
          const errorMsg = `Erro ao migrar usuário ${user.email}: ${userError instanceof Error ? userError.message : 'Erro desconhecido'}`;
          console.error(errorMsg);
          this.errors.push(errorMsg);
        }
      }

      console.log(`✅ ${migratedCount} usuários migrados com sucesso`);
      return { usersMigrated: migratedCount };

    } catch (error) {
      console.error('❌ Erro ao migrar usuários:', error);
      this.errors.push(`Erro ao migrar usuários: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return { usersMigrated: 0 };
    }
  }

  // Migrar clientes
  private async migrateClients(): Promise<{ clientsMigrated: number }> {
    console.log('🏢 Migrando clientes...');
    
    try {
      // Buscar clientes do Supabase
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*');

      if (error) {
        console.log('⚠️ Tabela clients não existe no Supabase ou erro:', error.message);
        return { clientsMigrated: 0 };
      }

      if (!clients || clients.length === 0) {
        console.log('ℹ️ Nenhum cliente encontrado para migrar');
        return { clientsMigrated: 0 };
      }

      let migratedCount = 0;
      
      for (const client of clients) {
        try {
          // Criar cliente no SQLite
          await sqliteService.createClient({
            company: client.company || client.name || 'Cliente',
            contact_person: client.contact_person || client.contact || '',
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || '',
            city: client.city || '',
            postal_code: client.postal_code || client.postal || '',
            country: client.country || 'Suisse',
            category: client.category || 'facture',
            user_id: client.user_id || 'default_user'
          });
          
          migratedCount++;
          console.log(`✅ Cliente migrado: ${client.company || client.name}`);
        } catch (clientError) {
          const errorMsg = `Erro ao migrar cliente ${client.company || client.name}: ${clientError instanceof Error ? clientError.message : 'Erro desconhecido'}`;
          console.error(errorMsg);
          this.errors.push(errorMsg);
        }
      }

      console.log(`✅ ${migratedCount} clientes migrados com sucesso`);
      return { clientsMigrated: migratedCount };

    } catch (error) {
      console.error('❌ Erro ao migrar clientes:', error);
      this.errors.push(`Erro ao migrar clientes: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return { clientsMigrated: 0 };
    }
  }

  // Migrar faturas
  private async migrateFactures(): Promise<{ facturesMigrated: number }> {
    console.log('📄 Migrando faturas...');
    
    try {
      // Buscar faturas do Supabase
      const { data: factures, error } = await supabase
        .from('Factures')
        .select('*');

      if (error) {
        console.log('⚠️ Tabela Factures não existe no Supabase ou erro:', error.message);
        return { facturesMigrated: 0 };
      }

      if (!factures || factures.length === 0) {
        console.log('ℹ️ Nenhuma fatura encontrada para migrar');
        return { facturesMigrated: 0 };
      }

      let migratedCount = 0;
      
      for (const facture of factures) {
        try {
          // Converter dados da fatura
          const articles = facture.articles ? JSON.parse(facture.articles) : [
            {
              description: facture.description || 'Serviço',
              qty: 1,
              price: facture.unit_price ? facture.unit_price / 100 : 0 // Converter de centavos
            }
          ];

          await sqliteService.createFacture({
            numero_facture: facture.name || facture.numero_facture || `FAT-${Date.now()}`,
            client_id: facture.client_id || 'default_client',
            client_name: facture.client_name || 'Cliente',
            date: facture.date || new Date().toISOString().split('T')[0],
            echeance: facture.echeance || new Date().toISOString().split('T')[0],
            articles: articles,
            subtotal: facture.subtotal || facture.unit_price ? facture.unit_price / 100 : 0,
            tva: facture.tva || facture.vat_rate || 0,
            total: facture.total || facture.unit_price ? facture.unit_price / 100 : 0,
            status: facture.status || 'pending',
            user_id: facture.user_id || 'default_user'
          });
          
          migratedCount++;
          console.log(`✅ Fatura migrada: ${facture.name || facture.numero_facture}`);
        } catch (factureError) {
          const errorMsg = `Erro ao migrar fatura ${facture.name || facture.numero_facture}: ${factureError instanceof Error ? factureError.message : 'Erro desconhecido'}`;
          console.error(errorMsg);
          this.errors.push(errorMsg);
        }
      }

      console.log(`✅ ${migratedCount} faturas migradas com sucesso`);
      return { facturesMigrated: migratedCount };

    } catch (error) {
      console.error('❌ Erro ao migrar faturas:', error);
      this.errors.push(`Erro ao migrar faturas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return { facturesMigrated: 0 };
    }
  }

  // Migrar serviços
  private async migrateServices(): Promise<{ servicesMigrated: number }> {
    console.log('🔧 Migrando serviços...');
    
    try {
      // Buscar serviços do Supabase
      const { data: services, error } = await supabase
        .from('services')
        .select('*');

      if (error) {
        console.log('⚠️ Tabela services não existe no Supabase ou erro:', error.message);
        return { servicesMigrated: 0 };
      }

      if (!services || services.length === 0) {
        console.log('ℹ️ Nenhum serviço encontrado para migrar');
        return { servicesMigrated: 0 };
      }

      let migratedCount = 0;
      
      for (const service of services) {
        try {
          await sqliteService.createService({
            name: service.name || 'Serviço',
            description: service.description || '',
            price: service.price || service.unit_price ? service.unit_price / 100 : 0,
            category: service.category || 'service',
            user_id: service.user_id || 'default_user'
          });
          
          migratedCount++;
          console.log(`✅ Serviço migrado: ${service.name}`);
        } catch (serviceError) {
          const errorMsg = `Erro ao migrar serviço ${service.name}: ${serviceError instanceof Error ? serviceError.message : 'Erro desconhecido'}`;
          console.error(errorMsg);
          this.errors.push(errorMsg);
        }
      }

      console.log(`✅ ${migratedCount} serviços migrados com sucesso`);
      return { servicesMigrated: migratedCount };

    } catch (error) {
      console.error('❌ Erro ao migrar serviços:', error);
      this.errors.push(`Erro ao migrar serviços: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return { servicesMigrated: 0 };
    }
  }

  // Verificar se há dados para migrar
  async checkDataForMigration(): Promise<{
    hasUsers: boolean;
    hasClients: boolean;
    hasFactures: boolean;
    hasServices: boolean;
    totalRecords: number;
  }> {
    console.log('🔍 Verificando dados disponíveis para migração...');
    
    let totalRecords = 0;
    const results = {
      hasUsers: false,
      hasClients: false,
      hasFactures: false,
      hasServices: false,
      totalRecords: 0
    };

    try {
      // Verificar usuários
      const { data: users } = await supabase.from('users').select('count');
      if (users !== null) {
        results.hasUsers = true;
        totalRecords += users.length || 0;
      }

      // Verificar clientes
      const { data: clients } = await supabase.from('clients').select('count');
      if (clients !== null) {
        results.hasClients = true;
        totalRecords += clients.length || 0;
      }

      // Verificar faturas
      const { data: factures } = await supabase.from('Factures').select('count');
      if (factures !== null) {
        results.hasFactures = true;
        totalRecords += factures.length || 0;
      }

      // Verificar serviços
      const { data: services } = await supabase.from('services').select('count');
      if (services !== null) {
        results.hasServices = true;
        totalRecords += services.length || 0;
      }

      results.totalRecords = totalRecords;
      
      console.log('📊 Dados disponíveis para migração:', results);
      return results;

    } catch (error) {
      console.error('❌ Erro ao verificar dados:', error);
      return results;
    }
  }
}

export const migrationService = new MigrationService();
export default migrationService;
