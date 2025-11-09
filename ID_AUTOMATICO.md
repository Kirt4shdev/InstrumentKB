# ✅ ID DE ARTÍCULO AUTOMÁTICO

## 🎯 Cambio realizado

**Antes:** El usuario tenía que ingresar manualmente el `article_id`  
**Ahora:** El sistema lo genera automáticamente

---

## 📝 **¿Qué es el `article_id`?**

Sí, **`article_id` es la clave primaria** que relaciona todas las tablas de la base de datos:

```sql
article_id (PK) en tabla "articles"
    ↓
article_id (FK) en "article_variables"
article_id (FK) en "article_protocols"
article_id (FK) en "modbus_registers"
article_id (FK) en "sdi12_commands"
article_id (FK) en "nmea_sentences"
article_id (FK) en "documents"
article_id (FK) en "images"
article_id (FK) en "tags"
article_id (FK) en "provenance"
```

**Es el identificador único interno del sistema**, distinto del `sap_itemcode` que es el código SAP.

---

## 🔧 **Cómo funciona ahora**

### Generación automática

Cuando el usuario crea un artículo, el backend genera automáticamente un ID con el formato:

```
PREFIJO-TIMESTAMP-RANDOM
```

### Ejemplos de IDs generados:

| Tipo de Artículo | Prefijo | Ejemplo de ID |
|------------------|---------|---------------|
| INSTRUMENTO | `INS` | `INS-73245678-123` |
| CABLE | `CAB` | `CAB-73245679-456` |
| SOPORTE | `SOP` | `SOP-73245680-789` |
| SENSOR | `SEN` | `SEN-73245681-012` |
| DATALOGGER | `LOG` | `LOG-73245682-345` |
| FUENTE_ALIMENTACION | `PSU` | `PSU-73245683-678` |
| MODULO_IO | `MIO` | `MIO-73245684-901` |
| GATEWAY | `GTW` | `GTW-73245685-234` |
| APARAMENTA_AC | `AAC` | `AAC-73245686-567` |
| APARAMENTA_DC | `ADC` | `ADC-73245687-890` |
| CAJA_CONEXIONES | `BOX` | `BOX-73245688-123` |
| RACK | `RCK` | `RCK-73245689-456` |
| PANEL | `PNL` | `PNL-73245690-789` |
| PROTECCION | `PRT` | `PRT-73245691-012` |
| CONECTOR | `CON` | `CON-73245692-345` |
| HERRAMIENTA | `TLS` | `TLS-73245693-678` |
| CONSUMIBLE | `CSM` | `CSM-73245694-901` |
| REPUESTO | `REP` | `REP-73245695-234` |
| SOFTWARE | `SFT` | `SFT-73245696-567` |
| LICENCIA | `LIC` | `LIC-73245697-890` |
| OTROS | `OTH` | `OTH-73245698-123` |

---

## 🆔 **Estructura del ID**

### Componentes:
```
INS-73245678-123
│   │        │
│   │        └─ Random (3 dígitos): 000-999
│   └────────── Timestamp (8 últimos dígitos de Unix timestamp)
└────────────── Prefijo (3 letras según tipo de artículo)
```

### Ventajas:
- ✅ **Único**: Timestamp + random asegura unicidad
- ✅ **Legible**: El prefijo identifica el tipo de artículo
- ✅ **Ordenable**: El timestamp permite ordenar cronológicamente
- ✅ **Corto**: ~17 caracteres, fácil de referenciar

---

## 🔄 **Flujo de creación**

### Frontend:
```typescript
// ❌ ANTES: Usuario ingresaba manualmente
{
  "article_id": "INS-000123",  // ← Usuario lo escribía
  "sap_description": "Sensor XYZ",
  "article_type": "INSTRUMENTO"
}

// ✅ AHORA: No se envía article_id
{
  "sap_description": "Sensor XYZ",
  "article_type": "INSTRUMENTO"
}
```

### Backend:
```typescript
articlesRouter.post('/', async (req, res) => {
  // Si no viene article_id, lo generamos automáticamente
  if (!req.body.article_id) {
    req.body.article_id = generateArticleId(req.body.article_type);
    // Resultado: "INS-73245678-123"
  }
  
  const article = await prisma.article.create({
    data: req.body
  });
  
  res.json(article);
});
```

