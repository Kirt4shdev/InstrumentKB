# ✅ InstrumentKB v2.0 - Docker Completado

## 🎉 ¡Docker Funciona Perfectamente!

Todo está configurado y funcionando con:
- ✅ Hot-reload en backend y frontend
- ✅ Migraciones automáticas al iniciar
- ✅ Seed data cargado automáticamente
- ✅ Persistencia de datos
- ✅ Network aislada

---

## 🚀 Inicio Rápido

### Windows
```cmd
docker-start.bat
```

### Linux/Mac
```bash
chmod +x docker-start.sh
./docker-start.sh
```

### Manual
```bash
docker-compose up -d
```

**URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

---

## 🔥 Hot-Reload Configurado

### Backend
- Cambios en `backend/src/**` → Auto-reload
- Cambios en `backend/prisma/schema.prisma` → Ejecutar: `docker-compose exec backend npx prisma generate`

### Frontend
- Cambios en `frontend/src/**` → Auto-reload instantáneo
- Vite watch con polling activado

---

## 🔄 Migraciones Automáticas

Al iniciar el backend:
1. Espera PostgreSQL (healthcheck)
2. Ejecuta `prisma migrate deploy`
3. Ejecuta `npm run seed` (datos de ejemplo)
4. Inicia servidor con hot-reload

**Migración incluida:**
- `backend/prisma/migrations/20250109_add_sap_integration/migration.sql`

---

## 📊 Datos Precargados

Cada vez que inicias Docker se cargan:

### 3 Artículos SAP
- `INS-000347` - Sensor CTD Oceanográfico
- `INS-000512` - Datalogger Industrial  
- `INS-000789` - Estación Meteorológica

### 3 Fabricantes
- Sea-Bird Scientific
- Campbell Scientific
- Vaisala

### 9 Variables
- Temperature, Pressure, Conductivity, etc.

### 2 Instrumentos Completos
Con variables, protocolos, registros Modbus, etc.

---

## 🧪 Tests Incluidos

El script `docker-start.sh` ejecuta:
1. ✅ Backend health check
2. ✅ Artículos SAP cargados
3. ✅ Fabricantes cargados
4. ✅ Frontend responde

---

## 📝 Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs solo backend
docker-compose logs -f backend

# Ver logs solo frontend
docker-compose logs -f frontend

# Reiniciar servicio
docker-compose restart backend

# Parar todo
docker-compose down

# Parar y eliminar volúmenes (borra DB)
docker-compose down -v

# Entrar al contenedor backend
docker-compose exec backend sh

# Entrar a PostgreSQL
docker-compose exec db psql -U kb_user -d instruments

# Ver tablas
docker-compose exec db psql -U kb_user -d instruments -c "\dt"

# Ver artículos SAP
docker-compose exec db psql -U kb_user -d instruments -c "SELECT * FROM articles;"

# Ejecutar migración manualmente
docker-compose exec backend npx prisma migrate deploy

# Regenerar Prisma client
docker-compose exec backend npx prisma generate

# Ver estado de contenedores
docker-compose ps

# Ver uso de recursos
docker stats

# Reconstruir imágenes
docker-compose build --no-cache

# Limpiar todo y empezar de cero
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

## 🔧 Configuración Docker

### Backend (backend/Dockerfile)
- Node 20 Alpine
- PostgreSQL client instalado
- Prisma generado en build
- Hot-reload con tsx watch
- Uploads persistentes

### Frontend (frontend/Dockerfile)  
- Node 20 Alpine
- Vite con hot-reload
- Host 0.0.0.0 para acceso externo
- Polling activado para Windows

### Database
- PostgreSQL 16 Alpine
- Volumen persistente
- Healthcheck cada 5s
- Usuario: kb_user
- Password: kb_pass
- Database: instruments

### Networks
- Red aislada `instrumentkb-network`
- Comunicación interna por nombres de servicio

---

## 📦 Volúmenes

```yaml
# Persistencia PostgreSQL
postgres_data: /var/lib/postgresql/data

# Hot-reload Backend
./backend:/app (código)
./backend/uploads:/app/uploads (archivos)
/app/node_modules (cache)
/app/dist (cache)

# Hot-reload Frontend
./frontend:/app (código)
/app/node_modules (cache)
/app/dist (cache)
```

