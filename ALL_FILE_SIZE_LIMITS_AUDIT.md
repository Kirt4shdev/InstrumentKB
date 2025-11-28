# Auditoría Completa de Límites de Tamaño de Archivo

## 📋 Resumen de Todos los Límites Encontrados y Actualizados

### ✅ **Límites Actualizados**

| Componente | Ubicación | Antes | Ahora | Estado |
|------------|-----------|-------|-------|--------|
| **Express JSON** | `backend/src/index.ts` | 50 MB | **500 MB** | ✅ Actualizado |
| **Express URL Encoded** | `backend/src/index.ts` | 50 MB | **500 MB** | ✅ Actualizado |
| **Multer Upload** | `backend/src/routes/upload.ts` | 100 MB | **500 MB** | ✅ Actualizado |
| **Multer Import** | `backend/src/routes/import.ts` | 100 MB | **500 MB** | ✅ Actualizado |
| **Nginx Body Size** | `nginx.conf` | 100 MB | **500 MB** | ✅ Actualizado |
| **Nginx Timeouts** | `nginx.conf` | 60s | **300s** | ✅ Actualizado |
| **Axios Timeout** | `frontend/src/api.ts` | Sin límite | **300s** | ✅ Actualizado |
| **Axios Content** | `frontend/src/api.ts` | Sin límite | **500 MB** | ✅ Actualizado |
| **Axios Body** | `frontend/src/api.ts` | Sin límite | **500 MB** | ✅ Actualizado |

---

## 🔍 **Detalles de Cada Límite**

### 1. Backend - Express Middleware (`backend/src/index.ts`)

**Líneas 27-28:**
```typescript
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));
```

**Propósito:**
- Controla el tamaño máximo del payload de las peticiones HTTP
- Aplica a peticiones JSON y formularios URL-encoded
- **500MB** permite enviar grandes archivos y datos

---

### 2. Backend - Multer Upload (`backend/src/routes/upload.ts`)

**Líneas 64-67:**
```typescript
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});
```

**Propósito:**
- Controla el tamaño de archivos subidos (documentos e imágenes)
- Se usa en:
  - `POST /api/upload/document` - Subir documentos
  - `POST /api/upload/image` - Subir imágenes
- **500MB** permite manuales técnicos grandes, datasheets con muchas imágenes

---

### 3. Backend - Multer Import (`backend/src/routes/import.ts`)

**Líneas 20-25:**
```typescript
const upload = multer({ 
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max
  }
});
```

**Propósito:**
- Controla el tamaño de archivos de importación
- Se usa en:
  - `POST /api/import/json` - Importar JSON
  - `POST /api/import/excel` - Importar Excel
  - `POST /api/import/sql` - Importar SQL
  - `POST /api/import/zip` - Importar ZIP con archivos
- **500MB** permite backups completos con muchos archivos

---

### 4. Nginx - Client Max Body Size (`nginx.conf`)

**Línea 20:**
```nginx
client_max_body_size 500M;
```

**Propósito:**
- Límite de Nginx para el tamaño del cuerpo de la petición
- **CRÍTICO**: Si este límite es bajo, Nginx rechazará la petición antes de que llegue al backend
- **500M** coincide con los límites del backend

---

### 5. Nginx - Timeouts (`nginx.conf`)

**Líneas 21-26:**
```nginx
client_body_timeout 300s;      # 5 minutos para recibir el body
client_header_timeout 300s;    # 5 minutos para recibir headers
proxy_connect_timeout 300s;    # 5 minutos para conectar al backend
proxy_send_timeout 300s;       # 5 minutos para enviar al backend
proxy_read_timeout 300s;       # 5 minutos para leer respuesta del backend
```

**Propósito:**
- Evita timeouts prematuros al subir archivos grandes
- **300 segundos (5 minutos)** da tiempo suficiente para archivos de 500MB
- Con conexión lenta de 1 Mbps:
  - 100 MB → ~13 minutos teóricos
  - 500 MB → ~67 minutos teóricos
  - Pero con compresión y conexiones reales, suele ser menos

