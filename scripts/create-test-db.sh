#!/bin/bash

# Script para criar banco de teste com dados de exemplo
echo "🚀 Criando banco de teste 'finances_test'..."

# 1. Conectar ao PostgreSQL e executar o script
psql -h 91.107.237.159 -U postgres -d postgres -f scripts/create-test-database.sql

# 2. Verificar se o banco foi criado
echo "🔍 Verificando se o banco foi criado..."
psql -h 91.107.237.159 -U postgres -l | grep finances_test

# 3. Testar conexão ao banco de teste
echo "🧪 Testando conexão ao banco de teste..."
psql -h 91.107.237.159 -U postgres -d finances_test -c "SELECT COUNT(*) as total_users FROM users;"

echo "✅ Banco de teste criado com sucesso!"
echo "📊 Dados de exemplo inseridos"
echo "🔗 String de conexão: postgres://postgres:lYPS50GDgjiA6QEL0GG0qHefqqGcGo8I2njYiBkpxlSuuhMv8Lpv1K2VY@91.107.237.159:5432/finances_test"
echo ""
echo "🎯 Para usar na aplicação, altere a DATABASE_URL para:"
echo "DATABASE_URL=postgres://postgres:lYPS50GDgjiA6QEL0GG0qHefqqGcGo8I2njYiBkpxlSuuhMv8Lpv1K2VY@91.107.237.159:5432/finances_test"
