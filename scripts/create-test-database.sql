-- Script para criar banco de teste com dados de exemplo
-- Execute como usuário postgres

-- 1. Criar banco de teste
CREATE DATABASE finances_test OWNER postgres;

-- 2. Conectar ao banco de teste
\c finances_test;

-- 3. Criar tabelas
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    company VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    tax_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CHF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS factures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CHF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS facture_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facture_id UUID REFERENCES factures(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Inserir dados de teste
INSERT INTO users (email, password_hash, full_name, company) VALUES
('admin@finances.ch', '$2b$10$example.hash.here', 'Admin User', 'FinancesPro Suisse'),
('test@example.com', '$2b$10$example.hash.here', 'Test User', 'Test Company');

INSERT INTO clients (user_id, company, contact_person, email, phone) VALUES
((SELECT id FROM users WHERE email = 'admin@finances.ch'), 'TechnoServ SA', 'João Silva', 'joao@technoserv.ch', '+41 22 123 4567'),
((SELECT id FROM users WHERE email = 'admin@finances.ch'), 'Digital Solutions AG', 'Maria Müller', 'maria@digitalsolutions.ch', '+41 44 987 6543');

INSERT INTO services (user_id, name, description, unit_price, currency) VALUES
((SELECT id FROM users WHERE email = 'admin@finances.ch'), 'Consultoria', 'Serviços de consultoria técnica', 150.00, 'CHF'),
((SELECT id FROM users WHERE email = 'admin@finances.ch'), 'Desenvolvimento Web', 'Desenvolvimento de aplicações web', 200.00, 'CHF'),
((SELECT id FROM users WHERE email = 'admin@finances.ch'), 'Manutenção', 'Serviços de manutenção e suporte', 100.00, 'CHF');

INSERT INTO factures (user_id, client_id, invoice_number, description, date, due_date, status, total_amount, currency) VALUES
((SELECT id FROM users WHERE email = 'admin@finances.ch'), 
 (SELECT id FROM clients WHERE company = 'TechnoServ SA'), 
 'INV-2024-001', 'Consultoria técnica - Projeto A', '2024-08-14', '2024-09-14', 'pending', 150.00, 'CHF'),
((SELECT id FROM users WHERE email = 'admin@finances.ch'), 
 (SELECT id FROM clients WHERE company = 'Digital Solutions AG'), 
 'INV-2024-002', 'Desenvolvimento web - Site corporativo', '2024-08-14', '2024-09-14', 'pending', 400.00, 'CHF');

INSERT INTO facture_items (facture_id, service_id, description, quantity, unit_price, total_price) VALUES
((SELECT id FROM factures WHERE invoice_number = 'INV-2024-001'), 
 (SELECT id FROM services WHERE name = 'Consultoria'), 
 'Consultoria técnica - Projeto A', 1, 150.00, 150.00),
((SELECT id FROM factures WHERE invoice_number = 'INV-2024-002'), 
 (SELECT id FROM services WHERE name = 'Desenvolvimento Web'), 
 'Desenvolvimento web - Site corporativo', 2, 200.00, 400.00);

-- 5. Criar índices para melhor performance
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_services_user_id ON services(user_id);
CREATE INDEX idx_factures_user_id ON factures(user_id);
CREATE INDEX idx_factures_client_id ON factures(client_id);
CREATE INDEX idx_facture_items_facture_id ON facture_items(facture_id);

-- 6. Verificar dados inseridos
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Clients', COUNT(*) FROM clients
UNION ALL
SELECT 'Services', COUNT(*) FROM services
UNION ALL
SELECT 'Factures', COUNT(*) FROM factures
UNION ALL
SELECT 'Facture Items', COUNT(*) FROM facture_items;

echo "✅ Banco de teste 'finances_test' criado com sucesso!"
echo "📊 Dados de exemplo inseridos"
echo "🔗 Conecte usando: postgres://postgres:lYPS50GDgjiA6QEL0GG0qHefqqGcGo8I2njYiBkpxlSuuhMv8Lpv1K2VY@91.107.237.159:5432/finances_test"
