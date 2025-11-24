# InstrumentKB Backend - SQL Nativo

Backend para InstrumentKB usando **PostgreSQL puro y duro** (¡sin Prisma!).

## 🚀 Características

- ✅ **SQL Nativo** con el paquete `pg` de PostgreSQL
- ✅ **Sin ORM** - Queries SQL directas y claras
- ✅ **Transacciones** manualmente controladas
- ✅ **Pool de conexiones** optimizado
- ✅ **TypeScript** para type safety
- ✅ **Express.js** para el servidor REST

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 12+
- npm o yarn

## 🔧 Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar base de datos

Crear archivo `.env`:

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/instrumentkb
PORT=3002
STORAGE_PATH=./uploads
```

### 3. Crear la base de datos y las tablas

```bash
# Crear la base de datos
createdb instrumentkb

# O con psql:
psql -U postgres -c "CREATE DATABASE instrumentkb;"

# Ejecutar el esquema SQL
psql -U postgres -d instrumentkb -f schema.sql
```

### 4. Iniciar el servidor

```bash
# Desarrollo (con hot reload)
npm run dev

# Producción
npm run build
npm start
```

## 🗄️ Estructura de la Base de Datos

El esquema completo está en `schema.sql`. Tablas principales:

- `articles` - Tabla principal de artículos (instrumentos, cables, sensores, etc.)
- `manufacturers` - Fabricantes
- `variables_dict` - Diccionario de variables medibles
- `article_variables` - Variables asociadas a cada artículo
- `article_protocols` - Protocolos de comunicación (Modbus, SDI-12, NMEA, etc.)
- `modbus_registers` - Registros Modbus
- `sdi12_commands` - Comandos SDI-12
- `nmea_sentences` - Sentencias NMEA
- `documents` - Documentos técnicos
- `images` - Imágenes
- `tags` - Etiquetas
- `provenance` - Trazabilidad de datos

## 📝 Migraciones

**No hay migraciones automáticas** porque no usamos Prisma. Para cambios en el esquema:

1. Edita `schema.sql` con los cambios necesarios
2. Crea un archivo de migración SQL manual
3. Aplica los cambios con `psql`:

```bash
psql -U postgres -d instrumentkb -f migration_YYYYMMDD.sql
```

## 🔍 Queries de Ejemplo

### Crear un artículo

```sql
INSERT INTO articles (
  article_id, sap_description, article_type, manufacturer_id, model
) VALUES (
  'INS-12345678-001', 'Sensor de temperatura PT100', 'INSTRUMENTO', 1, 'PT100-X'
) RETURNING *;
```

### Buscar artículos por tipo

```sql
SELECT a.*, m.name as manufacturer_name
FROM articles a
LEFT JOIN manufacturers m ON a.manufacturer_id = m.manufacturer_id
WHERE a.article_type = 'INSTRUMENTO'
AND a.active = true
ORDER BY a.created_at DESC;
```

### Obtener artículo con todas sus relaciones

```sql
-- Artículo base
SELECT * FROM articles WHERE article_id = 'INS-12345678-001';

-- Variables
SELECT av.*, v.name, v.unit_default
FROM article_variables av
JOIN variables_dict v ON av.variable_id = v.variable_id
WHERE av.article_id = 'INS-12345678-001';

-- Protocolos
SELECT * FROM article_protocols WHERE article_id = 'INS-12345678-001';

-- Documentos
SELECT * FROM documents WHERE article_id = 'INS-12345678-001';
```

## 🛠️ API Endpoints

### Artículos
- `GET /api/articles` - Listar artículos (con paginación y filtros)
- `GET /api/articles/:id` - Obtener artículo por ID
- `POST /api/articles` - Crear artículo
- `PUT /api/articles/:id` - Actualizar artículo
- `DELETE /api/articles/:id` - Eliminar artículo
- `GET /api/articles/meta/types` - Tipos de artículos disponibles
- `GET /api/articles/meta/families` - Familias únicas
- `GET /api/articles/meta/categories` - Categorías únicas

### Fabricantes
- `GET /api/manufacturers` - Listar fabricantes
- `POST /api/manufacturers` - Crear fabricante

### Variables
- `GET /api/variables` - Listar variables del diccionario
- `POST /api/variables` - Crear variable

### Protocolos
- `GET /api/protocols` - Listar protocolos
- `POST /api/protocols` - Crear protocolo
- `DELETE /api/protocols/:id` - Eliminar protocolo

### Registros Modbus
- `GET /api/modbus-registers` - Listar registros Modbus
- `POST /api/modbus-registers` - Crear registro Modbus
- `DELETE /api/modbus-registers/:id` - Eliminar registro Modbus

### Comandos SDI-12
- `GET /api/sdi12-commands` - Listar comandos SDI-12
- `POST /api/sdi12-commands` - Crear comando SDI-12
- `DELETE /api/sdi12-commands/:id` - Eliminar comando SDI-12

### Sentencias NMEA
- `GET /api/nmea-sentences` - Listar sentencias NMEA
- `POST /api/nmea-sentences` - Crear sentencia NMEA
- `DELETE /api/nmea-sentences/:id` - Eliminar sentencia NMEA

### Exportación
- `GET /api/export/json` - Exportar toda la BD como JSON
- `GET /api/export/json/:id` - Exportar un artículo como JSON
- `GET /api/export/excel` - Exportar toda la BD como Excel
- `GET /api/export/sql` - Exportar toda la BD como SQL

### Upload
- `POST /api/upload/document` - Subir documento
- `POST /api/upload/image` - Subir imagen
- `DELETE /api/upload/document/:id` - Eliminar documento
- `DELETE /api/upload/image/:id` - Eliminar imagen

### Búsqueda
- `GET /api/search/instruments` - Búsqueda avanzada de instrumentos

### Health
- `GET /api/health` - Estado del servidor y conexión a BD

## 🔒 Seguridad

- Pool de conexiones con límites configurados
- Queries parametrizadas para prevenir SQL injection
- Validación con Zod en endpoints críticos
- Transacciones para operaciones complejas

## 📊 Rendimiento

- Pool de 20 conexiones concurrentes
- Queries optimizadas con índices
- Paginación en listados grandes
- Connection pooling con reintentos

## 🐛 Debug

Para ver los queries ejecutados, revisa la consola. Cada query muestra:
- El SQL ejecutado
- Duración
- Número de filas afectadas

## 🚨 Solución de Problemas

### Error: "relation does not exist"
- Ejecuta `schema.sql` para crear las tablas

### Error: "connection refused"
- Verifica que PostgreSQL esté corriendo
- Revisa el `DATABASE_URL` en `.env`

### Error: "permission denied"
- El usuario de PostgreSQL necesita permisos:
```sql
GRANT ALL PRIVILEGES ON DATABASE instrumentkb TO tu_usuario;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tu_usuario;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tu_usuario;
```

## 📚 Recursos

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [node-postgres (pg) Documentation](https://node-postgres.com/)
- [Express.js Documentation](https://expressjs.com/)

## 🎉 ¡Ya no hay Prisma!

Este backend usa SQL puro y duro. Sin magia negra, sin ORMs, solo PostgreSQL en su máxima expresión. 🚀

---

**Versión**: 2.0.0 - SQL Nativo
**Última actualización**: 2025




