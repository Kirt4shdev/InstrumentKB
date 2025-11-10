FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del sistema incluyendo las librerías OpenSSL para Prisma
RUN apk add --no-cache \
    postgresql-client \
    openssl \
    libc6-compat

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Generar Prisma client
RUN npx prisma generate

# Copiar el resto del código (para hot-reload)
COPY . .

# Crear directorio de uploads
RUN mkdir -p uploads/documents uploads/images

EXPOSE 3002

# Script de inicio con migraciones automáticas
CMD ["sh", "-c", "npx prisma migrate deploy && npm run seed && npm run dev"]

