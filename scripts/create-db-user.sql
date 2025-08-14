-- Script para criar usuário e banco de dados
-- Execute como superusuário (postgres)

-- 1. Criar usuário
CREATE USER postgres WITH PASSWORD 'lYPS50GDgjiA6QEL0GG0qHefqqGcGo8I2njYiBkpxlSuuhMv8Lpv1K2VY';

-- 2. Dar privilégios de superusuário (se necessário)
ALTER USER postgres WITH SUPERUSER;

-- 3. Criar banco de dados (se não existir)
CREATE DATABASE postgres OWNER postgres;

-- 4. Dar todos os privilégios no banco
GRANT ALL PRIVILEGES ON DATABASE postgres TO postgres;

-- 5. Conectar ao banco e dar privilégios nas tabelas
\c postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;

-- 6. Definir usuário como proprietário do schema
ALTER SCHEMA public OWNER TO postgres;
