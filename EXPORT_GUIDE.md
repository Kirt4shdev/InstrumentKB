# Guía de Exportación de Datos - InstrumentKB

## 📦 Funciones de Exportación Implementadas

Se han implementado tres formas de exportar todos los datos del sistema para facilitar la migración de desarrollo a producción:

### 1. 📊 **Exportación a Excel (XLSX)**
- **Formato**: Un archivo Excel con múltiples hojas
- **Estructura**: Una tabla por hoja de Excel
- **Uso**: Ideal para análisis, revisión y compartir datos con personas no técnicas
- **Endpoint**: `GET /api/export/excel`

**Hojas incluidas:**
- Articles (Artículos/Instrumentos)
- Manufacturers (Fabricantes)
- Variables (Diccionario de variables)
- Documents (Documentos)
- Images (Imágenes)
- ArticleVariables (Variables por artículo)
- AnalogOutputs (Salidas analógicas)
- DigitalIO (Entradas/Salidas digitales)
- Protocols (Protocolos de comunicación)
- ModbusRegisters (Registros Modbus)
- SDI12Commands (Comandos SDI-12)
- NMEASentences (Sentencias NMEA)
- Tags (Etiquetas)
- Provenance (Procedencia de datos)
- Metadata (Información de la exportación)

### 2. 🔄 **Exportación a JSON**
- **Formato**: JSON con artículos completos y anidados
- **Estructura**: 
  ```json
  {
    "exported_at": "2025-11-09T...",
    "version": "2.0",
    "sap_integration": true,
    "total_articles": 7,
    "articles": [
      {
        "article_id": "INS-000347",
        "sap_itemcode": "...",
        "sap_description": "...",
        "manufacturer": {
          "manufacturer_id": 1,
          "name": "Campbell Scientific",
          ...
        },
        "documents": [...],
        "images": [...],
        "article_variables": [
          {
            "art_var_id": 1,
            "variable": {
              "name": "Temperature",
              "unit_default": "°C"
            },
            "range_min": -40,
            "range_max": 85,
            ...
          }
        ],
        "analog_outputs": [...],
        "digital_io": [...],
        "article_protocols": [...],
        "modbus_registers": [...],
        "sdi12_commands": [...],
        "nmea_sentences": [...],
        "tags": [...],
        "provenance": [...]
      },
      {
        // Siguiente artículo completo...
      }
    ]
  }
  ```
- **Uso**: Ideal para procesamiento automático, análisis de datos, backups, importación en otras aplicaciones
- **Ventaja**: Cada instrumento incluye TODA su información relacionada de forma anidada (fabricante, variables con sus detalles, protocolos, etc.)
- **Endpoint**: `GET /api/export/json`

### 3. 🗄️ **Exportación a PostgreSQL (SQL)**
- **Formato**: Script SQL con INSERT statements
- **Estructura**: SQL completo listo para importar
- **Uso**: **RECOMENDADO** para migrar de desarrollo a producción
- **Endpoint**: `GET /api/export/sql`

**Características del SQL generado:**
- ✅ Transacciones (BEGIN/COMMIT)
- ✅ Orden correcto respetando foreign keys
- ✅ Desactivación temporal de triggers
- ✅ Actualización automática de secuencias (autoincrement)
- ✅ Escapado correcto de caracteres especiales
- ✅ Comentarios con instrucciones de uso
- ✅ Resumen de registros exportados

## 🚀 Cómo Usar

### Desde la Interfaz Web

1. Abre la aplicación en tu navegador
2. En el header, haz clic en el botón **"Exportar Datos"**
3. Selecciona el formato deseado:
   - **JSON (Arrays)**: Para análisis de datos
   - **Excel (XLSX)**: Una tabla por hoja
   - **PostgreSQL (SQL)**: Importación directa

El archivo se descargará automáticamente con un timestamp en el nombre.

### Desde la API (cURL)

```bash
# Exportar como JSON
curl -o export.json http://localhost:3001/api/export/json

# Exportar como Excel
curl -o export.xlsx http://localhost:3001/api/export/excel

# Exportar como SQL
curl -o export.sql http://localhost:3001/api/export/sql
```

## 📥 Importar en Producción (PostgreSQL)

### Opción 1: Importar en Base de Datos Nueva

