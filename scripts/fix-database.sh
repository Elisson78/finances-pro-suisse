#!/bin/bash

# Script para corrigir problemas de banco de dados
# Execute este script no servidor onde está rodando o PostgreSQL

echo "🔧 Corrigindo problemas de banco de dados..."

# 1. Conectar ao container PostgreSQL
echo "📦 Conectando ao container PostgreSQL..."
CONTAINER_NAME=$(docker ps --filter "ancestor=postgres" --format "{{.Names}}" | head -1)

if [ -z "$CONTAINER_NAME" ]; then
    echo "❌ Container PostgreSQL não encontrado!"
    exit 1
fi

echo "✅ Container encontrado: $CONTAINER_NAME"

# 2. Executar comandos SQL para criar usuário
echo "👤 Criando usuário postgres..."
docker exec -it $CONTAINER_NAME psql -U postgres -c "
CREATE USER postgres WITH PASSWORD 'lYPS50GDgjiA6QEL0GG0qHefqqGcGo8I2njYiBkpxlSuuhMv8Lpv1K2VY';
ALTER USER postgres WITH SUPERUSER;
CREATE DATABASE postgres OWNER postgres;
GRANT ALL PRIVILEGES ON DATABASE postgres TO postgres;
"

# 3. Conectar ao banco e dar privilégios
echo "🔐 Configurando privilégios..."
docker exec -it $CONTAINER_NAME psql -U postgres -d postgres -c "
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
ALTER SCHEMA public OWNER TO postgres;
"

# 4. Testar conexão
echo "🧪 Testando conexão..."
docker exec -it $CONTAINER_NAME psql -U postgres -d postgres -c "SELECT version();"

echo "✅ Banco de dados corrigido com sucesso!"
echo "📋 Usuário: postgres"
echo "🔑 Senha: lYPS50GDgjiA6QEL0GG0qHefqqGcGo8I2njYiBkpxlSuuhMv8Lpv1K2VY"
echo "🌐 Host: 91.107.237.159:5432"
echo "🗄️  Banco: postgres"
