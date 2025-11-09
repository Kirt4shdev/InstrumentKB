# 🔄 InstrumentKB v2.0 - Integración SAP Business One (HANA)

## ✅ Cambios Implementados

### 🎯 Nueva Arquitectura: Artículos SAP como Nexo Central

El sistema ahora está estructurado para integrarse completamente con **SAP Business One (HANA)**:

```
Articles (SAP) 
    ↓
Instruments (Técnicos)
    ↓
Variables, Protocolos, Registros, Documentos, etc.
```

---

## 📦 Cambios en Base de Datos

### Nueva Tabla: `articles`

```sql
CREATE TABLE articles (
  article_id TEXT PRIMARY KEY,           -- Código SAP interno (ej. "INS-000347")
  sap_itemcode TEXT UNIQUE,              -- ItemCode en SAP Business One
  sap_description TEXT NOT NULL,         -- Descripción oficial SAP
  family TEXT,                           -- Familia (Sensores, Dataloggers, etc.)
  subfamily TEXT,                        -- Subfamilia (Oceanografía, Meteorología, etc.)
  internal_notes TEXT,                   -- Notas internas
  active BOOLEAN DEFAULT TRUE,           -- Estado del artículo
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla `instruments` Actualizada

```sql
ALTER TABLE instruments
  ADD COLUMN article_id TEXT REFERENCES articles(article_id)
    ON UPDATE CASCADE ON DELETE SET NULL;
```

**Relación:** Cada instrumento puede estar vinculado a un artículo SAP (opcional pero recomendado).

---

## 🔌 Nuevos Endpoints API

### `/api/articles` - CRUD Completo

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/articles` | Lista todos los artículos SAP (filtros: active, family, search) |
| `GET` | `/api/articles/:id` | Obtiene un artículo con sus instrumentos asociados |
| `POST` | `/api/articles` | Crea un nuevo artículo SAP |
| `PUT` | `/api/articles/:id` | Actualiza un artículo existente |
| `DELETE` | `/api/articles/:id` | Elimina un artículo (instrumentos quedan sin vincular) |
| `GET` | `/api/articles/meta/families` | Obtiene familias únicas |
| `GET` | `/api/articles/meta/subfamilies` | Obtiene subfamilias (filtrado por familia opcional) |

#### Ejemplo de Creación:

```json
POST /api/articles
{
  "article_id": "INS-000347",
  "sap_itemcode": "A1000347",
  "sap_description": "Sensor CTD Oceanográfico Sea-Bird SBE 37-SI",
  "family": "Sensores",
  "subfamily": "Oceanografía",
  "internal_notes": "Sensor de alta precisión para mediciones submarinas",
  "active": true
}
```

### Endpoints Actualizados

#### `/api/instruments/*`
Todos los endpoints ahora incluyen el campo `article` en las respuestas:

```json
{
  "instrument_id": 1,
  "article_id": "INS-000347",
  "article": {
    "article_id": "INS-000347",
    "sap_itemcode": "A1000347",
    "sap_description": "Sensor CTD...",
    "family": "Sensores",
    "subfamily": "Oceanografía"
  },
  "manufacturer": {...},
  "model": "SBE 37-SI",
  ...
}
```

#### `/api/search/instruments`
Nuevo parámetro de búsqueda:
- `article_id`: Filtrar por artículo SAP específico
- Búsqueda de texto (`q`) ahora incluye `sap_description`

---

## 📤 Exportación Actualizada (v2.0)

### JSON Export

```json
{
  "exported_at": "2025-11-09T...",
  "version": "2.0",
  "sap_integration": true,
  "data": {
    "articles": [...],        // ← PRIMERO
    "manufacturers": [...],
    "instruments": [...],
    "variables": [...],
    ...
  }
}
```

**Orden de exportación garantizado:**
1. Articles (SAP)
2. Manufacturers
3. Variables
4. Instruments
5. Resto de datos

### SQL Export

El archivo SQL ahora incluye:

```sql
-- InstrumentKB SQL Export (with SAP Integration)
-- Version: 2.0

-- Articles (SAP Integration) - PRIMERO
INSERT INTO articles (article_id, sap_itemcode, sap_description, ...) VALUES ...;

-- Manufacturers
INSERT INTO manufacturers (...) VALUES ...;

-- Instruments (con article_id)
INSERT INTO instruments (instrument_id, article_id, manufacturer_id, ...) VALUES ...;
```

---

## 🎨 Cambios en Frontend

### 1. Listado de Instrumentos (`/`)

**Nueva columna:** "Artículo SAP"
- Muestra `article_id` y descripción SAP
- Badge "Sin artículo SAP" si no está vinculado

**Nuevo filtro:** Selector de artículos SAP con búsqueda

<img width="800" alt="Listado con artículos SAP" src="...">

### 2. Formulario de Alta (`/new`)

**Nuevo bloque superior:** Selector de Artículo SAP
- Dropdown searchable con todos los artículos activos
- Botón "+ Nuevo Artículo SAP" abre modal

**Modal de creación rápida:**
- Article ID (requerido)
- SAP ItemCode
- Descripción SAP (requerida)
- Familia / Subfamilia
- Notas internas
- Estado activo/inactivo

