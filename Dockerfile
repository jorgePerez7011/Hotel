# Dockerfile para el proyecto Hotel Management System

# Etapa 1: Construcción
FROM node:18-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Construir la aplicación Astro
RUN npm run build

# Etapa 2: Producción
FROM node:18-alpine AS production

# Instalar dumb-init para manejo de señales
RUN apk add --no-cache dumb-init

# Crear usuario no root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S astro -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos construidos desde la etapa anterior
COPY --from=builder --chown=astro:nodejs /app/dist ./dist
COPY --from=builder --chown=astro:nodejs /app/backend ./backend
COPY --from=builder --chown=astro:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=astro:nodejs /app/package*.json ./

# Cambiar al usuario no root
USER astro

# Exponer puerto
EXPOSE 4000

# Comando de inicio con dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "backend/server.js"]