# Deploy Configuration - FinancesPro Suisse

## Configurações Essenciais

### Plataforma
- **Coolify**: https://finance.event-connect.app
- **Repositório**: https://github.com/Elisson78/finances-pro-suisse
- **Branch**: main

### Banco de Dados
```env
DATABASE_URL=postgres://postgres:lYPS50GDgjiA6QEL0REU142DUG0qHefqqGcGo8I2njYiBkpxlSuuhMv8Lpv1K2VY@91.107.237.159:5432/db_finance
```

### Variáveis de Ambiente (.env)
```env
VITE_API_URL=/api
DATABASE_URL=postgres://postgres:lYPS50GDgjiA6QEL0REU142DUG0qHefqqGcGo8I2njYiBkpxlSuuhMv8Lpv1K2VY@91.107.237.159:5432/db_finance
```

### nginx.conf - Proxy API
```nginx
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

### Dockerfile - Configuração
```dockerfile
# Setup nginx
RUN mkdir -p /var/log/nginx /var/cache/nginx /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
RUN cp -r build/* /usr/share/nginx/html/
```

## Sistema de Redirecionamento Implementado

### Tipos de Usuário
- **`entreprise`**: Usuários empresa → redirecionados para `/dashboard`
- **`administrateur`**: Usuários administradores → redirecionados para `/dashboard-admin`

### Funcionalidades
✅ **Login automático**: Redirecionamento baseado no `account_type` do usuário  
✅ **Verificação de permissões**: Rotas protegidas por tipo de conta  
✅ **Estrutura de dados consistente**: Backend retorna `account_type` e `role`  
✅ **JWT atualizado**: Token inclui informações de role corretas  
✅ **Exibição do usuário logado**: Nome, email e tipo de conta visíveis  
✅ **Estados de loading e erro**: Interface responsiva com feedback visual  
✅ **Logs de debug**: Sistema completo de logs para identificação de problemas  

### Informações do Usuário Exibidas
- **Nome completo** do usuário logado
- **Email** do usuário
- **Tipo de conta** (Empresa ou Administrador)
- **Nome da empresa** (para usuários empresa)
- **Iniciais** do usuário no avatar
- **Status de autenticação** com loading e tratamento de erros

### Arquivos Modificados
- `routes/auth.routes.js` - Backend retorna `account_type` e `role` + logs de debug
- `src/pages/LoginPage.tsx` - Redirecionamento baseado no tipo de conta
- `src/components/common/PrivateRoute.tsx` - Verificação de permissões atualizada
- `src/pages/DashboardPage.tsx` - Estrutura simplificada + informações do usuário + logs
- `src/contexts/AuthContext.tsx` - Logs de debug para verificação de usuário
- `src/services/api.service.ts` - Logs de debug para interceptors e chamadas
- `src/types/global.ts` - Tipos atualizados e simplificados
- `test-api.html` - Arquivo de teste para verificar API
- `DEPLOY.md` - Documentação atualizada

### Como funciona agora:
1. **Usuário faz login** → Sistema verifica `account_type`
2. **Se `entreprise`** → Redireciona para `/dashboard`
3. **Se `administrateur`** → Redireciona para `/dashboard-admin`
4. **Sistema verifica permissões** → Acesso controlado por tipo de conta
5. **Informações do usuário** → Exibidas claramente no header
6. **Logs de debug** → Console mostra todo o processo de autenticação
7. **Logout** → Limpa dados e redireciona para `/login`

## 🚨 PROBLEMA DE CONECTIVIDADE RESOLVIDO

### Status do Servidor de Produção:
- **Domínio principal**: ✅ https://finance.event-connect.app (200 OK)
- **API endpoint**: ❌ https://api.finance.event-connect.app (503 Service Unavailable)
- **Solução atual**: Backend local na porta 5000

### Configuração Atual (Desenvolvimento):
```env
VITE_API_URL=/api
```
- Frontend → `/api` → Nginx → `localhost:5000` (backend local)

## 🔍 Debug e Solução de Problemas

### Problema: Usuário não aparece após login

**Sintomas:**
- Login funciona mas informações do usuário não aparecem
- Dashboard mostra dados padrão em vez dos dados reais
- Console pode mostrar erros de autenticação

**Soluções:**

1. **Verificar Console do Navegador:**
   - Abrir DevTools (F12)
   - Verificar Console para logs de debug
   - Procurar por erros em vermelho

2. **Testar API Diretamente:**
   - Abrir `test-api.html` no navegador
   - Fazer login de teste
   - Verificar se `/auth/me` retorna dados

3. **Verificar LocalStorage:**
   - DevTools → Application → Local Storage
   - Verificar se `authToken` e `user` estão presentes

4. **Logs de Debug Implementados:**
   - Frontend: Console mostra estado do usuário
   - Backend: Console mostra processo de autenticação
   - API: Logs de todas as chamadas

### Comandos de Debug:

```bash
# Ver logs do backend
docker logs [container-id]

# Verificar se API está rodando
curl http://localhost:5000/api/auth/me

# Testar banco de dados
psql $DATABASE_URL -c "SELECT * FROM users LIMIT 5;"
```

## Deploy
```bash
git add .
git commit -m "Implementado sistema completo de debug e logs para autenticação"
git push origin main
```

## Usuários de Teste
- empresa@gmail.com / 123456 (tipo: entreprise → /dashboard)
- admin@finances.ch / [senha] (tipo: administrateur → /dashboard-admin)

## 📋 Checklist de Verificação

- [ ] Backend rodando na porta 5000
- [ ] Banco PostgreSQL acessível
- [ ] Tabela `users` com campo `account_type`
- [ ] Frontend configurado com `VITE_API_URL=/api`
- [ ] Nginx proxy configurado para `/api`
- [ ] Logs de debug aparecendo no console
- [ ] LocalStorage sendo preenchido após login
- [ ] API `/auth/me` retornando dados do usuário