---

## 🐛 Troubleshooting

### Error: "Port already in use"
```bash
# Verificar qué usa el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5432

# Matar proceso (Windows)
taskkill /PID <PID> /F

# Cambiar puerto en docker-compose.yml
ports:
  - "3002:3000"  # Frontend
  - "3003:3001"  # Backend
```

### Backend no inicia
```bash
# Ver logs detallados
docker-compose logs backend

# Verificar migraciones
docker-compose exec backend npx prisma migrate status

# Reiniciar solo backend
docker-compose restart backend
```

### Frontend no se conecta a backend
```bash
# Verificar network
docker network inspect instrumentkb_instrumentkb-network

# Verificar variables de entorno
docker-compose exec frontend env | grep VITE

# Verificar que backend responde
curl http://localhost:3001/api/health
```

### Base de datos no persiste
```bash
# Verificar volumen
docker volume ls | findstr postgres

# Inspeccionar volumen
docker volume inspect instrumentkb_postgres_data

# Backup manual
docker-compose exec db pg_dump -U kb_user instruments > backup.sql
```

### Hot-reload no funciona
```bash
# Backend: Verificar que tsx watch está activo
docker-compose logs backend | findstr "watch"

# Frontend: Verificar Vite
docker-compose logs frontend | findstr "Vite"

# Reiniciar con rebuild
docker-compose down
docker-compose up -d --build
```

---

## 🔐 Seguridad (Para Producción)

**⚠️ En producción cambiar:**

```yaml
# docker-compose.yml
environment:
  POSTGRES_PASSWORD: ${DB_PASSWORD}  # Desde .env
  JWT_SECRET: ${JWT_SECRET}
  
# Usar secrets de Docker
secrets:
  db_password:
    file: ./secrets/db_password.txt
```

**Crear archivo `.env`:**
```env
DB_PASSWORD=strong_random_password_here
JWT_SECRET=another_strong_random_secret
```

---

## 📊 Monitoreo

### Ver métricas en tiempo real
```bash
docker stats
```

### Ver recursos por contenedor
```bash
docker stats instrumentkb-backend
docker stats instrumentkb-frontend
docker stats instrumentkb-db
```

### Ver logs con timestamps
```bash
docker-compose logs -f --timestamps
```

---

## 🚢 Deploy a Producción

### 1. Preparar ambiente

```bash
# Servidor
git clone <repo>
cd InstrumentKB

# Copiar archivos de configuración
cp .env.example .env
nano .env  # Editar con valores de producción
```

### 2. Configurar para producción

```yaml
# docker-compose.prod.yml
services:
  backend:
    restart: always
    environment:
      NODE_ENV: production
    command: sh -c "npx prisma migrate deploy && npm start"
  
  frontend:
    restart: always
    command: npm run build && npx serve -s dist -l 3000
```

### 3. Levantar

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Nginx reverse proxy (opcional)

```nginx
server {
    listen 80;
    server_name instrumentkb.empresa.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
    }
}
```

---

## ✅ Checklist Docker

- [x] Dockerfiles optimizados
- [x] docker-compose.yml configurado
- [x] Hot-reload backend (tsx watch)
- [x] Hot-reload frontend (Vite)
- [x] Migraciones automáticas
- [x] Seed data automático
- [x] Healthchecks
- [x] Networks aisladas
- [x] Volúmenes persistentes
- [x] Scripts de inicio (Windows + Linux)
- [x] Tests automáticos
- [x] .dockerignore optimizado
- [x] Logs accesibles
- [x] Documentación completa

---

## 🎯 Resumen

**InstrumentKB v2.0 con Docker está 100% funcional:**

✅ Inicia en 1 comando
✅ Aplica migraciones automáticamente
✅ Carga datos de ejemplo
✅ Hot-reload en desarrollo
✅ Tests incluidos
✅ Documentación completa

**Simplemente ejecuta:**
```bash
docker-start.sh  # o docker-start.bat en Windows
```

**¡Y abre http://localhost:3000!** 🚀

---

**InstrumentKB v2.0 - SAP Integration - Docker Ready** 🐳

