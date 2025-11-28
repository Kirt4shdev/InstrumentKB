# Guía para Ver Logs del Backend - InstrumentKB

## 📝 Opciones para Ver Logs

### 1. Modo Desarrollo (Local)

Si ejecutas el backend directamente en tu máquina:

```bash
cd backend
npm run dev
```

**Los logs aparecen directamente en la terminal** donde ejecutaste el comando.

#### Tipos de logs que verás:
- ✅ Peticiones HTTP (GET, POST, PUT, DELETE)
- ✅ Errores de base de datos
- ✅ Mensajes de console.log()
- ✅ Errores con stack traces
- ✅ Información de exportación/importación

**Ejemplo:**
```
Starting JSON export (complete articles)...
Fetching 50 articles with all relations...
Successfully fetched 50 complete articles with all relations
POST /api/articles 201 - 145ms
Error loading article: Article not found
```

---

### 2. Modo Docker Compose (Recomendado)

Si usas Docker Compose (archivo `docker-compose.yml`):

#### Ver logs en tiempo real de todos los servicios
```bash
docker-compose logs -f
```

#### Ver solo logs del backend
```bash
docker-compose logs -f backend
```

#### Ver últimas 100 líneas del backend
```bash
docker-compose logs --tail=100 backend
```

#### Ver logs con timestamps
```bash
docker-compose logs -f -t backend
```

#### Ver logs de la base de datos
```bash
docker-compose logs -f db
```

#### Ver logs de todos los servicios (últimas 50 líneas)
```bash
docker-compose logs --tail=50
```

---

### 3. Comandos Docker Directos

Si usas Docker sin Compose:

#### Ver logs del contenedor del backend
```bash
docker logs instrumentkb-backend -f
```

#### Ver últimas 100 líneas
```bash
docker logs instrumentkb-backend --tail=100
```

#### Ver logs con timestamps
```bash
docker logs instrumentkb-backend -f -t
```

#### Ver logs desde una fecha específica
```bash
docker logs instrumentkb-backend --since="2024-01-01T00:00:00"
```

---

## 🔍 Filtrar Logs por Tipo

### Windows PowerShell

#### Buscar errores
```powershell
docker-compose logs backend | Select-String "error|Error|ERROR"
```

#### Buscar warnings
```powershell
docker-compose logs backend | Select-String "warn|warning|Warning"
```

#### Buscar exportaciones
```powershell
docker-compose logs backend | Select-String "export|Export"
```

### Linux / Mac / Git Bash

#### Buscar errores
```bash
docker-compose logs backend | grep -i error
```

#### Buscar warnings
```bash
docker-compose logs backend | grep -i warn
```

#### Buscar exportaciones
```bash
docker-compose logs backend | grep -i export
```

---

## 💾 Guardar Logs en Archivo

### Guardar logs del backend en archivo
```bash
docker-compose logs backend > backend-logs.txt
```

### Guardar logs con timestamps
```bash
docker-compose logs -t backend > backend-logs-$(date +%Y%m%d-%H%M%S).txt
```

### Guardar solo errores
Windows PowerShell:
```powershell
docker-compose logs backend | Select-String "error|Error|ERROR" > backend-errors.txt
```

Linux/Mac:
```bash
docker-compose logs backend | grep -i error > backend-errors.txt
```

---

## 🐛 Debugging Avanzado

### Ver estado de los contenedores
```bash
docker-compose ps
```

### Ver uso de recursos
```bash
docker stats instrumentkb-backend
```

### Entrar al contenedor del backend
```bash
docker exec -it instrumentkb-backend sh
```

Dentro del contenedor puedes:
```bash
# Ver estructura de archivos
ls -la

# Ver procesos
ps aux

# Ver variables de entorno
env

# Ver logs de Node.js si existen
cat /app/logs/*.log

# Ver versión de Node
node --version

# Ver dependencias instaladas
npm list
```

### Ver logs de múltiples servicios simultáneamente
```bash
docker-compose logs -f backend db
```

---

## 📊 Monitoreo en Tiempo Real

### Terminal dividida para múltiples logs

**En Windows Terminal o tmux:**

Terminal 1 - Backend:
```bash
docker-compose logs -f backend
```

Terminal 2 - Base de datos:
```bash
docker-compose logs -f db
```

Terminal 3 - Frontend (si necesitas):
```bash
docker-compose logs -f frontend
```

---

## 🔧 Configuración Avanzada de Logs

### Configurar logs con rotación (docker-compose.yml)

Si quieres limitar el tamaño de los logs:

