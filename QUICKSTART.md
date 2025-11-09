# 🚀 Guía de Inicio Rápido - InstrumentKB

## Instalación Local (Sin Docker)

### 1. Instalar PostgreSQL

**Windows:**
- Descargar desde https://www.postgresql.org/download/windows/
- Instalar y anotar la contraseña del usuario `postgres`

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Crear la Base de Datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos y usuario
CREATE DATABASE instruments;
CREATE USER kb_user WITH PASSWORD 'kb_pass';
GRANT ALL PRIVILEGES ON DATABASE instruments TO kb_user;
\q
```

### 3. Configurar Backend

```bash
# Navegar a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
echo "DATABASE_URL=postgresql://kb_user:kb_pass@localhost:5432/instruments" > .env
echo "STORAGE_DRIVER=local" >> .env
echo "STORAGE_PATH=./uploads" >> .env
echo "PORT=3001" >> .env

# Crear directorio de uploads
mkdir -p uploads/documents uploads/images

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init

# (Opcional) Cargar datos de ejemplo
npm run seed
# O manualmente:
npx tsx prisma/seed.ts

# Iniciar servidor
npm run dev
```

El backend estará en: http://localhost:3001

### 4. Configurar Frontend

```bash
# Abrir nueva terminal y navegar a frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará en: http://localhost:3000

## Instalación con Docker Compose

### Opción A: Script Automático

**Windows:**
```cmd
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

### Opción B: Manual

```bash
# Levantar servicios
docker-compose up -d

# Esperar 10 segundos para que PostgreSQL esté listo

# Ejecutar migraciones
docker-compose exec backend npx prisma migrate dev --name init

# (Opcional) Cargar datos de ejemplo
docker-compose exec backend npx tsx prisma/seed.ts
```

## Verificar Instalación

1. **Backend**: Abrir http://localhost:3001/api/health
   - Debe mostrar: `{"status":"ok"}`

2. **Frontend**: Abrir http://localhost:3000
   - Debe aparecer la interfaz de InstrumentKB

3. **Base de Datos**: 
   ```bash
   # Verificar conexión
   psql -U kb_user -d instruments -h localhost
   # Contraseña: kb_pass
   
   # Listar tablas
   \dt
   
   # Salir
   \q
   ```

## Primeros Pasos

### 1. Crear tu Primer Fabricante

1. Abre la consola de desarrollo del navegador (F12)
2. Ejecuta:
```javascript
fetch('http://localhost:3001/api/manufacturers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Mi Fabricante',
    country: 'España',
    website: 'https://ejemplo.com'
  })
}).then(r => r.json()).then(console.log)
```

O desde el frontend, al crear un nuevo instrumento, el fabricante se puede seleccionar del dropdown.

### 2. Crear una Variable

```javascript
fetch('http://localhost:3001/api/variables', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Temperatura',
    unit_default: '°C',
    description: 'Temperatura ambiente'
  })
}).then(r => r.json()).then(console.log)
```

### 3. Crear tu Primer Instrumento

Desde la interfaz web:
1. Click en "Nuevo Instrumento"
2. Selecciona el fabricante
3. Rellena los campos básicos (modelo, etc.)
4. Añade variables en la pestaña "Variables"
5. Observa el JSON en tiempo real a la derecha
6. Click en "Guardar Instrumento"

## Comandos Útiles

### Backend

```bash
# Ver base de datos en navegador
npx prisma studio

# Crear nueva migración tras cambios
npx prisma migrate dev --name descripcion_del_cambio

# Resetear base de datos (¡CUIDADO! Borra todos los datos)
npx prisma migrate reset

# Ver logs en Docker
docker-compose logs -f backend
```

### Frontend

```bash
# Build para producción
npm run build

# Preview del build
npm run preview

# Ver logs en Docker
docker-compose logs -f frontend
```

### Base de Datos

```bash
# Backup de la base de datos
pg_dump -U kb_user -h localhost instruments > backup.sql

# Restaurar desde backup
psql -U kb_user -h localhost instruments < backup.sql

# Exportar datos como JSON desde la API
curl http://localhost:3001/api/export/json -o export.json

# Exportar datos como SQL desde la API
curl http://localhost:3001/api/export/sql -o export.sql
```

## Troubleshooting Común

### Error: "Cannot find module '@prisma/client'"

```bash
cd backend
npx prisma generate
```

### Error: "ECONNREFUSED 127.0.0.1:5432"

PostgreSQL no está ejecutándose. Inícialo:

**Windows:**
```cmd
net start postgresql-x64-16
```

**Linux:**
```bash
sudo systemctl start postgresql
```

**Docker:**
```bash
docker-compose up db -d
```

### Error: "Port 3000 is already in use"

Cambia el puerto en `frontend/vite.config.ts`:

```typescript
server: {
  port: 3002  // Cambiar a otro puerto
}
```

### Frontend no se conecta al backend

Verifica que en `frontend/.env`:
```
VITE_API_URL=http://localhost:3001/api
```

Y que el backend esté corriendo en el puerto 3001.

### Archivos subidos no se ven

Verifica permisos:
```bash
chmod -R 755 backend/uploads
```

## Datos de Ejemplo

Después de ejecutar el seed, tendrás:

- 3 Fabricantes (Sea-Bird Scientific, Campbell Scientific, Vaisala)
- 9 Variables (Temperature, Pressure, Conductivity, etc.)
- 2 Instrumentos completos:
  - Sea-Bird SBE 37-SI (CTD)
  - Campbell CR1000X (Datalogger)

## Próximos Pasos

1. Explora la interfaz web
2. Crea tus propios instrumentos
3. Prueba las búsquedas y filtros
4. Exporta datos a JSON/SQL
5. Personaliza según tus necesidades

## Recursos

- **Prisma Docs**: https://www.prisma.io/docs
- **Mantine UI**: https://mantine.dev
- **Express.js**: https://expressjs.com
- **React**: https://react.dev

---

¿Necesitas ayuda? Revisa el README principal o contacta al equipo de desarrollo.

