# Aumento de Límites de Tamaño de Archivos

## Problema
Error de Multer: "File too large" al intentar importar archivos ZIP grandes.

## Solución
Se han aumentado los límites de tamaño de archivo en múltiples capas:

### 1. Express Middleware (index.ts)
**Antes:**
```typescript
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
```

**Después:**
```typescript
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));
```

### 2. Multer - Importación (import.ts)
**Antes:**
```typescript
const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max
  }
});
```

**Después:**
```typescript
const upload = multer({ 
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max
  }
});
```

### 3. Multer - Upload de Documentos/Imágenes (upload.ts)
**Antes:**
```typescript
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});
```

**Después:**
```typescript
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});
```

## Límites Actuales

| Tipo de Upload | Límite | Uso |
|----------------|--------|-----|
| **Express JSON** | 500 MB | Payload general de peticiones |
| **Express URL Encoded** | 500 MB | Formularios codificados |
| **Importación ZIP** | 500 MB | Backups completos con archivos |
| **Documentos/Imágenes** | 100 MB | Archivos individuales |

## Cómo Aplicar los Cambios

### 1. Recompilar el Backend
```bash
cd backend
npm run build
```

### 2. Reiniciar el Contenedor Docker
```bash
docker-compose restart backend
```

O si prefieres rebuild completo:
```bash
docker-compose down
docker-compose up -d --build backend
```

### 3. Verificar que Funciona
```bash
# Ver logs para confirmar que inició correctamente
docker-compose logs -f backend
```

Deberías ver:
```
🚀 Backend running on http://localhost:3002
📊 Database: PostgreSQL (SQL nativo - ¡Sin Prisma!)
```

## Testing

### Probar Importación ZIP
1. Ir a la interfaz web
2. Click en "Importar" → "ZIP (Con archivos)"
3. Seleccionar un archivo ZIP grande (hasta 500MB)
4. Debería funcionar sin errores

### Probar Upload de Documentos
1. Crear/editar un artículo
2. Subir un documento grande (hasta 100MB)
3. Debería funcionar sin errores

## Consideraciones de Memoria

### Memoria RAM Necesaria
Con estos límites, el servidor necesita suficiente RAM:
- **Mínimo recomendado**: 2GB RAM
- **Recomendado para producción**: 4GB RAM o más

### Ajustar Límites de Memoria de Docker (si es necesario)

Si experimentas problemas de memoria, ajusta el `docker-compose.yml`:

```yaml
services:
  backend:
    # ... otras configuraciones ...
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

## Monitoreo

### Ver Uso de Memoria
```bash
docker stats instrumentkb-backend
```

### Ver Logs de Errores de Memoria
```bash
docker-compose logs backend | grep -i "memory\|heap"
```

## Troubleshooting

### Error: "JavaScript heap out of memory"

Si ves este error, aumenta el heap de Node.js en el `Dockerfile`:

```dockerfile
# En backend/Dockerfile
CMD ["node", "--max-old-space-size=4096", "dist/index.js"]
```

O en `docker-compose.yml`:
```yaml
services:
  backend:
    environment:
      NODE_OPTIONS: "--max-old-space-size=4096"
```

### Error: "ENOMEM: not enough memory"

1. Aumentar memoria disponible para Docker
2. Reducir los límites de archivos
3. Usar streaming en lugar de buffers para archivos muy grandes

### El Servidor se Reinicia Durante Uploads Grandes

Esto puede indicar un OOM (Out of Memory). Soluciones:
1. Aumentar memoria disponible
2. Implementar streaming para archivos grandes
3. Reducir límites de archivo

## Mejoras Futuras (Opcional)

### 1. Streaming para Archivos Muy Grandes
En lugar de cargar todo el archivo en memoria, usar streams:

```typescript
import { pipeline } from 'stream/promises';

// En lugar de multer.memoryStorage()
const storage = multer.diskStorage({
  destination: '/tmp/uploads',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
```

### 2. Progress Tracking
Para archivos grandes, mostrar progreso de upload:

```typescript
// En el frontend
const formData = new FormData();
formData.append('file', file);

axios.post('/api/import/zip', formData, {
  onUploadProgress: (progressEvent) => {
    const percentCompleted = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    );
    console.log(`Upload: ${percentCompleted}%`);
  }
});
```

### 3. Validación de Tamaño en Frontend
Validar antes de enviar para mejor UX:

```typescript
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

if (file.size > MAX_FILE_SIZE) {
  alert('El archivo es demasiado grande. Máximo: 500MB');
  return;
}
```

## Archivos Modificados

- ✅ `backend/src/index.ts` - Límites de Express aumentados a 500MB
- ✅ `backend/src/routes/import.ts` - Límite de Multer aumentado a 500MB
- ✅ `backend/src/routes/upload.ts` - Límite de Multer aumentado a 100MB

## Comandos de Deployment

### Desarrollo
```bash
cd backend
npm run dev
```

### Producción con Docker
```bash
# Rebuild y reiniciar
docker-compose down
docker-compose up -d --build

# Ver logs
docker-compose logs -f backend
```

### Verificar Configuración
```bash
# Verificar límites en el código
grep -r "fileSize" backend/src/
grep -r "limit:" backend/src/index.ts
```

## Resumen

✅ **Express**: 500 MB  
✅ **Importación ZIP**: 500 MB  
✅ **Upload Individual**: 100 MB  
✅ **Sin errores de linter**  
✅ **Listo para deployment**  

## Notas Importantes

1. **Tiempo de Upload**: Archivos de 500MB pueden tardar varios minutos según la conexión
2. **Timeout**: Puede ser necesario aumentar timeouts de Nginx/proxy si usas uno
3. **Disco**: Asegurar suficiente espacio en disco para archivos temporales
4. **Producción**: Considerar usar almacenamiento en la nube (S3, Azure Blob) para archivos muy grandes

---

**Última actualización:** 2024  
**Versión Backend:** 2.0