---

### 6. Frontend - Axios Configuration (`frontend/src/api.ts`)

**Líneas 5-11:**
```typescript
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 300000, // 5 minutos
  maxContentLength: 500 * 1024 * 1024, // 500MB
  maxBodyLength: 500 * 1024 * 1024, // 500MB
});
```

**Propósito:**
- **timeout**: Tiempo máximo de espera para la respuesta (5 minutos)
- **maxContentLength**: Tamaño máximo de la respuesta (500MB) - para downloads
- **maxBodyLength**: Tamaño máximo del body de la petición (500MB) - para uploads
- Previene que el navegador cancele la petición por timeout

---

## 🚀 **Cómo Aplicar los Cambios**

### Opción 1: Rebuild Completo (Recomendado)

```bash
# 1. Detener servicios
docker-compose down

# 2. Rebuild todo
docker-compose build

# 3. Iniciar servicios
docker-compose up -d

# 4. Ver logs
docker-compose logs -f
```

### Opción 2: Rebuild Selectivo

```bash
# 1. Rebuild backend
docker-compose build backend

# 2. Rebuild nginx
docker-compose build nginx

# 3. Reiniciar servicios afectados
docker-compose restart backend nginx frontend

# 4. Ver logs
docker-compose logs -f backend nginx
```

### Opción 3: Desarrollo Local (Sin Docker)

```bash
# 1. Backend
cd backend
npm run build
npm run dev

# 2. Frontend (en otra terminal)
cd frontend
npm run dev

# 3. Para Nginx, necesitas reiniciar el servicio
docker-compose restart nginx
# O si Nginx está local:
sudo nginx -s reload
```

---

## ✅ **Verificación**

### 1. Verificar que los servicios iniciaron correctamente

```bash
docker-compose ps
```

Deberías ver todos los servicios en estado "Up":
```
NAME                    STATUS
instrumentkb-backend    Up
instrumentkb-frontend   Up
instrumentkb-nginx      Up
instrumentkb-db         Up
```

### 2. Verificar logs del backend

```bash
docker-compose logs backend | tail -20
```

Deberías ver:
```
🚀 Backend running on http://localhost:3002
📊 Database: PostgreSQL (SQL nativo - ¡Sin Prisma!)
```

### 3. Verificar configuración de Nginx

```bash
docker exec -it instrumentkb-nginx nginx -T | grep -i "client_max_body_size\|timeout"
```

Deberías ver:
```
client_max_body_size 500M;
client_body_timeout 300s;
...
```

### 4. Probar subida de archivo grande

1. Ir a la interfaz web: http://localhost:8080
2. Crear o editar un artículo
3. Subir un documento de más de 100MB
4. Verificar que no haya errores

---

## 🐛 **Troubleshooting**

### Error: "413 Request Entity Too Large"

**Causa**: Nginx rechaza la petición (su límite es muy bajo)

**Solución**:
```bash
# Verificar que nginx.conf tenga client_max_body_size 500M
grep "client_max_body_size" nginx.conf

# Reiniciar Nginx
docker-compose restart nginx
```

### Error: "PayloadTooLargeError: request entity too large"

**Causa**: Express rechaza la petición (su límite es muy bajo)

**Solución**:
```bash
# Verificar que index.ts tenga limit: '500mb'
grep "limit:" backend/src/index.ts

# Rebuild backend
docker-compose build backend
docker-compose restart backend
```

### Error: "MulterError: File too large"

**Causa**: Multer rechaza el archivo

**Solución**:
```bash
# Verificar que upload.ts/import.ts tengan fileSize: 500MB
grep "fileSize:" backend/src/routes/upload.ts
grep "fileSize:" backend/src/routes/import.ts

# Rebuild backend
docker-compose build backend
docker-compose restart backend
```

### Error: "timeout of 300000ms exceeded"

**Causa**: La subida tarda más de 5 minutos

**Solución 1 - Aumentar timeout en frontend**:
```typescript
// frontend/src/api.ts
timeout: 600000, // 10 minutos
```

