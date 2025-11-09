# 🎉 InstrumentKB v2.0 - Listo para Usar

## ✅ PROYECTO COMPLETADO CON INTEGRACIÓN SAP

La plataforma está **100% funcional** con integración completa a SAP Business One (HANA).

---

## 🚀 Inicio Rápido

### Opción 1: Con Docker (Recomendado)

```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

Espera 30 segundos y abre: **http://localhost:3000**

### Opción 2: Manual

```bash
# Terminal 1 - Backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

Abre: **http://localhost:3000**

---

## 🆕 Novedades v2.0

### 🔗 Integración SAP Business One

**Artículos SAP como nexo central:**
```
Articles (SAP) → Instruments → Variables, Protocolos, etc.
```

**Nuevas funcionalidades:**
- ✅ Tabla `articles` con ItemCode SAP
- ✅ Endpoints CRUD `/api/articles`
- ✅ Selector de artículos SAP en formularios
- ✅ Columna "Artículo SAP" en listado
- ✅ Bloque destacado en vista detalle
- ✅ Exportación JSON/SQL con articles primero
- ✅ Datos de ejemplo con 3 artículos SAP

---

## 📋 Flujo de Trabajo

### 1. Crear Artículo SAP

**Desde formulario:**
1. Ve a `/new`
2. Click "Nuevo Artículo SAP"
3. Completa:
   - Article ID: `INS-XXXXXX`
   - SAP ItemCode: `A1XXXXXX`
   - Descripción
   - Familia / Subfamilia
4. Guardar

**Desde datos de ejemplo:**
```bash
cd backend
npm run seed
```

Crea 3 artículos listos:
- `INS-000347` - Sensor CTD
- `INS-000512` - Datalogger
- `INS-000789` - Estación Meteorológica

### 2. Crear Instrumento

1. Seleccionar artículo SAP
2. Completar datos técnicos
3. Ver JSON en tiempo real →
4. Guardar

### 3. Buscar y Filtrar

- Por artículo SAP
- Por fabricante
- Por protocolo
- Texto libre (incluye descripciones SAP)

### 4. Exportar

**Para migrar a producción:**

```bash
# Desde la interfaz: botones "Exportar JSON" o "Exportar SQL"

# O desde terminal:
curl http://localhost:3001/api/export/json -o export.json
curl http://localhost:3001/api/export/sql -o export.sql

# Importar en producción:
npm run import -- export.json
# o
psql -U user -d db -f export.sql
```

---

## 📊 Arquitectura Completa

```
┌─────────────────────────────────────┐
│     Articles (SAP Master)           │
│  - article_id (PK)                  │
│  - sap_itemcode                     │
│  - sap_description                  │
│  - family / subfamily               │
└──────────────┬──────────────────────┘
               │ 1:N
               ↓
┌─────────────────────────────────────┐
│     Instruments (Technical)         │
│  - article_id (FK)                  │
│  - manufacturer_id                  │
│  - model, variant                   │
│  - especificaciones técnicas        │
└──────────────┬──────────────────────┘
               │
               ├──→ Variables
               ├──→ Protocolos
               ├──→ Registros Modbus
               ├──→ Salidas Analógicas
               ├──→ E/S Digitales
               ├──→ Documentos
               ├──→ Imágenes
               └──→ Tags / Provenance
```

---

## 🗂️ Archivos Clave

| Archivo | Descripción |
|---------|-------------|
| `SAP_INTEGRATION.md` | 📘 Guía completa de integración SAP |
| `README.md` | 📖 Documentación general |
| `QUICKSTART.md` | 🚀 Guía de inicio rápido |
| `PROJECT_SUMMARY.md` | 📋 Resumen ejecutivo |
| `backend/prisma/schema.prisma` | 🗄️ Esquema con tabla articles |
| `backend/src/routes/articles.ts` | 🔌 Endpoints SAP |
| `frontend/src/pages/InstrumentNew.tsx` | 📝 Formulario con selector SAP |
| `frontend/src/pages/InstrumentList.tsx` | 📊 Listado con artículos SAP |
| `frontend/src/pages/InstrumentDetail.tsx` | 👁️ Detalle con info SAP |

---

## 🎯 Casos de Uso

### Escenario 1: Importar desde SAP

```javascript
// 1. Obtener artículo de SAP (API Service Layer)
const sapArticle = await fetch('https://sap-server:50000/b1s/v1/Items(\'A1000347\')');

// 2. Crear en InstrumentKB
await fetch('http://localhost:3001/api/articles', {
  method: 'POST',
  body: JSON.stringify({
    article_id: `INS-${sapArticle.ItemCode}`,
    sap_itemcode: sapArticle.ItemCode,
    sap_description: sapArticle.ItemName,
    family: sapArticle.ItemsGroupCode,
    active: sapArticle.Valid === 'Y'
  })
});
```

