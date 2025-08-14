import Database from 'better-sqlite3';
import path from 'path';

// Interface para tipos de dados
export interface User {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  company: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  category: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Facture {
  id: string;
  numero_facture: string;
  client_id: string;
  client_name: string;
  date: string;
  echeance: string;
  articles: Array<{
    description: string;
    qty: number;
    price: number;
  }>;
  subtotal: number;
  tva: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

class SQLiteService {
  private db!: Database.Database;
  private dbPath: string;

  constructor() {
    // Em produção, usar caminho absoluto
    this.dbPath = path.join(process.cwd(), 'tmp', 'database', 'finances.db');
    this.initDatabase();
  }

  private initDatabase() {
    try {
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this.createTables();
      this.insertSampleData();
      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Error initializing SQLite database:', error);
    }
  }

  private createTables() {
    // Tabela de usuários
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        company_name TEXT NOT NULL,
        role TEXT DEFAULT 'entreprise',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Tabela de clientes
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        company TEXT NOT NULL,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        postal_code TEXT,
        country TEXT DEFAULT 'Suisse',
        category TEXT DEFAULT 'facture',
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Tabela de faturas
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS factures (
        id TEXT PRIMARY KEY,
        numero_facture TEXT UNIQUE NOT NULL,
        client_id TEXT NOT NULL,
        client_name TEXT NOT NULL,
        date TEXT NOT NULL,
        echeance TEXT NOT NULL,
        articles TEXT NOT NULL,
        subtotal REAL NOT NULL,
        tva REAL NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Tabela de serviços
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT DEFAULT 'service',
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
  }

  private insertSampleData() {
    // Inserir usuário de exemplo
    const userExists = this.db.prepare('SELECT id FROM users WHERE email = ?').get('admin@finances.ch');
    if (!userExists) {
      const userId = 'user_' + Date.now();
      this.db.prepare(`
        INSERT INTO users (id, email, full_name, company_name, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(userId, 'admin@finances.ch', 'Admin Finances', 'Finances Pro Suisse', 'admin', 
              new Date().toISOString(), new Date().toISOString());

      // Inserir clientes de exemplo
      const clients = [
        {
          company: 'TechnoServ SA',
          contact_person: 'Jean Dupont',
          email: 'contact@technoserv.ch',
          phone: '+41 22 123 45 67',
          address: 'Rue de la Corraterie 15',
          city: 'Genève',
          postal_code: '1204',
          category: 'facture'
        },
        {
          company: 'Alpine Consulting',
          contact_person: 'Marie Martin',
          email: 'info@alpine-consulting.ch',
          phone: '+41 21 987 65 43',
          address: 'Avenue de la Gare 25',
          city: 'Lausanne',
          postal_code: '1003',
          category: 'facture'
        }
      ];

      clients.forEach(client => {
        const clientId = 'client_' + Date.now() + Math.random();
        this.db.prepare(`
          INSERT INTO clients (id, company, contact_person, email, phone, address, city, postal_code, category, user_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(clientId, client.company, client.contact_person, client.email, client.phone,
                client.address, client.city, client.postal_code, client.category, userId,
                new Date().toISOString(), new Date().toISOString());
      });

      // Inserir serviços de exemplo
      const services = [
        {
          name: 'Consultoria Financeira',
          description: 'Serviços de consultoria em gestão financeira',
          price: 150.00,
          category: 'consultoria'
        },
        {
          name: 'Auditoria Contábil',
          description: 'Auditoria e revisão de contas',
          price: 200.00,
          category: 'auditoria'
        }
      ];

      services.forEach(service => {
        const serviceId = 'service_' + Date.now() + Math.random();
        this.db.prepare(`
          INSERT INTO services (id, name, description, price, category, user_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(serviceId, service.name, service.description, service.price, service.category, userId,
                new Date().toISOString(), new Date().toISOString());
      });
    }
  }

  // Métodos para usuários
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const id = 'user_' + Date.now();
    const now = new Date().toISOString();
    
    this.db.prepare(`
      INSERT INTO users (id, email, full_name, company_name, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, userData.email, userData.full_name, userData.company_name, userData.role, now, now);

    return { id, ...userData, created_at: now, updated_at: now };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User || null;
  }

  // Métodos para clientes
  async getClients(userId: string): Promise<Client[]> {
    return this.db.prepare('SELECT * FROM clients WHERE user_id = ? ORDER BY company').all(userId) as Client[];
  }

  async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const id = 'client_' + Date.now();
    const now = new Date().toISOString();
    
    this.db.prepare(`
      INSERT INTO clients (id, company, contact_person, email, phone, address, city, postal_code, country, category, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, clientData.company, clientData.contact_person, clientData.email, clientData.phone,
            clientData.address, clientData.city, clientData.postal_code, clientData.country, clientData.category,
            clientData.user_id, now, now);

    return { id, ...clientData, created_at: now, updated_at: now };
  }

  async updateClient(id: string, clientData: Partial<Client>): Promise<void> {
    const fields = Object.keys(clientData).filter(key => key !== 'id');
    const values = fields.map(field => clientData[field as keyof Client]);
    
    if (fields.length > 0) {
      const query = `UPDATE clients SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = ? WHERE id = ?`;
      this.db.prepare(query).run(...values, new Date().toISOString(), id);
    }
  }

  async deleteClient(id: string): Promise<void> {
    this.db.prepare('DELETE FROM clients WHERE id = ?').run(id);
  }

  // Métodos para faturas
  async getFactures(userId: string): Promise<Facture[]> {
    const factures = this.db.prepare('SELECT * FROM factures WHERE user_id = ? ORDER BY date DESC').all(userId) as Facture[];
    return factures.map(f => ({
      ...f,
      articles: JSON.parse(f.articles as any)
    }));
  }

  async createFacture(factureData: Omit<Facture, 'id' | 'created_at' | 'updated_at'>): Promise<Facture> {
    const id = 'facture_' + Date.now();
    const now = new Date().toISOString();
    
    this.db.prepare(`
      INSERT INTO factures (id, numero_facture, client_id, client_name, date, echeance, articles, subtotal, tva, total, status, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, factureData.numero_facture, factureData.client_id, factureData.client_name,
            factureData.date, factureData.echeance, JSON.stringify(factureData.articles),
            factureData.subtotal, factureData.tva, factureData.total, factureData.status,
            factureData.user_id, now, now);

    return { id, ...factureData, created_at: now, updated_at: now };
  }

  async updateFacture(id: string, factureData: Partial<Facture>): Promise<void> {
    const fields = Object.keys(factureData).filter(key => key !== 'id');
    const values = fields.map(field => {
      const value = factureData[field as keyof Facture];
      return field === 'articles' ? JSON.stringify(value) : value;
    });
    
    if (fields.length > 0) {
      const query = `UPDATE factures SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = ? WHERE id = ?`;
      this.db.prepare(query).run(...values, new Date().toISOString(), id);
    }
  }

  async deleteFacture(id: string): Promise<void> {
    this.db.prepare('DELETE FROM factures WHERE id = ?').run(id);
  }

  // Métodos para serviços
  async getServices(userId: string): Promise<Service[]> {
    return this.db.prepare('SELECT * FROM services WHERE user_id = ? ORDER BY name').all(userId) as Service[];
  }

  async createService(serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> {
    const id = 'service_' + Date.now();
    const now = new Date().toISOString();
    
    this.db.prepare(`
      INSERT INTO services (id, name, description, price, category, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, serviceData.name, serviceData.description, serviceData.price,
            serviceData.category, serviceData.user_id, now, now);

    return { id, ...serviceData, created_at: now, updated_at: now };
  }

  async updateService(id: string, serviceData: Partial<Service>): Promise<void> {
    const fields = Object.keys(serviceData).filter(key => key !== 'id');
    const values = fields.map(field => serviceData[field as keyof Service]);
    
    if (fields.length > 0) {
      const query = `UPDATE services SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = ? WHERE id = ?`;
      this.db.prepare(query).run(...values, new Date().toISOString(), id);
    }
  }

  async deleteService(id: string): Promise<void> {
    this.db.prepare('DELETE FROM services WHERE id = ?').run(id);
  }

  // Fechar conexão
  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Instância singleton
export const sqliteService = new SQLiteService();
export default sqliteService;
