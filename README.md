# 📊 InstrumentKB - Knowledge Base de Instrumentos de Medida

Plataforma interna para registrar, visualizar y buscar información técnica de **instrumentos de medida** (sensores, dataloggers, transmisores, etc.) utilizados en proyectos industriales.

## 🎯 Características

- ✅ Gestión completa de instrumentos con especificaciones técnicas detalladas
- ✅ Variables de medición con precisión, rango y resolución
- ✅ Protocolos de comunicación (Modbus RTU/TCP, SDI-12, NMEA, etc.)
- ✅ Mapas de registros Modbus
- ✅ Salidas analógicas y digitales
- ✅ Gestión de documentos técnicos y imágenes
- ✅ Sistema de etiquetas y trazabilidad
- ✅ Búsqueda avanzada con múltiples filtros
- ✅ **JSON viewer en tiempo real** mientras se edita
- ✅ **Exportación completa a JSON y SQL**

## 🏗️ Arquitectura

### Backend
- **Node.js** + **Express.js**
- **Prisma** ORM con **PostgreSQL**
- **Zod** para validación
- Storage local o S3-compatible
- API REST completa

### Frontend
- **React 18** + **Vite**
- **Mantine UI** (componentes modernos)
- **React Hook Form** para formularios
- **react-json-view-lite** para visualización JSON en tiempo real
- **Axios** para comunicación con API

### Base de Datos
- **PostgreSQL** (SQL puro, sin JSONB)
- 14 tablas relacionales con todas las especificaciones

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 20+ 
- PostgreSQL 16+
- npm o yarn

### Opción 1: Con Docker Compose (Recomendado)

```bash
# Clonar o descomprimir el proyecto
cd InstrumentKB

# Levantar todos los servicios
docker-compose up -d

# Esperar a que los servicios estén listos
# El frontend estará en http://localhost:3000
# El backend en http://localhost:3001
# PostgreSQL en localhost:5432
```

**Aplicar migraciones de base de datos:**

```bash
cd backend
docker-compose exec backend npx prisma migrate dev --name init
```

### Opción 2: Instalación Manual

#### 1. Base de datos

```bash
# Crear base de datos PostgreSQL
createdb instruments
# O mediante psql:
psql -U postgres -c "CREATE DATABASE instruments;"
```

#### 2. Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar y configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará disponible en `http://localhost:3001`

#### 3. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## 📖 Uso

### Crear un Nuevo Instrumento

1. Accede a la aplicación en `http://localhost:3000`
2. Haz clic en **"Nuevo Instrumento"**
3. Completa el formulario en las diferentes pestañas:
   - **Básicos**: Modelo, fabricante, especificaciones eléctricas y físicas
   - **Variables**: Variables medidas con precisión y rangos
   - **Protocolos**: Configuración de comunicación
   - **I/O**: Salidas analógicas y digitales
   - **Modbus**: Mapa de registros Modbus
   - **Tags**: Etiquetas para clasificación
4. **Vista previa JSON en tiempo real** a la derecha
5. Haz clic en **"Guardar Instrumento"**

### Buscar Instrumentos

En la página principal puedes:
- Buscar por texto (modelo, categoría)
- Filtrar por fabricante
- Filtrar por protocolo
- Ver resultados con paginación

### Ver Detalles

Haz clic en el icono 👁️ para ver todos los detalles del instrumento organizados en pestañas.

### Exportar Datos

#### Exportar Todo (JSON o SQL)

En la página principal:
- **Exportar JSON**: Descarga todos los datos en formato JSON
- **Exportar SQL**: Descarga instrucciones INSERT de SQL

#### Exportar un Instrumento

En la vista de detalle:
- **Exportar JSON**: Descarga el instrumento completo con todas sus relaciones

## 🔌 API REST

### Endpoints Principales

#### Fabricantes
```
GET    /api/manufacturers       # Listar todos
POST   /api/manufacturers       # Crear nuevo
```