```yaml
services:
  backend:
    # ... otras configuraciones ...
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

Esto crea:
- Archivos de log de máximo 10MB
- Mantiene máximo 3 archivos
- Rotación automática

### Ver ubicación de logs de Docker

Los logs de Docker se guardan en:

**Windows:**
```
C:\ProgramData\Docker\containers\<container-id>\<container-id>-json.log
```

**Linux:**
```
/var/lib/docker/containers/<container-id>/<container-id>-json.log
```

**Mac:**
```
~/Library/Containers/com.docker.docker/Data/vms/0/data/docker/containers/<container-id>/<container-id>-json.log
```

Para encontrar el container-id:
```bash
docker ps -a | grep instrumentkb-backend
```

---

## 🚨 Solución de Problemas Comunes

### No veo logs del backend

1. **Verificar que el contenedor esté ejecutándose:**
   ```bash
   docker-compose ps
   ```

2. **Ver si el contenedor se reinicia constantemente:**
   ```bash
   docker-compose logs --tail=50 backend
   ```

3. **Revisar errores de inicio:**
   ```bash
   docker-compose up backend
   ```

### Los logs no se actualizan

1. **Verificar que uses el flag `-f` (follow):**
   ```bash
   docker-compose logs -f backend
   ```

2. **Reiniciar el servicio:**
   ```bash
   docker-compose restart backend
   ```

### Logs muy largos / difíciles de leer

1. **Usar tail para ver solo las últimas líneas:**
   ```bash
   docker-compose logs --tail=50 backend
   ```

2. **Guardar en archivo y abrir con editor:**
   ```bash
   docker-compose logs backend > logs.txt
   code logs.txt  # O tu editor favorito
   ```

---

## 📌 Atajos y Alias Útiles

Puedes crear alias en tu terminal para acceso rápido:

### PowerShell (perfil)
```powershell
# Editar perfil
notepad $PROFILE

# Agregar alias
function dcl { docker-compose logs -f backend }
function dclt { docker-compose logs --tail=100 backend }
function dce { docker-compose logs backend | Select-String "error|Error|ERROR" }
```

### Linux/Mac (.bashrc o .zshrc)
```bash
# Agregar al final del archivo
alias dcl='docker-compose logs -f backend'
alias dclt='docker-compose logs --tail=100 backend'
alias dce='docker-compose logs backend | grep -i error'
alias dcps='docker-compose ps'
alias dcr='docker-compose restart backend'
```

---

## 🎯 Logs Específicos del Backend InstrumentKB

### Ver logs de exportación
```bash
docker-compose logs backend | grep -i "export"
```

Verás:
- Starting ZIP export...
- Fetching X articles...
- Found X files to export
- Export completed

### Ver logs de importación
```bash
docker-compose logs backend | grep -i "import"
```

Verás:
- Starting ZIP import...
- Extracting ZIP...
- Found X articles to import
- Import completed

### Ver logs de consultas SQL
El backend usa PostgreSQL directamente. Para ver queries específicas, puedes:

1. Activar logs de queries en PostgreSQL (si necesario)
2. Ver logs de conexión a BD:
   ```bash
   docker-compose logs db
   ```

### Ver logs de uploads
```bash
docker-compose logs backend | grep -i "upload"
```

---

## 📖 Resumen de Comandos Más Usados

| Acción | Comando |
|--------|---------|
| Ver logs en tiempo real | `docker-compose logs -f backend` |
| Ver últimas 100 líneas | `docker-compose logs --tail=100 backend` |
| Buscar errores | `docker-compose logs backend \| Select-String "error"` |
| Guardar en archivo | `docker-compose logs backend > logs.txt` |
| Ver estado | `docker-compose ps` |
| Reiniciar backend | `docker-compose restart backend` |
| Entrar al contenedor | `docker exec -it instrumentkb-backend sh` |
| Ver logs de BD | `docker-compose logs -f db` |

---

## 🎓 Ejemplos Prácticos

### Ejemplo 1: Debugging de error en exportación
```bash
# 1. Ver logs en tiempo real
docker-compose logs -f backend

# 2. En otra terminal, trigger la exportación desde la UI
# 3. Observar los logs para ver dónde falla

# 4. Si necesitas más detalle, ver últimas 200 líneas
docker-compose logs --tail=200 backend
```

### Ejemplo 2: Verificar importación exitosa
```bash
# Ver logs filtrando por "import"
docker-compose logs backend | grep -i import

# Deberías ver algo como:
# Starting ZIP import...
# Found 50 articles to import
# Files copied: 125, skipped: 0
# Import completed: 50 imported, 0 failed
```

### Ejemplo 3: Monitorear performance
```bash
# Terminal 1: Logs del backend
docker-compose logs -f backend

# Terminal 2: Estadísticas de recursos
docker stats instrumentkb-backend

# Terminal 3: Logs de la BD
docker-compose logs -f db
```

---

## 🔗 Referencias

- [Docker Logs Documentation](https://docs.docker.com/engine/reference/commandline/logs/)
- [Docker Compose Logs](https://docs.docker.com/compose/reference/logs/)
- [PostgreSQL Logging](https://www.postgresql.org/docs/current/runtime-config-logging.html)

---

**Última actualización:** 2024
**Versión:** 2.0