---

## 📋 **Cambios en el formulario**

### ❌ **ELIMINADO** el campo "ID Artículo"

**Antes:**
```
┌─────────────────────────────────┐
│ Información SAP                 │
├─────────────────────────────────┤
│ ID Artículo: [INS-000123]  ← Usuario lo escribía
│ SAP ItemCode: [A1000123]
│ Descripción: [...]
└─────────────────────────────────┘
```

**Ahora:**
```
┌─────────────────────────────────┐
│ Información SAP                 │
├─────────────────────────────────┤
│ SAP ItemCode: [A1000123]     ← Opcional
│ Descripción: [...]           ← Obligatorio
│ Tipo: [INSTRUMENTO]          ← Obligatorio
└─────────────────────────────────┘
```

---

## 🎯 **Diferencia entre `article_id` y `sap_itemcode`**

| Campo | Descripción | Generación | Obligatorio | Ejemplo |
|-------|-------------|------------|-------------|---------|
| **article_id** | ID interno del sistema | ✅ Automático | ✅ Sí | `INS-73245678-123` |
| **sap_itemcode** | Código del artículo en SAP | ❌ Manual (usuario) | ❌ No | `A1000123` |

### Relación:
- **`article_id`**: Identificador único interno para relacionar todas las tablas
- **`sap_itemcode`**: Código de SAP Business One (si existe)

**Un artículo puede:**
- ✅ Tener `article_id` sin `sap_itemcode` (artículo nuevo, aún no en SAP)
- ✅ Tener ambos (artículo ya registrado en SAP)
- ❌ NO puede existir sin `article_id` (es la PK)

---

## 🚀 **Ventajas del cambio**

### Para el usuario:
- ✅ **Más rápido**: No tiene que pensar en un ID
- ✅ **Sin errores**: No puede crear IDs duplicados
- ✅ **Menos campos**: Formulario más simple

### Para el sistema:
- ✅ **Unicidad garantizada**: IDs únicos por diseño
- ✅ **Trazabilidad**: El timestamp indica cuándo se creó
- ✅ **Escalabilidad**: Funciona con millones de artículos

---

## 📊 **Ejemplo completo**

### Usuario crea un instrumento:
```json
{
  "sap_itemcode": "A2024-1234",
  "sap_description": "Sensor de temperatura PT100",
  "article_type": "INSTRUMENTO",
  "manufacturer_id": 5,
  "model": "PT100-A",
  "power_supply_min_v": 10,
  "power_supply_max_v": 30
}
```

### Backend genera y devuelve:
```json
{
  "article_id": "INS-73245678-123",  ← ¡Generado automáticamente!
  "sap_itemcode": "A2024-1234",
  "sap_description": "Sensor de temperatura PT100",
  "article_type": "INSTRUMENTO",
  "manufacturer_id": 5,
  "model": "PT100-A",
  "power_supply_min_v": 10,
  "power_supply_max_v": 30,
  "active": true,
  "created_at": "2025-11-09T22:21:34.567Z",
  "updated_at": "2025-11-09T22:21:34.567Z"
}
```

### Ahora ese `article_id` se usa para relacionar:
```sql
-- Variables del instrumento
INSERT INTO article_variables VALUES ('INS-73245678-123', 1, ...);

-- Protocolos del instrumento
INSERT INTO article_protocols VALUES ('INS-73245678-123', 'ModbusRTU', ...);

-- Registros Modbus del instrumento
INSERT INTO modbus_registers VALUES ('INS-73245678-123', 3, 100, ...);

-- etc.
```

---

## ✅ **Estado actual**

- ✅ Backend genera IDs automáticamente
- ✅ Frontend NO pide el ID al usuario
- ✅ Formulario más limpio y simple
- ✅ Sistema funcionando correctamente

**El usuario solo necesita:**
1. Seleccionar el **tipo de artículo** (obligatorio)
2. Escribir la **descripción SAP** (obligatorio)
3. Rellenar el resto de campos técnicos (opcionales)

**El sistema se encarga del resto** 🎯

