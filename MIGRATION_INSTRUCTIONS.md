# 📋 Instrucciones de Migración - InstrumentKB

## ⚠️ IMPORTANTE: Leer completamente antes de ejecutar

Esta guía te ayudará a aplicar de forma segura todos los cambios solicitados en tu base de datos **SIN PERDER DATOS**.

---

## 🔧 Configuración de tu Entorno

Esta guía cubre dos escenarios:

### 🐳 **Docker (Desarrollo)**
Si estás usando `docker-compose.yml`:
- **Usuario DB**: `kb_user`
- **Password**: `kb_pass`
- **Base de datos**: `instruments`
- **Contenedor**: `instrumentkb-db`
- **Puerto host**: `5434` (mapea al `5432` interno)
- **Acceso web**: `http://localhost:8080`

### 🏢 **Producción (PostgreSQL directo)**
Si tienes PostgreSQL instalado directamente en tu servidor:
- Ajusta los comandos según tu configuración específica
- Reemplaza `tu_usuario_produccion`, `tu_bd_produccion`, etc.

---

## ⚡ Guía Rápida (Para expertos)

Si ya conoces el proceso, aquí está la versión corta:

### Linux/Mac/Git Bash:
```bash
# 1. Backup (Docker)
docker exec instrumentkb-db pg_dump -U kb_user -d instruments > "backup_$(date +%Y%m%d_%H%M%S).sql"

# 2. Detener servicios (opcional)
docker stop instrumentkb-backend instrumentkb-frontend instrumentkb-nginx

# 3. Ejecutar migración
docker exec -i instrumentkb-db psql -U kb_user -d instruments < backend/migrations/migration_2025_01.sql

# 4. Verificar
docker exec -it instrumentkb-db psql -U kb_user -d instruments -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'articles' AND column_name LIKE 'heating%';"

# 5. Reiniciar
docker start instrumentkb-backend instrumentkb-frontend instrumentkb-nginx

# 6. Verificar en navegador (Linux)
xdg-open "http://localhost:8080"
# O en Mac
open "http://localhost:8080"
```

### Windows PowerShell:
```powershell
# 1. Backup (Docker)
$date = Get-Date -Format "yyyyMMdd_HHmmss"
docker exec instrumentkb-db pg_dump -U kb_user -d instruments > "backup_$date.sql"

# 2. Detener servicios (opcional)
docker stop instrumentkb-backend instrumentkb-frontend instrumentkb-nginx

# 3. Ejecutar migración
Get-Content backend\migrations\migration_2025_01.sql | docker exec -i instrumentkb-db psql -U kb_user -d instruments

# 4. Verificar
docker exec -it instrumentkb-db psql -U kb_user -d instruments -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'articles' AND column_name LIKE 'heating%';"

# 5. Reiniciar
docker start instrumentkb-backend instrumentkb-frontend instrumentkb-nginx

# 6. Verificar en navegador
Start-Process "http://localhost:8080"
```

---

## 📦 Cambios Incluidos en esta Migración

### 1. ✅ Sistema de Calefacción
- Nuevo campo `has_heating` (Boolean): Indica si el equipo tiene calefacción
- Nuevo campo `heating_consumption_w` (Real): Consumo de la calefacción en Watts
- Nuevo campo `heating_temp_min_c` (Real): Temperatura mínima del rango de calefacción
- Nuevo campo `heating_temp_max_c` (Real): Temperatura máxima del rango de calefacción

### 2. ✅ Bug Corregido: Notas de Salidas Analógicas
- El campo de notas ahora se llama correctamente `scaling_notes`
- Se guarda y muestra correctamente en el formulario y visualizador

### 3. ✅ Tipos de Salida Analógica Flexibles
- Eliminado el ENUM `AnalogOutputType`
- Ahora el campo `type` en `analog_outputs` es `VARCHAR(100)`
- Permite valores personalizados como `Voltage_0_2V`, `Current_0_5mA`, etc.

