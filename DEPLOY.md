# Deploy Configuration - FinancesPro Suisse

## Configurações do Deploy

### Plataforma
- **Plataforma**: Coolify
- **URL**: https://finance.event-connect.app
- **Repositório**: https://github.com/Elisson78/finances-pro-suisse
- **Branch**: main

### Arquitetura
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Banco de Dados**: PostgreSQL (remoto)
- **Proxy**: Nginx

## Configurações do Banco de Dados

```env
DATABASE_URL=postgres://postgres:lYPS50GDgjiA6QEL0REU142DUG0qHefqqGcGo8I2njYiBkpxlSuuhMv8Lpv1K2VY@91.107.237.159:5432/db_finance
```

### Usuários de Teste
- **Email**: empresa@gmail.com
- **Senha**: 123456
- **Role**: user

- **Email**: admin@finances.ch  
- **Senha**: [verificar no banco]
- **Role**: administrateur

## Configurações de API

### URLs da API
- **Local**: http://localhost:5000/api
- **Produção**: /api (proxy via nginx)

### Variáveis de Ambiente
```env
VITE_API_URL=/api
NODE_ENV=production
PORT=5000
JWT_SECRET=finances-pro-suisse-secret-key
```

## Dockerfile

O deploy usa um Dockerfile que:
1. **Build do Frontend**: Compila React/Vite para arquivos estáticos
2. **Setup do Backend**: Instala dependências Node.js
3. **Nginx**: Serve frontend e faz proxy das APIs
4. **Supervisor**: Gerencia ambos os processos

### Serviços Rodando
- **Backend**: Node.js na porta 5000
- **Frontend**: Nginx na porta 8080
- **Proxy**: `/api/*` → `http://localhost:5000`

## nginx.conf

```nginx
# API proxy to backend
location /api/ {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

## Processo de Deploy

### Deploy Automático
1. **Commit & Push** para branch main
2. **Coolify** detecta mudanças automaticamente
3. **Build** da aplicação via Dockerfile
4. **Deploy** automático

### Comandos para Deploy Manual
```bash
# 1. Fazer mudanças no código
git add .
git commit -m "Descrição das mudanças"
git push origin main

# 2. Aguardar deploy automático (3-5 minutos)
```

## Estrutura de Arquivos Importantes

```
├── Dockerfile              # Configuração do container
├── nginx.conf              # Configuração do proxy
├── server.js               # Backend Express
├── routes/                 # Rotas da API
│   ├── auth.routes.js
│   ├── facture.routes.js
│   ├── client.routes.js
│   └── service.routes.js
├── src/                    # Frontend React
├── .env                    # Variáveis de ambiente
└── package.json            # Dependências
```

## Troubleshooting

### Problemas Comuns

#### 1. Network Error no Login
- **Causa**: Backend não rodando ou proxy mal configurado
- **Solução**: Verificar nginx.conf e Dockerfile

#### 2. 401 Unauthorized
- **Causa**: Token JWT expirado
- **Solução**: Fazer logout/login novamente

#### 3. Deploy Falha
- **Causa**: Erro no Dockerfile ou dependências
- **Solução**: Verificar logs do Coolify

#### 4. Banco de Dados Inacessível
- **Causa**: URL de conexão incorreta
- **Solução**: Verificar DATABASE_URL em routes/

### Logs e Monitoramento
- **Deploy Logs**: Disponíveis no painel Coolify
- **Application Logs**: Backend logs via console
- **Nginx Logs**: /var/log/nginx/ no container

## Comandos Úteis

### Desenvolvimento Local
```bash
# Frontend (porta 3002)
npm run frontend

# Backend (porta 5000) 
npm run backend

# Ambos juntos
./start.sh
```

### Verificações
```bash
# Testar API local
curl http://localhost:5000/api/auth/me

# Testar login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "empresa@gmail.com", "password": "123456"}'
```

## Backup e Restauração

### Dados do Banco
```sql
-- Backup de usuários
SELECT * FROM users WHERE email = 'empresa@gmail.com';

-- Backup de faturas
SELECT * FROM factures WHERE user_id = '4151a3c2-2940-4bce-8404-7ee09c2a32e0';
```

### Reset de Senha (se necessário)
```javascript
const bcrypt = require('bcrypt');
const newPassword = '123456';
const hashedPassword = await bcrypt.hash(newPassword, 10);
// UPDATE users SET password_hash = 'hash' WHERE email = 'email';
```

## Contatos e Recursos

- **Repositório**: https://github.com/Elisson78/finances-pro-suisse
- **Deploy URL**: https://finance.event-connect.app
- **Coolify**: Interface de deploy e monitoramento

---

**Última atualização**: 16 de Agosto de 2025  
**Status**: ✅ Funcionando corretamente