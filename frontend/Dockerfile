FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código (para hot-reload)
COPY . .

EXPOSE 3000

# Vite con hot-reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

