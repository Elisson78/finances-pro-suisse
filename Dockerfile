# Dockerfile simplificado que funciona
FROM node:20-alpine

WORKDIR /app

# Install dependencies for both build and runtime
RUN apk add --no-cache nginx curl

# Copy all files
COPY . .

# Install dependencies
RUN npm ci

# Build frontend
RUN npm run build

# Setup nginx
RUN mkdir -p /var/log/nginx /var/cache/nginx
COPY nginx.conf /etc/nginx/nginx.conf
RUN cp -r build/* /usr/share/nginx/html/

# Create startup script
RUN cat > /app/start.sh << 'EOF'
#!/bin/sh
echo "Starting backend..."
node server.js &
BACKEND_PID=$!

echo "Starting nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

echo "Both services started. Backend PID: $BACKEND_PID, Nginx PID: $NGINX_PID"

# Wait for both processes
wait $BACKEND_PID $NGINX_PID
EOF

RUN chmod +x /app/start.sh

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["/app/start.sh"]