```bash
# 1. Crear la base de datos
createdb instrumentkb_prod

# 2. Ejecutar migraciones de Prisma para crear las tablas
cd backend
DATABASE_URL="postgresql://usuario:password@localhost:5432/instrumentkb_prod" npx prisma migrate deploy

# 3. Importar los datos
psql -U usuario -d instrumentkb_prod -f instrumentkb-export-1234567890.sql
```

### Opción 2: Importar Sobrescribiendo Datos Existentes

```bash
# 1. Vaciar todas las tablas (¡CUIDADO! Esto borra todo)
psql -U usuario -d instrumentkb_prod -c "TRUNCATE articles, manufacturers, variables_dict, documents, images, article_variables, analog_outputs, digital_io, article_protocols, modbus_registers, sdi12_commands, nmea_sentences, tags, provenance CASCADE;"

# 2. Importar los datos
psql -U usuario -d instrumentkb_prod -f instrumentkb-export-1234567890.sql
```

### Opción 3: Usando Docker

```bash
# Si estás usando Docker Compose
docker cp instrumentkb-export-1234567890.sql instrumentkb-db-1:/tmp/
docker exec -it instrumentkb-db-1 psql -U postgres -d instrumentkb -f /tmp/instrumentkb-export-1234567890.sql
```

## 🔍 Verificar la Importación

Después de importar, verifica que los datos se importaron correctamente:

```sql
-- Contar registros en cada tabla
SELECT 
  'articles' as table_name, COUNT(*) as count FROM articles
UNION ALL
SELECT 'manufacturers', COUNT(*) FROM manufacturers
UNION ALL
SELECT 'variables_dict', COUNT(*) FROM variables_dict
UNION ALL
SELECT 'documents', COUNT(*) FROM documents
UNION ALL
SELECT 'images', COUNT(*) FROM images
UNION ALL
SELECT 'article_variables', COUNT(*) FROM article_variables
UNION ALL
SELECT 'analog_outputs', COUNT(*) FROM analog_outputs
UNION ALL
SELECT 'digital_io', COUNT(*) FROM digital_io
UNION ALL
SELECT 'article_protocols', COUNT(*) FROM article_protocols
UNION ALL
SELECT 'modbus_registers', COUNT(*) FROM modbus_registers
UNION ALL
SELECT 'sdi12_commands', COUNT(*) FROM sdi12_commands
UNION ALL
SELECT 'nmea_sentences', COUNT(*) FROM nmea_sentences
UNION ALL
SELECT 'tags', COUNT(*) FROM tags
UNION ALL
SELECT 'provenance', COUNT(*) FROM provenance;
```

Los números deben coincidir con el resumen al final del archivo SQL.

## 💡 Consejos

1. **Backup Regular**: Exporta regularmente tus datos como backup
2. **Versionado**: Guarda los archivos SQL con fechas para tener historial
3. **Validación**: Siempre verifica los datos después de importar
4. **Prueba Primero**: Prueba la importación en un entorno de prueba antes de producción
5. **Archivos Externos**: Recuerda que las imágenes y documentos están en `backend/uploads/`, también debes copiar esa carpeta

## 🗂️ Archivos a Migrar a Producción

Para una migración completa, necesitas:

1. ✅ **Base de datos** (usando el SQL exportado)
2. ✅ **Archivos subidos**:
   - `backend/uploads/documents/`
   - `backend/uploads/images/`
3. ✅ **Variables de entorno** (`.env` en backend)
4. ✅ **Schema de Prisma** (`backend/prisma/schema.prisma`)

## 🔧 Solución de Problemas

### Error: "duplicate key value"
- La tabla destino ya tiene datos con los mismos IDs
- Solución: Vacía las tablas primero o importa en una base de datos limpia

### Error: "violates foreign key constraint"
- El orden de inserción está incorrecto
- Solución: Usa el archivo SQL generado, ya respeta el orden correcto

### Error: "relation does not exist"
- Las tablas no existen en la base de datos destino
- Solución: Ejecuta `npx prisma migrate deploy` primero

### Las secuencias no funcionan
- Los IDs autoincrementales no continúan correctamente
- Solución: El SQL ya incluye comandos para actualizar las secuencias

## 📞 Soporte

Si tienes problemas:
1. Revisa el archivo SQL generado - incluye comentarios útiles
2. Verifica los logs del servidor
3. Asegúrate que la versión de PostgreSQL sea compatible (≥12)
4. Verifica que Prisma esté actualizado en destino

---

**Última actualización**: Noviembre 2025  
**Versión del sistema**: 2.0 (con integración SAP)