### 4. ✅ Accesorios con Part Number
- Nueva tabla `accessories` para registrar accesorios de equipos
- Campos: `name`, `part_number`, `description`, `quantity`, `notes`

### 5. ✅ Visualizador Mejorado
- Ahora muestra TODOS los datos: salidas analógicas, IO digital, Modbus, SDI-12, NMEA, accesorios, condiciones ambientales completas, etc.

### 6. ✅ Sistema de Importación
- Importa datos desde JSON (exportaciones completas)
- Importa desde Excel (todas las hojas)
- Importa desde SQL (dumps completos)

---

## 🚀 Pasos para Aplicar la Migración en Producción

### Paso 1: Backup Completo ⚡ **OBLIGATORIO**

**ANTES DE CUALQUIER CAMBIO**, crea un backup completo de tu base de datos:

#### 🐳 Si usas Docker (desarrollo):

**Linux/Mac/Git Bash**:
```bash
# Backup completo
docker exec instrumentkb-db pg_dump -U kb_user -d instruments -F c -b -v > backup_$(date +%Y%m%d_%H%M%S).backup

# O como SQL legible (más simple)
docker exec instrumentkb-db pg_dump -U kb_user -d instruments > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Windows PowerShell**:
```powershell
# Backup completo
$date = Get-Date -Format "yyyyMMdd_HHmmss"
docker exec instrumentkb-db pg_dump -U kb_user -d instruments -F c -b -v > "backup_$date.backup"

# O como SQL legible (más simple)
docker exec instrumentkb-db pg_dump -U kb_user -d instruments > "backup_$date.sql"
```

#### 🏢 Si usas PostgreSQL instalado directamente (producción):
```powershell
# Windows PowerShell - Ajusta según tu configuración de producción
$date = Get-Date -Format "yyyyMMdd_HHmmss"
pg_dump -h localhost -p 5432 -U tu_usuario_produccion -d tu_bd_produccion -F c -b -v -f "backup_produccion_$date.backup"

# También como SQL
pg_dump -h localhost -p 5432 -U tu_usuario_produccion -d tu_bd_produccion > "backup_produccion_$date.sql"
```

```bash
# Linux/Mac - Ajusta según tu configuración de producción
pg_dump -h localhost -U tu_usuario_produccion -d tu_bd_produccion -F c -b -v -f backup_produccion_$(date +%Y%m%d_%H%M%S).backup
```

**Guarda este backup en un lugar seguro**. Si algo sale mal, podrás restaurarlo con:

```powershell
# Docker
Get-Content backup_XXXXXXXXXX.backup | docker exec -i instrumentkb-db pg_restore -U kb_user -d instruments -v -c

# Producción
pg_restore -h localhost -U tu_usuario_produccion -d tu_bd_produccion -v -c backup_XXXXXXXXXX.backup
```

---

### Paso 2: Detener la Aplicación (Opcional pero Recomendado)

Para evitar que se escriban datos durante la migración:

#### 🐳 Docker (desarrollo):
```bash
# Detener solo backend y frontend, dejar DB corriendo
# Funciona en Linux/Mac/Windows
docker stop instrumentkb-backend instrumentkb-frontend instrumentkb-nginx
```

#### 🏢 Producción:
```bash
# Si usas PM2
pm2 stop all

# Si usas systemd
sudo systemctl stop instrumentkb-backend
sudo systemctl stop instrumentkb-frontend

