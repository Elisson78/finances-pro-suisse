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

## Deploy
```bash
git add .
git commit -m "Descrição"
git push origin main
```

## Usuários de Teste
- empresa@gmail.com / 123456