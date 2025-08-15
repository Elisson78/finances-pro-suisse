#!/bin/bash

# Script para iniciar o backend e o frontend

echo "Iniciando o backend..."
node server.js &
BACKEND_PID=$!

echo "Backend iniciado com PID: $BACKEND_PID"
echo "Aguardando backend inicializar..."
sleep 3

echo "Backend e frontend prontos!"
echo "Para parar os serviços, pressione Ctrl+C"

# Manter o script rodando
wait $BACKEND_PID