# O detén el servidor como lo hagas normalmente
```

---

### Paso 3: Ejecutar la Migración SQL

#### 🐳 Docker (desarrollo):

**Linux/Mac/Git Bash** (Más común):
```bash
# Desde la raíz del proyecto
docker exec -i instrumentkb-db psql -U kb_user -d instruments < backend/migrations/migration_2025_01.sql
```

**Windows PowerShell**:
```powershell
# Desde la raíz del proyecto
Get-Content backend\migrations\migration_2025_01.sql | docker exec -i instrumentkb-db psql -U kb_user -d instruments
```

**Alternativa (funciona en todos los sistemas)**:
```bash
# Copiar el archivo al contenedor y ejecutarlo
docker cp backend/migrations/migration_2025_01.sql instrumentkb-db:/tmp/
docker exec instrumentkb-db psql -U kb_user -d instruments -f /tmp/migration_2025_01.sql
```

#### 🏢 Producción (PostgreSQL directo):
```powershell
# Windows PowerShell - Ajusta rutas y credenciales según tu entorno
cd backend\migrations
psql -h localhost -p 5432 -U tu_usuario_produccion -d tu_bd_produccion -f migration_2025_01.sql
```

```bash
# Linux/Mac - Ajusta rutas y credenciales según tu entorno
cd backend/migrations
psql -h localhost -U tu_usuario_produccion -d tu_bd_produccion -f migration_2025_01.sql
```

**El script es seguro**: 
- ✅ Verifica si cada cambio ya existe antes de aplicarlo
- ✅ No elimina ni modifica datos existentes
- ✅ Convierte tipos sin perder información
- ✅ Usa transacciones para garantizar integridad

**Si ves mensajes de `NOTICE`**: Es completamente normal. Significan que los cambios se aplicaron correctamente o que ya existían (en cuyo caso se saltaron).

---

### Paso 4: Verificar que Todo Funcionó

Conéctate a tu base de datos y verifica:

#### 🐳 Docker (desarrollo):

**Opción 1: Verificaciones individuales** (funciona en todos los sistemas):
```bash
# Verificar campos de calefacción
docker exec -it instrumentkb-db psql -U kb_user -d instruments -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'articles' AND column_name LIKE 'heating%';"

# Verificar analog_outputs.type
docker exec -it instrumentkb-db psql -U kb_user -d instruments -c "SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = 'analog_outputs' AND column_name = 'type';"

# Verificar tabla accessories
docker exec -it instrumentkb-db psql -U kb_user -d instruments -c "SELECT table_name FROM information_schema.tables WHERE table_name = 'accessories';"
```

**Opción 2: Todas las verificaciones a la vez** (Linux/Mac/Git Bash):
docker exec -it instrumentkb-db psql -U kb_user -d instruments << 'EOF'
-- Verificar nuevos campos de calefacción
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name LIKE 'heating%';

-- Verificar que analog_outputs.type ahora es VARCHAR
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'analog_outputs' 
AND column_name = 'type';

-- Verificar que existe la tabla accessories
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'accessories';

-- Verificar conteo (debe ser 0 si no has agregado accesorios aún)
SELECT COUNT(*) as total_accesorios FROM accessories;
EOF
```

#### 🏢 Producción:
```bash
psql -h localhost -U tu_usuario_produccion -d tu_bd_produccion << 'EOF'
-- Todas las verificaciones aquí...
EOF
```

**Resultados esperados:**
- ✅ 4 columnas de calefacción: `has_heating`, `heating_consumption_w`, `heating_temp_min_c`, `heating_temp_max_c`
- ✅ `analog_outputs.type` es `character varying` (VARCHAR) con longitud 100
- ✅ La tabla `accessories` existe

Si todo muestra resultados correctos, ¡la migración fue exitosa! 🎉

---

### Paso 5: Actualizar el Código de la Aplicación

#### Backend:
```bash
cd backend
npm install
npm run build  # Si tienes un script de build
```

#### Frontend:
```bash
cd frontend
npm install
npm run build
```

---

### Paso 6: Reiniciar la Aplicación

#### 🐳 Docker (desarrollo):
```bash
# Reiniciar los servicios (funciona en todos los sistemas)
docker start instrumentkb-backend instrumentkb-frontend instrumentkb-nginx

# O reiniciar todo con docker-compose
docker-compose restart

# Verificar que todo está funcionando
docker ps
docker logs instrumentkb-backend --tail 20
```

#### 🏢 Producción:
```bash
# Si usas PM2
pm2 restart all
pm2 logs

# Si usas systemd
sudo systemctl restart instrumentkb-backend
sudo systemctl restart instrumentkb-frontend
sudo systemctl status instrumentkb-backend

# O inicia el servidor como lo hagas normalmente
```

