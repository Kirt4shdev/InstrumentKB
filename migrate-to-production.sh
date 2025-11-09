#!/bin/bash

# Script para migrar datos desde entorno local a producción

echo "🚀 InstrumentKB - Migración a Producción"
echo "========================================"
echo ""

# Paso 1: Exportar datos locales
echo "📤 1. Exportando datos del entorno local..."
curl -o local-export.json http://localhost:3001/api/export/json
echo "✅ Datos exportados a local-export.json"
echo ""

# Paso 2: Crear backup de producción (opcional pero recomendado)
read -p "📦 2. ¿Crear backup de producción antes de importar? (s/n): " CREATE_BACKUP
if [ "$CREATE_BACKUP" = "s" ] || [ "$CREATE_BACKUP" = "S" ]; then
    read -p "   Ingresa la URL de producción (ej. https://instrumentkb.empresa.com): " PROD_URL
    echo "   Creando backup..."
    curl -o production-backup-$(date +%Y%m%d-%H%M%S).json ${PROD_URL}/api/export/json
    echo "   ✅ Backup creado"
fi
echo ""

# Paso 3: Información sobre la importación
echo "📝 3. Siguiente pasos para importar en producción:"
echo ""
echo "   Opción A - Via API (si ya existe endpoint de import):"
echo "   curl -X POST ${PROD_URL}/api/import \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d @local-export.json"
echo ""
echo "   Opción B - Via script en servidor de producción:"
echo "   1. Subir local-export.json al servidor"
echo "   2. SSH al servidor"
echo "   3. cd /ruta/al/proyecto/backend"
echo "   4. npm run import -- /ruta/a/local-export.json"
echo ""
echo "   Opción C - Via SQL dump:"
curl -o local-export.sql http://localhost:3001/api/export/sql
echo "   Archivo SQL generado: local-export.sql"
echo "   Importar con: psql -U usuario -d base_datos -f local-export.sql"
echo ""

# Paso 4: Copiar archivos uploads
echo "📁 4. No olvides copiar también los archivos subidos:"
echo "   rsync -avz ./backend/uploads/ usuario@servidor:/ruta/produccion/backend/uploads/"
echo ""

echo "✅ Exportación completada. Archivos generados:"
ls -lh local-export.json local-export.sql 2>/dev/null
echo ""
echo "⚠️  IMPORTANTE: Verifica los datos antes de importar en producción"

