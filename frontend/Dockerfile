# CineScope Frontend Multi-Stage Dockerfile

# Stage 1: Build production assets
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies using package-lock
COPY package*.json ./
RUN npm ci

# Copy frontend source code
COPY . .

# Build production bundle with Vite
RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine AS runner

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
