# 📊 InstrumentKB - Knowledge Base SAP

Sistema de gestión de catálogo SAP para instrumentos y equipos industriales. Plataforma interna para registrar, visualizar y buscar información técnica de artículos del catálogo.

## 🎯 Características

- ✅ Gestión completa de artículos con especificaciones técnicas detalladas
- ✅ Integración con códigos SAP (ItemCode)
- ✅ Variables de medición con precisión, rango y resolución
- ✅ Protocolos de comunicación (Modbus RTU/TCP, SDI-12, NMEA, etc.)
- ✅ Mapas de registros Modbus
- ✅ Salidas analógicas y digitales
- ✅ Gestión de documentos técnicos e imágenes
- ✅ Sistema de etiquetas y clasificación
- ✅ Búsqueda avanzada con múltiples filtros
- ✅ JSON viewer en tiempo real
- ✅ Exportación completa a JSON, Excel y SQL

## 🏗️ Arquitectura

### Backend
- **Node.js** + **Express.js** + **TypeScript**
- **PostgreSQL** (SQL puro)
- Storage local para documentos e imágenes
- API REST completa

### Frontend
- **React 18** + **Vite** + **TypeScript**
- **Mantine UI** v7 (componentes modernos)
- **react-json-view-lite** para visualización JSON
- **Axios** para comunicación con API

### Base de Datos
- **PostgreSQL** (SQL puro, sin ORM)
- 14 tablas relacionales con foreign keys
- Relaciones con CASCADE DELETE

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 20+
- PostgreSQL 16+
- npm

### Opción 1: Con Docker Compose (Recomendado)

```bash
# Levantar todos los servicios
docker-compose up -d

# La aplicación estará disponible en:
# Aplicación completa (Nginx): http://localhost:8080
# Frontend directo: http://localhost:3000 (desarrollo)
# Backend API directo: http://localhost:3002 (desarrollo)
# PostgreSQL: localhost:5434
```

**Nota:** En producción, usa el puerto 8080 (Nginx) que hace de proxy reverso para frontend y backend.

### Opción 2: Instalación Manual

#### 1. Base de Datos

```bash
# Crear base de datos PostgreSQL
createdb instrumentkb

# Importar esquema
psql -U postgres -d instrumentkb -f backend/schema.sql
```

#### 2. Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env con:
DATABASE_URL=postgresql://user:password@localhost:5432/instrumentkb
PORT=3002

# Compilar TypeScript
npm run build

# Iniciar servidor
npm run dev
```

El backend estará en `http://localhost:3002`

#### 3. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará en `http://localhost:3000`

## 📖 Uso

### Crear un Nuevo Artículo

1. Accede a `http://localhost:3000`
2. Haz clic en **"Nuevo Artículo"**
3. Completa el formulario en las pestañas:
   - **Básicos**: Información general, fabricante, modelo
   - **Especificaciones Técnicas**: Alimentación, dimensiones, etc.
   - **Variables**: Variables medidas con precisión y rangos
   - **Protocolos**: Configuración de comunicación
   - **I/O**: Salidas analógicas y digitales
   - **Modbus**: Mapa de registros Modbus
   - **SDI-12**: Comandos SDI-12
   - **NMEA**: Sentencias NMEA
   - **Documentos**: Archivos técnicos
   - **Imágenes**: Fotos del artículo
   - **Tags**: Etiquetas para clasificación
4. **Vista previa JSON** en tiempo real a la derecha
5. Haz clic en **"Guardar Artículo"**

### Buscar Artículos

En la página principal:
- Buscar por texto (ItemCode, descripción, modelo)
- Filtrar por tipo de artículo
- Filtrar por fabricante
- Ver resultados con paginación

### Exportar Datos

- **JSON**: Descarga todos los datos estructurados
- **Excel**: Descarga archivo XLSX con múltiples hojas
- **SQL**: Descarga instrucciones INSERT para PostgreSQL

## 🔌 API REST

### Endpoints Principales

#### Artículos
```
GET    /api/articles              # Listar todos (paginado)
GET    /api/articles/:id          # Obtener uno con relaciones
POST   /api/articles              # Crear (con relaciones anidadas)
PUT    /api/articles/:id          # Actualizar
DELETE /api/articles/:id          # Eliminar
GET    /api/articles/search       # Búsqueda avanzada
GET    /api/articles/meta/types   # Tipos de artículo
GET    /api/articles/meta/categories  # Categorías
GET    /api/articles/meta/families    # Familias
GET    /api/articles/meta/subfamilies # Subfamilias
```

#### Fabricantes
```
GET    /api/manufacturers         # Listar todos
POST   /api/manufacturers         # Crear nuevo
```

#### Variables
```
GET    /api/variables             # Listar todas
POST   /api/variables             # Crear nueva
```