**JSON Viewer actualizado:** Muestra artículo SAP en la previsualización

### 3. Vista de Detalle (`/instrument/:id`)

**Nuevo bloque destacado:** Información del Artículo SAP
- Badge con article_id y sap_itemcode
- Descripción completa
- Familia y subfamilia
- Notas internas
- Estado (Activo/Inactivo)

---

## 🗄️ Datos de Ejemplo (Seed)

El comando `npm run seed` ahora crea:

### 3 Artículos SAP:
1. **INS-000347** - Sensor CTD Oceanográfico Sea-Bird SBE 37-SI
2. **INS-000512** - Datalogger Industrial Campbell Scientific CR1000X
3. **INS-000789** - Estación Meteorológica Completa Vaisala WXT536

Todos los instrumentos de ejemplo están vinculados a estos artículos.

---

## 🚀 Migración desde v1.0

### Paso 1: Generar Migración de Base de Datos

```bash
cd backend
npx prisma migrate dev --name add_articles_sap_integration
```

Esto creará la tabla `articles` y añadirá el campo `article_id` a `instruments`.

### Paso 2: (Opcional) Crear Artículos SAP para Instrumentos Existentes

```sql
-- Crear artículos genéricos para instrumentos sin vincular
INSERT INTO articles (article_id, sap_description, active)
SELECT 
  'INS-' || LPAD(instrument_id::TEXT, 6, '0'),
  manufacturer.name || ' ' || model,
  TRUE
FROM instruments
JOIN manufacturers ON instruments.manufacturer_id = manufacturers.manufacturer_id;

-- Vincular instrumentos a sus artículos
UPDATE instruments
SET article_id = 'INS-' || LPAD(instrument_id::TEXT, 6, '0');
```

### Paso 3: Cargar Datos de Ejemplo

```bash
npm run seed
```

---

## 📋 Checklist de Integración SAP

- [x] Tabla `articles` creada
- [x] Campo `article_id` en `instruments`
- [x] Endpoints CRUD de `/api/articles`
- [x] Endpoints `/api/instruments` incluyen article
- [x] Búsqueda actualizada con filtro de artículos
- [x] Exportación JSON v2.0 con articles primero
- [x] Exportación SQL con orden correcto
- [x] Script de importación soporta articles
- [x] Listado muestra artículos SAP
- [x] Formulario permite crear/vincular artículos
- [x] Vista detalle muestra info del artículo SAP
- [x] Seed data incluye artículos de ejemplo

---

## 🔄 Flujo de Trabajo Recomendado

### Crear un Nuevo Instrumento

1. **En SAP:** Crear el artículo (ItemCode, descripción, familia)
2. **En InstrumentKB:**
   - Ir a `/new`
   - Crear artículo SAP con los datos de SAP
   - Vincular artículo al instrumento técnico
   - Completar especificaciones técnicas
   - Guardar

### Importar desde Local a Producción

1. **Exportar:** Botón "Exportar JSON" o "Exportar SQL"
2. **Transferir:** Copiar archivo + carpeta `uploads/`
3. **Importar:**
   ```bash
   # JSON
   npm run import -- export.json
   
   # SQL
   psql -U user -d db -f export.sql
   ```

---

## 📊 Ejemplo de Estructura Completa

```json
{
  "article_id": "INS-000347",
  "sap_itemcode": "A1000347",
  "sap_description": "Sensor CTD Oceanográfico Sea-Bird SBE 37-SI MicroCAT",
  "family": "Sensores",
  "subfamily": "Oceanografía",
  "active": true,
  "instruments": [
    {
      "instrument_id": 1,
      "model": "SBE 37-SI",
      "variant": "MicroCAT",
      "manufacturer": {
        "name": "Sea-Bird Scientific"
      },
      "variables": [
        {
          "variable": { "name": "Temperature" },
          "range_min": -5,
          "range_max": 35,
          "unit": "°C",
          "accuracy_abs": 0.002
        }
      ],
      "protocols": [
        {
          "type": "ModbusRTU",
          "baudrate": 9600
        }
      ],
      "modbus_registers": [
        {
          "address": 0,
          "name": "Temperature",
          "datatype": "FLOAT32",
          "rw": "R"
        }
      ]
    }
  ]
}
```

---

## 🔗 Compatibilidad con SAP Business One

### Campos Mapeados

| InstrumentKB | SAP Business One |
|--------------|------------------|
| `article_id` | Código interno personalizado |
| `sap_itemcode` | ItemCode |
| `sap_description` | ItemName |
| `family` | ItemsGroupCode (personalizado) |
| `subfamily` | Categoría (personalizado) |
| `active` | Validado (Y/N) |

### Sincronización (Futura)

Para sincronización automática con SAP, se puede implementar:
- **Webhook** desde SAP cuando se crea un artículo
- **API Service Layer** para consultas bidireccionales
- **Scheduled job** para sincronización periódica

---

## 📞 Soporte

Para integración avanzada con SAP o preguntas técnicas, consultar la documentación de SAP Business One Service Layer.

---

**InstrumentKB v2.0 - Powered by SAP Integration** 🚀