**Verifica que la aplicación está funcionando:**
- Accede a `http://localhost:8080` (Docker) o tu URL de producción
- Verifica que puedes ver la lista de artículos
- Intenta editar un artículo y ver los nuevos campos

---

## 🧪 Probar los Nuevos Features

### 1. Campos de Calefacción
1. Edita un artículo existente
2. Ve al tab "Técnico"
3. Activa el switch "¿Tiene Calefacción?"
4. Llena los campos de consumo y temperaturas
5. Guarda y verifica que se muestre en el visualizador

### 2. Salidas Analógicas
1. Edita un artículo con salidas analógicas
2. En el campo "Tipo", escribe valores personalizados como `Voltage_0_2V`
3. Llena las "Notas de Escalado"
4. Guarda y verifica que las notas se guardan correctamente

### 3. Accesorios
1. Edita un artículo
2. Ve al tab "Otros"
3. Haz clic en "Agregar Accesorio"
4. Llena nombre, part number, cantidad, descripción
5. Guarda y verifica en el visualizador

### 4. Importación
1. Primero exporta datos (JSON, Excel o SQL)
2. En el futuro, usa los archivos de importación para cargar datos

---

## 🔄 Rollback (Solo si algo sale mal)

Si necesitas revertir los cambios:

### Opción 1: Restaurar desde Backup (RECOMENDADO)

#### 🐳 Docker:

**Linux/Mac/Git Bash**:
```bash
# Desde backup binario
docker exec -i instrumentkb-db pg_restore -U kb_user -d instruments -v -c < backup_XXXXXXXXXX.backup

# O desde SQL (más simple)
docker exec -i instrumentkb-db psql -U kb_user -d instruments < backup_XXXXXXXXXX.sql
```

**Windows PowerShell**:
```powershell
# Desde backup binario
Get-Content backup_XXXXXXXXXX.backup | docker exec -i instrumentkb-db pg_restore -U kb_user -d instruments -v -c

# O desde SQL (más simple)
Get-Content backup_XXXXXXXXXX.sql | docker exec -i instrumentkb-db psql -U kb_user -d instruments
```

#### 🏢 Producción:
```bash
pg_restore -h localhost -U tu_usuario_produccion -d tu_bd_produccion -v -c backup_XXXXXXXXXX.backup
# O
psql -h localhost -U tu_usuario_produccion -d tu_bd_produccion < backup_XXXXXXXXXX.sql
```

### Opción 2: Rollback Manual (NO RECOMENDADO)

⚠️ **Solo si NO has creado datos nuevos con las nuevas funcionalidades**:

#### 🐳 Docker (funciona en todos los sistemas):
```bash
docker exec -i instrumentkb-db psql -U kb_user -d instruments -c "
BEGIN;
ALTER TABLE articles DROP COLUMN IF EXISTS has_heating CASCADE;
ALTER TABLE articles DROP COLUMN IF EXISTS heating_consumption_w CASCADE;
ALTER TABLE articles DROP COLUMN IF EXISTS heating_temp_min_c CASCADE;
ALTER TABLE articles DROP COLUMN IF EXISTS heating_temp_max_c CASCADE;
DROP TABLE IF EXISTS accessories CASCADE;
COMMIT;
"
```

**⚠️ IMPORTANTE**: El rollback manual eliminará **TODOS** los datos nuevos creados después de la migración (accesorios, datos de calefacción, etc.).

---

## 🔧 Troubleshooting (Problemas Comunes)

### Error: "docker: command not found"
Asegúrate de que Docker esté instalado y corriendo:
```powershell
docker --version
docker ps
```

### Error: "No such container: instrumentkb-db"
El contenedor no existe. Inicia la aplicación primero:
```powershell
docker-compose up -d
```

### Error: "could not connect to server"
La base de datos no está lista. Espera unos segundos y reintenta:
```powershell
docker logs instrumentkb-db --tail 20
```

