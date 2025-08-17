# 🚀 COMO INICIAR O FINANCES PRO SUISSE

## ⚡ INÍCIO RÁPIDO

```bash
# COMANDO PRINCIPAL (usa os dois servidores)
npm run dev:full
```

## 📋 CHECKLIST ANTES DE COMEÇAR

### 1. ✅ Verificar se as dependências estão instaladas
```bash
npm install
```

### 2. ✅ Iniciar o projeto completo
```bash
npm run dev:full
```

### 3. ✅ Verificar se está funcionando
- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:5000/api  
- **Login**: Deve funcionar sem "Network Error"

## 🔧 SCRIPTS DISPONÍVEIS

| Comando | Descrição |
|---------|-----------|
| `npm run dev:full` | **RECOMENDADO** - Roda frontend + backend |
| `npm run frontend` | Só frontend (porta 3001) |
| `npm run backend` | Só backend (porta 5000) |
| `npm run build` | Build para produção |
| `npm run lint` | Verificar código |

## 🚨 PROBLEMA COMUM

### Network Error no Login
**Causa**: Backend não rodando na porta 5000  
**Solução**: Sempre use `npm run dev:full`

## 🔑 CREDENCIAIS DE TESTE

- **Email**: uzuallelisson@gmail.com
- **Senha**: 12345678

## 🌐 AMBIENTES

- **Local**: http://localhost:3001
- **Produção**: https://finance.event-connect.app

---
**Última atualização**: 17/08/2025