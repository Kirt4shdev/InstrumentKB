@echo off
REM Script para migrar datos desde entorno local a producción

echo Migracion a Produccion - InstrumentKB
echo ========================================
echo.

REM Paso 1: Exportar datos locales
echo 1. Exportando datos del entorno local...
curl -o local-export.json http://localhost:3001/api/export/json
echo Datos exportados a local-export.json
echo.

REM Paso 2: Exportar SQL
echo 2. Exportando SQL...
curl -o local-export.sql http://localhost:3001/api/export/sql
echo SQL exportado a local-export.sql
echo.

REM Paso 3: Información
echo 3. Archivos generados:
dir local-export.*
echo.

echo 4. Proximos pasos para importar en produccion:
echo.
echo    Opcion A - Via script en servidor de produccion:
echo    1. Subir local-export.json al servidor
echo    2. SSH al servidor
echo    3. cd /ruta/al/proyecto/backend
echo    4. npm run import -- /ruta/a/local-export.json
echo.
echo    Opcion B - Via SQL dump:
echo    psql -U usuario -d base_datos -f local-export.sql
echo.
echo    No olvides copiar los archivos uploads:
echo    backend\uploads\ --^> servidor de produccion
echo.

pause

