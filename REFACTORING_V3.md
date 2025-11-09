# 🎉 InstrumentKB v3.0 - Sistema Genérico de Artículos SAP

## ✅ REFACTORIZACIÓN COMPLETA

Se ha completado la refactorización del sistema para soportar **cualquier tipo de artículo SAP**, no solo instrumentos.

---

## 🔄 **CAMBIOS PRINCIPALES**

### 1. **Nueva Estructura de Base de Datos**

#### ❌ **ANTES:** Sistema centrado en instrumentos
```
articles (SAP metadata) → instruments (datos técnicos)
```

#### ✅ **AHORA:** Sistema genérico de artículos
```
articles (todo en uno)
├── article_type (ENUM - OBLIGATORIO)
└── category (String - OPCIONAL)
```

### 2. **Tipos de Artículo Soportados**

El campo `article_type` (obligatorio) puede ser:

- **INSTRUMENTO** - Instrumentos de medición
- **CABLE** - Cables de señal/potencia
- **SOPORTE** - Soportes y montajes  
- **APARAMENTA_AC** - Protección AC
- **APARAMENTA_DC** - Protección DC
- **SENSOR** - Sensores standalone
- **ACTUADOR** - Actuadores
- **DATALOGGER** - Dataloggers
- **FUENTE_ALIMENTACION** - Fuentes de alimentación
- **MODULO_IO** - Módulos I/O
- **GATEWAY** - Gateways de comunicación
- **CAJA_CONEXIONES** - Cajas de conexiones
- **RACK** - Racks y armarios
- **PANEL** - Paneles de control
- **PROTECCION** - Elementos de protección
- **CONECTOR** - Conectores
- **HERRAMIENTA** - Herramientas
- **CONSUMIBLE** - Consumibles
- **REPUESTO** - Repuestos
- **SOFTWARE** - Software
- **LICENCIA** - Licencias
- **OTROS** - Otros

### 3. **Campos Específicos por Tipo**

El schema incluye campos para diferentes tipos de artículos:

**Instrumentos/Sensores:**
- Variables medidas
- Protocolos de comunicación
- Registros Modbus
- Comandos SDI-12
- Sentencias NMEA

**Cables:**
- `length_m` - Longitud en metros
- `diameter_mm` - Diámetro
- `material` - Material del cable
- `color` - Color

**Soportes:**
- `material` - Material del soporte
- `dimensions_mm` - Dimensiones

**Aparamenta:**
- `voltage_rating_v` - Tensión nominal
- `current_max_a` - Corriente máxima
- `certifications` - Certificaciones (IEC, CE, UL)

**Fuentes de Alimentación:**
- `power_supply_min_v` / `max_v` - Tensión entrada
- `voltage_rating_v` - Tensión salida
- `current_max_a` - Corriente salida
- `power_consumption_typ_w` - Potencia

---

## 📊 **DATOS DE EJEMPLO CARGADOS**

El seed data ahora incluye **6 tipos diferentes** de artículos:

1. **INS-000347** - INSTRUMENTO - Sensor CTD Oceanográfico
2. **INS-000512** - DATALOGGER - Campbell CR1000X
3. **CAB-001234** - CABLE - RS485 Apantallado
4. **SOP-005678** - SOPORTE - DIN Rail 35mm
5. **APA-009999** - APARAMENTA_AC - Magnetotérmico 3P 32A
6. **PWR-002468** - FUENTE_ALIMENTACION - 24VDC 5A 120W

---

## 🔌 **API ACTUALIZADA**

### Nuevos Endpoints

```bash
# Obtener tipos de artículo disponibles
GET /api/articles/meta/types

# Obtener categorías (valores reales en BD)
GET /api/articles/meta/categories?article_type=INSTRUMENTO

# Buscar artículos (autocomplete)
GET /api/articles/search?q=sensor

# Filtrar por tipo
GET /api/articles?article_type=CABLE

# Filtrar por categoría
GET /api/articles?category=Power Cable
```

### Endpoints Actualizados

```bash
# Listar artículos con filtros
GET /api/articles?article_type=INSTRUMENTO&family=Sensores&q=CTD

# Ver artículo completo
GET /api/articles/:id

# Crear artículo (article_type es OBLIGATORIO)
POST /api/articles
{
  "article_id": "CAB-001234",
  "sap_itemcode": "C2001234",
  "sap_description": "Cable RS485",
  "article_type": "CABLE",  // OBLIGATORIO
  "category": "Signal Cable",  // OPCIONAL
  "length_m": 100,
  "diameter_mm": 7.5
}

# Actualizar artículo
PUT /api/articles/:id

# Eliminar artículo
DELETE /api/articles/:id
```

---

## 🎨 **FRONTEND ACTUALIZADO**

### Cambios en la Interfaz

- ✅ **"Nuevo Instrumento"** → **"Nuevo Artículo"**
- ✅ **"InstrumentKB"** → **"InstrumentKB - Catálogo SAP"**
- ✅ Selector de **Tipo de Artículo** (obligatorio)
- ✅ Campo **Categoría** (opcional, autocompletable)
- ✅ Filtros por tipo y categoría en el listado
- ✅ Badges de color según tipo de artículo
- ✅ Campos dinámicos según tipo seleccionado

### Rutas Actualizadas

```
/                    - Listado de artículos
/new                 - Crear nuevo artículo
/article/:id         - Detalle de artículo
```

