FROM node:20-alpine

WORKDIR /app

# Instalar cliente PostgreSQL para ejecutar scripts SQL
RUN apk add --no-cache postgresql-client

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el esquema SQL
COPY schema.sql ./

# Copiar el resto del código (para hot-reload)
COPY . .

# Crear directorio de uploads
RUN mkdir -p uploads/documents uploads/images

EXPOSE 3002

# Script de inicio sin Prisma - solo SQL puro
CMD ["sh", "-c", "npm run dev"]