### Escenario 2: Registrar Instrumento Nuevo

1. ✅ Crear artículo SAP en interface
2. ✅ Vincular al crear instrumento
3. ✅ Completar especificaciones técnicas
4. ✅ Añadir variables y protocolos
5. ✅ Subir datasheet
6. ✅ Guardar (todo en una transacción)

### Escenario 3: Migrar a Producción

```bash
# 1. Exportar desde PC junior
./migrate-to-production.sh

# Genera:
# - local-export.json
# - local-export.sql

# 2. Copiar al servidor de producción
scp local-export.json user@prod-server:/tmp/
scp -r backend/uploads user@prod-server:/opt/instrumentkb/backend/

# 3. Importar en producción
ssh user@prod-server
cd /opt/instrumentkb/backend
npm run import -- /tmp/local-export.json
```

---

## 📡 API Reference Rápida

### Articles

```bash
# Listar artículos activos
GET /api/articles?active=true

# Buscar artículos
GET /api/articles?search=CTD

# Crear artículo
POST /api/articles
{
  "article_id": "INS-001234",
  "sap_itemcode": "A1001234",
  "sap_description": "Sensor de Temperatura PT100",
  "family": "Sensores",
  "subfamily": "Temperatura"
}

# Obtener con instrumentos
GET /api/articles/INS-001234
```

### Instruments

```bash
# Crear con artículo SAP
POST /api/instruments
{
  "article_id": "INS-001234",  ← Vinculado a SAP
  "manufacturer_id": 1,
  "model": "PT100-XL",
  "variables": [...],
  "protocols": [...]
}

# Buscar por artículo
GET /api/search/instruments?article_id=INS-001234
```

---

## ✨ Características Destacadas

### 🔥 JSON Viewer en Tiempo Real
Mientras completas el formulario, ves el objeto construyéndose al lado.

### 🎨 Interfaz Moderna
- Mantine UI components
- Diseño responsive
- Notificaciones toast
- Loading states
- Badges de estado

### 💾 Exportación Profesional
- JSON estructurado (v2.0)
- SQL con orden correcto
- Metadata completa
- Listo para importar

### 🔍 Búsqueda Potente
- Múltiples filtros
- Búsqueda en descripciones SAP
- Paginación
- Resultados instantáneos

### 📦 Gestión Completa
- CRUD de artículos SAP
- CRUD de instrumentos
- Upload de documentos/imágenes
- Registros Modbus editables
- Tags y trazabilidad

---

## 🎓 Ejemplos de Datos

### Artículo SAP Completo

```json
{
  "article_id": "INS-000347",
  "sap_itemcode": "A1000347",
  "sap_description": "Sensor CTD Oceanográfico Sea-Bird SBE 37-SI MicroCAT",
  "family": "Sensores",
  "subfamily": "Oceanografía",
  "internal_notes": "Sensor de alta precisión para mediciones submarinas de temperatura, conductividad y presión",
  "active": true,
  "instruments": [
    {
      "model": "SBE 37-SI",
      "variant": "MicroCAT",
      "manufacturer": "Sea-Bird Scientific",
      "variables": [
        {
          "name": "Temperature",
          "range": "-5 a 35°C",
          "accuracy": "±0.002°C"
        },
        {
          "name": "Conductivity",
          "range": "0 a 9 S/m",
          "accuracy": "±0.0003 S/m"
        }
      ],
      "protocols": ["ModbusRTU"]
    }
  ]
}
```

---

## 🆘 Troubleshooting

### Error: "article_id already exists"
El código de artículo ya existe. Usa otro o actualiza el existente.

### Instrumento sin artículo SAP
Es válido, pero recomendamos vincular todos los instrumentos a artículos SAP para trazabilidad.

### Migración desde v1.0
Ejecuta la migración SQL: `backend/prisma/migrations/add_sap_integration.sql`

---

## 📚 Documentación

- **Integración SAP:** `SAP_INTEGRATION.md`
- **Documentación completa:** `README.md`
- **Guía rápida:** `QUICKSTART.md`
- **Resumen técnico:** `PROJECT_SUMMARY.md`

---

## 🎉 ¡Listo para Producción!

El proyecto está:
- ✅ Completamente funcional
- ✅ Integrado con SAP
- ✅ Documentado
- ✅ Con datos de ejemplo
- ✅ Listo para exportar/importar
- ✅ Preparado para Docker
- ✅ Código modular y limpio

**Inicia el proyecto y comienza a registrar tus instrumentos con integración SAP completa.**

```bash
start.sh  # o start.bat en Windows
```

**¡Disfruta de InstrumentKB v2.0! 🚀**