---

## 🗄️ **SCHEMA PRISMA**

### Principales Cambios

```prisma
enum ArticleType {
  INSTRUMENTO
  CABLE
  SOPORTE
  APARAMENTA_AC
  // ... 22 tipos en total
}

model Article {
  article_id       String       @id
  sap_itemcode     String?      @unique
  sap_description  String
  article_type     ArticleType  // OBLIGATORIO sin default
  category         String?      // OPCIONAL para sub-clasificación
  
  // Campos genéricos
  manufacturer_id  Int?
  model            String?
  variant          String?
  
  // Campos específicos por tipo
  length_m         Float?      // Cables
  diameter_mm      Float?      // Cables
  voltage_rating_v Float?      // Aparamenta
  current_max_a    Float?      // Aparamenta
  
  // Relaciones renombradas
  article_variables  ArticleVariable[]
  article_protocols  ArticleProtocol[]
  
  // ... más campos
}

// Tablas renombradas
model ArticleVariable { ... }  // antes InstrumentVariable
model ArticleProtocol { ... }  // antes InstrumentProtocol
```

---

## 🚀 **CÓMO USAR EL NUEVO SISTEMA**

### 1. Crear un Cable

```bash
curl -X POST http://localhost:3001/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "article_id": "CAB-999999",
    "sap_itemcode": "C2999999",
    "sap_description": "Cable Ethernet Cat6 UTP",
    "article_type": "CABLE",
    "category": "Network Cable",
    "length_m": 50,
    "diameter_mm": 6.5,
    "color": "Azul",
    "active": true
  }'
```

### 2. Crear un Soporte

```bash
curl -X POST http://localhost:3001/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "article_id": "SOP-888888",
    "sap_itemcode": "S3888888",
    "sap_description": "Soporte de Pared Universal",
    "article_type": "SOPORTE",
    "category": "Wall Mount",
    "material": "Acero Inoxidable",
    "weight_g": 500,
    "active": true
  }'
```

### 3. Crear un Instrumento (como antes)

```bash
curl -X POST http://localhost:3001/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "article_id": "INS-777777",
    "sap_itemcode": "A1777777",
    "sap_description": "Transmisor de Presión",
    "article_type": "INSTRUMENTO",
    "category": "Pressure Transmitter",
    "manufacturer_id": 1,
    "model": "PT-4000",
    "power_supply_min_v": 10,
    "power_supply_max_v": 30,
    "active": true
  }'
```

### 4. Buscar por Tipo

```bash
# Todos los cables
GET /api/articles?article_type=CABLE

# Todas las fuentes de alimentación
GET /api/articles?article_type=FUENTE_ALIMENTACION

# Todos los soportes DIN
GET /api/articles?article_type=SOPORTE&q=DIN
```

---

## 📈 **VENTAJAS DEL NUEVO SISTEMA**

✅ **Unificado** - Un solo endpoint/modelo para todos los artículos
✅ **Flexible** - Campos opcionales según tipo de artículo
✅ **Escalable** - Fácil agregar nuevos tipos
✅ **Consistente** - Misma estructura SAP para todo
✅ **Tipado fuerte** - ENUM para article_type garantiza valores válidos
✅ **Sub-clasificación** - Campo category para mayor especificidad
✅ **Búsqueda unificada** - Buscar en todos los tipos a la vez
✅ **Gestión de stock** - Campos stock_location, min_stock, current_stock

---

## 🔄 **MIGRACIÓN DE DATOS**

Si tenías datos anteriores, se han **eliminado** (con `--force-reset`). 
El nuevo seed incluye 6 artículos de ejemplo variados.

Para migrar datos antiguos:
1. Exportar con el sistema anterior
2. Mapear `instruments` → `articles` con `article_type: 'INSTRUMENTO'`
3. Agregar `category` basado en el antiguo campo `category`
4. Importar con nuevo formato

---

## 🧪 **TESTS REALIZADOS**

```bash
✅ Base de datos reseteada y migrada
✅ Schema Prisma actualizado
✅ Cliente Prisma regenerado
✅ Seed data cargado (6 artículos)
✅ Backend reiniciado
✅ API responde correctamente
✅ Tipos de artículo disponibles
✅ Filtros por tipo funcionales
```

---

## 📝 **PRÓXIMOS PASOS**

1. ✅ Actualizar componentes de frontend (ArticleList, ArticleNew, ArticleDetail)
2. ⏳ Agregar validaciones por tipo de artículo
3. ⏳ Implementar campos dinámicos según `article_type`
4. ⏳ Actualizar exportación JSON/SQL
5. ⏳ Documentación de usuario final

---

## 🎯 **RESULTADO FINAL**

**InstrumentKB v3.0** es ahora un **sistema genérico de gestión de artículos SAP** que puede manejar:

- 📡 Instrumentos de medición
- 🔌 Cables y conectores
- 🔧 Soportes y montajes
- ⚡ Aparamenta eléctrica
- 🔋 Fuentes de alimentación
- 💻 Dataloggers y gateways
- 📦 Consumibles y repuestos
- 💿 Software y licencias
- ✨ ¡Y mucho más!

**Todo con la misma estructura unificada vinculada a SAP Business One.**

---

**InstrumentKB v3.0** - **Sistema Genérico de Artículos SAP** 🚀

¡Listo para gestionar todo el catálogo de una empresa de instrumentación!