**Solución 2 - Aumentar timeout en Nginx**:
```nginx
# nginx.conf
proxy_read_timeout 600s;
```

**Solución 3 - Mejorar conexión o reducir archivo**

### Error: "Error: Network Error"

**Causa**: Múltiples posibles (timeout, límites, conexión)

**Diagnóstico**:
```bash
# Ver logs del backend
docker-compose logs backend | tail -50

# Ver logs de Nginx
docker-compose logs nginx | tail -50

# Ver logs del navegador (F12 → Console → Network)
```

---

## 📊 **Tabla de Tiempos de Subida Estimados**

Tiempos aproximados según tamaño de archivo y velocidad de conexión:

| Tamaño | 1 Mbps | 10 Mbps | 100 Mbps | 1 Gbps |
|--------|--------|---------|----------|--------|
| 50 MB  | 6.7 min | 40 seg  | 4 seg    | 0.4 seg |
| 100 MB | 13.3 min | 80 seg | 8 seg    | 0.8 seg |
| 250 MB | 33.3 min | 3.3 min | 20 seg   | 2 seg |
| 500 MB | 66.7 min | 6.7 min | 40 seg   | 4 seg |

**Nota**: Estos son tiempos teóricos. En la práctica, con overhead de HTTP y compresión, pueden variar ±30%.

---

## 💡 **Recomendaciones**

### Para Producción

1. **Considerar usar S3/Cloud Storage** para archivos muy grandes (>250MB)
2. **Implementar progress tracking** para mejor UX
3. **Validar tamaño en frontend** antes de subir
4. **Usar chunked uploads** para archivos gigantes (>500MB)
5. **Monitorear uso de memoria** del servidor
6. **Configurar CDN** para descargas de archivos

### Para Desarrollo

1. **Usar archivos de prueba pequeños** cuando sea posible
2. **Activar logs detallados** para debugging
3. **Monitorear memoria** con `docker stats`
4. **Limpiar archivos temporales** regularmente

---

## 📝 **Checklist de Actualización**

- [x] ✅ Express JSON limit → 500MB
- [x] ✅ Express URL Encoded limit → 500MB
- [x] ✅ Multer upload.ts → 500MB
- [x] ✅ Multer import.ts → 500MB
- [x] ✅ Nginx client_max_body_size → 500M
- [x] ✅ Nginx timeouts → 300s
- [x] ✅ Axios timeout → 300s
- [x] ✅ Axios maxContentLength → 500MB
- [x] ✅ Axios maxBodyLength → 500MB
- [ ] ⏳ Rebuild backend
- [ ] ⏳ Rebuild frontend
- [ ] ⏳ Reiniciar Nginx
- [ ] ⏳ Probar subida de archivo grande
- [ ] ⏳ Verificar logs sin errores

---

## 🔗 **Archivos Modificados**

1. ✅ `backend/src/index.ts` (líneas 27-28)
2. ✅ `backend/src/routes/upload.ts` (líneas 64-67)
3. ✅ `backend/src/routes/import.ts` (líneas 20-25)
4. ✅ `nginx.conf` (líneas 20-26)
5. ✅ `frontend/src/api.ts` (líneas 5-11)

---

## 📞 **Soporte**

Si después de aplicar estos cambios sigues teniendo problemas:

1. **Verificar logs**:
   ```bash
   docker-compose logs -f backend nginx
   ```

2. **Verificar que los cambios se aplicaron**:
   ```bash
   # Backend
   docker exec -it instrumentkb-backend cat /app/dist/index.js | grep "limit:"
   
   # Nginx
   docker exec -it instrumentkb-nginx cat /etc/nginx/nginx.conf | grep "client_max_body_size"
   ```

3. **Reiniciar completamente**:
   ```bash
   docker-compose down -v
   docker-compose up -d --build
   ```

---

**Última actualización:** 2024  
**Versión:** 2.0  
**Estado:** Todos los límites sincronizados a 500MB / 300s timeout