### Error: "syntax error at or near..."
El archivo SQL puede estar corrupto. Verifica:
```powershell
Get-Content backend\migrations\migration_2025_01.sql | Select-Object -First 5
```

### La migración se ejecutó pero no veo los cambios
Reinicia el backend para que recargue el código:
```powershell
docker restart instrumentkb-backend
docker logs instrumentkb-backend --tail 30
```

### Error en importación: "duplicate key value"
Estás importando datos que ya existen. Esto es normal y se ignora automáticamente.

---

## 📞 Soporte

Si encuentras algún problema durante la migración:

1. **NO entres en pánico** 😌
2. **NO ejecutes comandos destructivos** ⚠️
3. Verifica los logs del servidor: `docker logs instrumentkb-backend --tail 50`
4. Revisa la sección de Troubleshooting arriba
5. Restaura el backup si es necesario
6. Documenta el error exacto (copia el mensaje completo)
7. Contacta al equipo de desarrollo con:
   - Mensaje de error completo
   - Comando que ejecutaste
   - Logs del contenedor
   - Sistema operativo que usas

---

## ✅ Checklist Final

Antes de dar por terminada la migración:

- [ ] Backup completo realizado y verificado
- [ ] Migración SQL ejecutada sin errores
- [ ] Verificación de cambios en la base de datos completada
- [ ] Código actualizado (backend y frontend)
- [ ] Aplicación reiniciada
- [ ] Pruebas de los nuevos features realizadas
- [ ] Usuarios notificados de los nuevos features (opcional)

---

## 📊 Resumen de Archivos Modificados

### Backend:
- `backend/migrations/migration_2025_01.sql` ← **Script de migración principal**
- `backend/schema.sql` ← Schema actualizado
- `backend/src/routes/articles.ts` ← Soporte para nuevos campos
- `backend/src/routes/accessories.ts` ← Nueva ruta para accesorios
- `backend/src/routes/import.ts` ← Nueva ruta para importación
- `backend/src/routes/export.ts` ← Actualizado para incluir accesorios
- `backend/src/index.ts` ← Registro de nuevas rutas

### Frontend:
- `frontend/src/types.ts` ← Tipos actualizados
- `frontend/src/api.ts` ← APIs de importación y accesorios
- `frontend/src/pages/ArticleDetail.tsx` ← Visualizador mejorado
- `frontend/src/pages/ArticleNew.tsx` ← Formulario con nuevos campos

---

## 🎉 ¡Migración Completada!

Si llegaste aquí sin errores, ¡felicidades! Tu sistema ahora tiene:
- ✅ Sistema de calefacción
- ✅ Bug de notas de salidas analógicas corregido
- ✅ Tipos de salida analógica flexibles
- ✅ Sistema de accesorios con part numbers
- ✅ Visualizador completo con todos los datos
- ✅ Sistema de importación de datos

---

## 📥 Importación de Datos (Nueva Funcionalidad)

Ahora puedes importar datos desde la interfaz web:

1. Accede a `http://localhost:8080` (Docker) o tu URL de producción
2. Click en el menú **"Importar"** en la barra superior
3. Selecciona el formato:
   - **JSON**: Exportaciones completas con todas las relaciones
   - **Excel (XLSX)**: Tablas estructuradas en hojas separadas
   - **SQL**: Dumps de PostgreSQL (para migraciones entre servidores)

### Exportar datos primero (para respaldo):
1. Click en **"Exportar"** en la barra superior
2. Selecciona el formato deseado
3. Guarda el archivo (se descarga automáticamente)

### Casos de uso:
- 📦 **Migración entre servidores**: Exporta SQL de desarrollo, importa en producción
- 🔄 **Respaldo y restauración**: Exporta JSON regularmente como backup
- 📊 **Análisis de datos**: Exporta Excel para trabajar con los datos
- 🔧 **Bulk updates**: Modifica el Excel, reimporta los cambios

**Disfruta de las nuevas funcionalidades** 🚀