#### Instrumentos
```
GET    /api/instruments         # Listar todos (paginado)
GET    /api/instruments/:id     # Obtener uno con relaciones
POST   /api/instruments         # Crear (con relaciones anidadas)
PUT    /api/instruments/:id     # Actualizar
DELETE /api/instruments/:id     # Eliminar
```

#### Variables
```
GET    /api/variables           # Listar todas
POST   /api/variables           # Crear nueva
POST   /api/variables/instrument-variables  # Vincular a instrumento
```

#### Búsqueda
```
GET    /api/search/instruments  # Búsqueda avanzada
  Query params:
    - q: texto libre
    - manufacturer_id: filtro por fabricante
    - variable_name: filtro por variable
    - protocol_type: filtro por protocolo
    - accuracy_abs_lte: precisión menor o igual a
    - modbus_address: filtro por dirección Modbus
    - tags[]: array de etiquetas
    - page, limit: paginación
```

#### Upload
```
POST   /api/upload/document     # Subir documento (multipart)
POST   /api/upload/image        # Subir imagen (multipart)
DELETE /api/upload/document/:id # Eliminar documento
DELETE /api/upload/image/:id    # Eliminar imagen
```

#### Exportación
```
GET    /api/export/json         # Exportar todos los datos a JSON
GET    /api/export/json/:id     # Exportar un instrumento a JSON
GET    /api/export/sql          # Exportar todos los datos a SQL
```

## 🗄️ Esquema de Base de Datos

### Tablas Principales

- `manufacturers` - Fabricantes
- `instruments` - Instrumentos (datos básicos)
- `variables_dict` - Diccionario de variables
- `instrument_variables` - Variables medidas por instrumento
- `instrument_protocols` - Protocolos de comunicación
- `analog_outputs` - Salidas analógicas
- `digital_io` - Entradas/salidas digitales
- `modbus_registers` - Registros Modbus
- `sdi12_commands` - Comandos SDI-12
- `nmea_sentences` - Sentencias NMEA
- `documents` - Documentos técnicos
- `images` - Imágenes
- `tags` - Etiquetas
- `provenance` - Trazabilidad de datos

Todas las tablas están relacionadas con foreign keys y ON DELETE CASCADE.

## 📤 Exportación de Datos

### Para Transferir a Producción

#### Opción 1: JSON (Recomendado para importación programática)

```bash
# Desde el navegador o mediante curl:
curl http://localhost:3001/api/export/json -o instrumentkb-export.json
```

Este archivo contiene:
- Todos los datos estructurados
- Metadata (fecha de exportación, versión)
- Fácil de importar mediante script

#### Opción 2: SQL (Para importación directa a PostgreSQL)

```bash
# Desde el navegador o mediante curl:
curl http://localhost:3001/api/export/sql -o instrumentkb-export.sql

# Importar en producción:
psql -U usuario -d base_datos_produccion -f instrumentkb-export.sql
```

### Script de Importación JSON (Ejemplo)

```javascript
// import-data.js
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const data = JSON.parse(fs.readFileSync('instrumentkb-export.json'));

async function importData() {
  // Importar fabricantes
  for (const mfg of data.data.manufacturers) {
    await prisma.manufacturer.create({ data: mfg });
  }
  
  // Importar variables
  for (const variable of data.data.variables) {
    await prisma.variableDict.create({ data: variable });
  }
  
  // ... continuar con el resto de tablas
}

importData();
```

## 🛠️ Comandos Útiles

### Backend

```bash
# Generar cliente Prisma tras cambios en schema
npx prisma generate

# Crear migración
npx prisma migrate dev --name descripcion_cambio

# Ver base de datos en navegador
npx prisma studio

# Build para producción
npm run build

# Ejecutar producción
npm start
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

### Docker

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down

# Reiniciar un servicio
docker-compose restart backend

# Entrar al contenedor
docker-compose exec backend sh
```

## 📁 Estructura del Proyecto

