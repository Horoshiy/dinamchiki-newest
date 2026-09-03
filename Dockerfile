# =============================================================================
# Multi-stage build для Vue 3 SPA.
# Stage 1: node:22-alpine — сборка.
# Stage 2: nginx:1.27-alpine — отдача статики с SPA-fallback на index.html.
# =============================================================================

# --- Stage 1: build ---------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Ставим зависимости отдельно, чтобы кэш Docker не сбрасывался на каждый код-коммит.
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# Копируем исходники и билдим.
COPY . .
RUN npm run build

# --- Stage 2: runtime (nginx) -----------------------------------------------
FROM nginx:1.27-alpine AS runtime

# SPA fallback: любой неизвестный путь → /index.html, чтобы vue-router работал.
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Готовая статика из Stage 1.
COPY --from=build /app/dist /usr/share/nginx/html

# Health-check.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ > /dev/null || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