#### Upload
```
POST   /api/upload/document       # Subir documento (multipart)
POST   /api/upload/image          # Subir imagen (multipart)
```

#### Exportación
```
GET    /api/export/json           # Exportar a JSON
GET    /api/export/excel          # Exportar a Excel
GET    /api/export/sql            # Exportar a SQL
```

## 🗄️ Esquema de Base de Datos

### Tablas Principales

- `manufacturers` - Fabricantes
- `articles` - Artículos del catálogo
- `variables_dict` - Diccionario de variables
- `article_variables` - Variables medidas por artículo
- `article_protocols` - Protocolos de comunicación
- `analog_outputs` - Salidas analógicas
- `digital_io` - Entradas/salidas digitales
- `modbus_registers` - Registros Modbus
- `sdi12_commands` - Comandos SDI-12
- `nmea_sentences` - Sentencias NMEA
- `documents` - Documentos técnicos
- `images` - Imágenes
- `tags` - Etiquetas

Todas las tablas están relacionadas con foreign keys y `ON DELETE CASCADE`.

## 📁 Estructura del Proyecto

```
InstrumentKB/
├── backend/
│   ├── src/
│   │   ├── routes/               # Rutas de la API
│   │   │   ├── articles.ts
│   │   │   ├── manufacturers.ts
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
│   │   ├── index.ts              # Servidor Express
│   │   └── db.ts                 # Cliente PostgreSQL
│   ├── uploads/
│   │   ├── documents/
│   │   └── images/
│   ├── schema.sql                # Esquema de base de datos
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ArticleList.tsx   # Listado + búsqueda
│   │   │   ├── ArticleNew.tsx    # Formulario con JSON viewer
│   │   │   └── ArticleDetail.tsx # Vista detallada
│   │   ├── App.tsx               # Componente principal
│   │   ├── main.tsx              # Punto de entrada
│   │   ├── api.ts                # Cliente API
│   │   └── types.ts              # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml            # Orquestación de servicios
├── nginx.conf                    # Configuración Nginx (producción)
├── .gitignore
└── README.md
```

## 🌐 Arquitectura Docker con Nginx

En el setup con Docker Compose, la aplicación usa **4 contenedores**:

1. **PostgreSQL** (puerto 5434) - Base de datos
2. **Backend** (puerto 3002) - API REST con Express
3. **Frontend** (puerto 3000) - Servidor de desarrollo Vite
4. **Nginx** (puerto 8080) - Proxy reverso

### Flujo de Peticiones en Producción

```
Usuario → http://localhost:8080 → Nginx
                                     ├─→ / → Frontend (puerto 3000)
                                     ├─→ /api → Backend (puerto 3002)
                                     └─→ /uploads → Backend archivos estáticos
```

**Ventajas de usar Nginx:**
- Un solo punto de entrada (puerto 8080)
- Gestión centralizada de CORS
- Compresión gzip automática
- Mejor rendimiento para archivos estáticos
- Fácil configurar SSL/HTTPS
- Balanceo de carga (si escala)

## 🛠️ Comandos Útiles

### Backend

```bash
# Desarrollo
npm run dev

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
```

## 🔧 Troubleshooting

### El backend no se conecta a la base de datos

Verifica que:
1. PostgreSQL esté ejecutándose
2. Las credenciales en `.env` sean correctas
3. La base de datos `instrumentkb` exista

```bash
# Test de conexión
psql -U postgres -d instrumentkb
```

### Puerto ya en uso

Cambia los puertos en:
- `backend/.env` → `PORT=3002`
- `frontend/vite.config.ts` → `server.port`
- `docker-compose.yml` → ports mapping

### Archivos no se suben

Verifica permisos en `backend/uploads/`:

```bash
chmod -R 755 backend/uploads
```

## 📝 Notas Técnicas

- **Base de datos**: SQL puro con `pg` (sin ORM)
- **Validación**: Validación en backend con PostgreSQL constraints
- **Relaciones**: Foreign keys con CASCADE DELETE
- **Transaccionalidad**: Operaciones críticas en transacciones
- **Archivos**: SHA256 calculado automáticamente
- **Búsqueda**: Queries optimizados con índices
- **JSON viewer**: Actualización en tiempo real con cada cambio

## 🔐 Seguridad

⚠️ **Esta versión NO incluye autenticación**. Es para uso interno.

Para producción, considera añadir:
- JWT o sesiones
- Rate limiting
- Validación de archivos (tipo MIME, tamaño)
- HTTPS
- CORS restrictivo
- SQL injection protection (usar parámetros preparados)

## 📜 Licencia

Proyecto interno. Todos los derechos reservados.

---

**Hecho con ❤️ para mejorar la gestión de instrumentación industrial**