```
InstrumentKB/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Esquema de base de datos
│   ├── src/
│   │   ├── routes/            # Rutas de la API
│   │   │   ├── manufacturers.ts
│   │   │   ├── instruments.ts
│   │   │   ├── variables.ts
│   │   │   ├── protocols.ts
│   │   │   ├── analogOutputs.ts
│   │   │   ├── digitalIO.ts
│   │   │   ├── modbusRegisters.ts
│   │   │   ├── sdi12Commands.ts
│   │   │   ├── nmeaSentences.ts
│   │   │   ├── upload.ts
│   │   │   ├── search.ts
│   │   │   └── export.ts
│   │   ├── index.ts           # Punto de entrada
│   │   └── prisma.ts          # Cliente Prisma
│   ├── uploads/               # Archivos subidos
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── InstrumentList.tsx    # Listado + búsqueda
│   │   │   ├── InstrumentNew.tsx     # Formulario con JSON viewer
│   │   │   └── InstrumentDetail.tsx  # Vista detallada
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── api.ts             # Cliente API
│   │   └── types.ts           # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## 🧪 Ejemplo de Instrumento Completo

```json
{
  "manufacturer_id": 1,
  "model": "CTD-10",
  "variant": "v2.1",
  "category": "Sensor CTD",
  "power_supply_min_v": 9,
  "power_supply_max_v": 28,
  "ip_rating": "IP68",
  "variables": [
    {
      "variable_id": 1,
      "range_min": 0,
      "range_max": 100,
      "unit": "m",
      "accuracy_abs": 0.05,
      "resolution": 0.001
    }
  ],
  "protocols": [
    {
      "type": "ModbusRTU",
      "baudrate": 9600,
      "databits": 8,
      "parity": "N",
      "stopbits": 1
    }
  ],
  "modbus_registers": [
    {
      "function_code": 3,
      "address": 0,
      "name": "Temperature",
      "datatype": "FLOAT32",
      "unit": "°C",
      "rw": "R"
    }
  ],
  "tags": ["sensor", "underwater", "temperature"]
}
```

## 🔧 Troubleshooting

### El backend no se conecta a la base de datos

Verifica que:
1. PostgreSQL esté ejecutándose
2. Las credenciales en `.env` sean correctas
3. La base de datos `instruments` exista

```bash
# Test de conexión
psql -U kb_user -d instruments -h localhost
```

### Error "Prisma Client not generated"

```bash
cd backend
npx prisma generate
```

### Puerto ya en uso

Cambia los puertos en:
- `backend/.env` → `PORT=3001`
- `frontend/vite.config.ts` → `server.port`
- `docker-compose.yml` → ports mapping

### Archivos no se suben

Verifica permisos en `backend/uploads/`:

```bash
chmod -R 755 backend/uploads
```

## 📝 Notas de Desarrollo

- **Validación**: Zod en backend, validación nativa de Mantine en frontend
- **Relaciones**: Todas usan Prisma relations con cascade delete
- **Transaccionalidad**: Crear instrumento es transaccional (todo o nada)
- **Archivos**: SHA256 calculado automáticamente al subir documentos
- **Búsqueda**: Usa Prisma filters con case-insensitive
- **JSON viewer**: Se actualiza en tiempo real con cada cambio en el formulario

## 🔐 Seguridad

⚠️ **Esta versión NO incluye autenticación**. Es para uso interno en el PC de un junior.

Para producción, considera añadir:
- JWT o sesiones
- Rate limiting
- Validación de archivos (tipo MIME, tamaño)
- HTTPS
- CORS restrictivo
- SQL injection protection (ya incluido con Prisma)

## 📜 Licencia

Proyecto interno. Todos los derechos reservados.

## 🤝 Contribución

Para añadir nuevos campos o tablas:

1. Editar `backend/prisma/schema.prisma`
2. Crear migración: `npx prisma migrate dev --name nombre_cambio`
3. Actualizar tipos en `frontend/src/types.ts`
4. Actualizar rutas y componentes correspondientes

## 📧 Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.

---

**Hecho con ❤️ para mejorar la gestión de instrumentación industrial**

