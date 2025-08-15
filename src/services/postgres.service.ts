import { Pool, PoolClient } from 'pg';

// Interfaces para tipagem
export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  company: string;
  account_type: 'entreprise' | 'administrateur';
  created_at: Date;
  updated_at: Date;
}

export interface Client {
  id: string;
  user_id: string;
  company: string;
  contact_person: string;
  email: string;
  phone: string;
  address?: string;
  tax_number?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Service {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  unit_price: number;
  currency: string;
  created_at: Date;
  updated_at: Date;
}

export interface Facture {
  id: string;
  user_id: string;
  client_id?: string;
  invoice_number: string;
  description?: string;
  date: Date;
  due_date?: Date;
  status: 'pending' | 'paid' | 'overdue';
  total_amount: number;
  currency: string;
  created_at: Date;
  updated_at: Date;
}

class PostgreSQLService {
  private pool: Pool;

  constructor() {
    // Configuração do pool de conexões
    this.pool = new Pool({
      host: '91.107.237.159',
      port: 5432,
      database: 'db_finance',
      user: 'postgres',
      password: 'lYPS50GDgjiA6QEL0GG0qHefqqGcGo8I2njYiBkpxlSuuhMv8Lpv1K2VY',
      ssl: false, // Para conexão local
      max: 20, // Máximo de conexões no pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Testar conexão na inicialização
    this.testConnection();
  }

  private async testConnection() {
    try {
      const client = await this.pool.connect();
      console.log('✅ Conectado ao PostgreSQL com sucesso!');
      client.release();
    } catch (error) {
      console.error('❌ Erro ao conectar ao PostgreSQL:', error);
    }
  }

  // Métodos para usuários
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const client = await this.pool.connect();
    try {
      const query = `
        INSERT INTO users (email, password_hash, full_name, company, account_type, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `;
      
      const values = [
        userData.email,
        userData.password_hash,
        userData.full_name,
        userData.company,
        userData.account_type
      ];

      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await client.query(query, [email]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getUserById(id: string): Promise<User | null> {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await client.query(query, [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Métodos para clientes
  async getClients(userId: string): Promise<Client[]> {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM clients WHERE user_id = $1 ORDER BY company';
      const result = await client.query(query, [userId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const client = await this.pool.connect();
    try {
      const query = `
        INSERT INTO clients (user_id, company, contact_person, email, phone, address, tax_number, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `;
      
      const values = [
        clientData.user_id,
        clientData.company,
        clientData.contact_person,
        clientData.email,
        clientData.phone,
        clientData.address,
        clientData.tax_number
      ];

      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Métodos para serviços
  async getServices(userId: string): Promise<Service[]> {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM services WHERE user_id = $1 ORDER BY name';
      const result = await client.query(query, [userId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async createService(serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> {
    const client = await this.pool.connect();
    try {
      const query = `
        INSERT INTO services (user_id, name, description, unit_price, currency, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `;
      
      const values = [
        serviceData.user_id,
        serviceData.name,
        serviceData.description,
        serviceData.unit_price,
        serviceData.currency
      ];

      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Métodos para faturas
  async getFactures(userId: string): Promise<Facture[]> {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM factures WHERE user_id = $1 ORDER BY date DESC';
      const result = await client.query(query, [userId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async createFacture(factureData: Omit<Facture, 'id' | 'created_at' | 'updated_at'>): Promise<Facture> {
    const client = await this.pool.connect();
    try {
      const query = `
        INSERT INTO factures (user_id, client_id, invoice_number, description, date, due_date, status, total_amount, currency, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *
      `;
      
      const values = [
        factureData.user_id,
        factureData.client_id,
        factureData.invoice_number,
        factureData.description,
        factureData.date,
        factureData.due_date,
        factureData.status,
        factureData.total_amount,
        factureData.currency
      ];

      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Fechar pool de conexões
  async close() {
    await this.pool.end();
  }
}

export const postgresService = new PostgreSQLService();
export default postgresService;
