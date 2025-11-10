# 🚀 Configuración para Producción con Nginx

## 📝 Problema Resuelto

En producción, el frontend no puede conectarse a `localhost:3002` porque ese puerto solo existe en el servidor, no en la máquina del cliente. La solución es usar **Nginx como reverse proxy**.

## 🏗️ Arquitectura

```
Cliente (navegador)
    ↓
Nginx (puerto 8080)
    ↓
├─→ Frontend (puerto 3000 interno)
└─→ Backend API (puerto 3002 interno)
```

## 📦 Cambios Realizados

### 1. **nginx.conf** - Nuevo archivo
Reverse proxy que enruta:
- `/` → Frontend (puerto 3000)
- `/api/` → Backend (puerto 3002)
- `/uploads/` → Backend uploads

### 2. **docker-compose.yml**
- Añadido servicio `nginx` en puerto `8080` (puerto 80 ocupado por SAP Analytics)
- Frontend usa `VITE_API_URL: /api` (ruta relativa)
- Frontend ya no expone puerto directamente

### 3. **frontend/src/api.ts**
- Cambio de `http://localhost:3002/api` → `/api` (ruta relativa)

## 🔄 Cómo Actualizar en Producción

### Paso 1: Bajar los contenedores actuales
```bash
docker-compose down
```

### Paso 2: Asegurarse de tener el archivo nginx.conf
Verifica que existe `nginx.conf` en el directorio raíz del proyecto.

### Paso 3: Reconstruir y levantar
```bash
docker-compose build --no-cache frontend
docker-compose up -d
```

### Paso 4: Verificar que todo funcione
```bash
# Ver estado de contenedores
docker-compose ps

# Deberías ver 4 contenedores corriendo:
# - instrumentkb-nginx
# - instrumentkb-frontend
# - instrumentkb-backend
# - instrumentkb-db

# Ver logs
docker-compose logs -f nginx
docker-compose logs -f backend
```

### Paso 5: Probar la aplicación
```bash
# Desde el servidor
curl http://localhost:8080

# Desde el navegador (reemplaza con tu IP/dominio)
http://TU_IP_SERVIDOR:8080
```

## 🌐 URLs de Acceso

### Desarrollo Local (Windows/Mac)
- **Aplicación:** http://localhost:8080
- **Backend directo:** http://localhost:3002 (solo para debug)
- **Base de datos:** localhost:5434

### Producción (Linux Server)
- **Aplicación:** http://IP_DEL_SERVIDOR:8080
- **Backend:** Solo accesible internamente entre containers

## 🔍 Troubleshooting

### Error: ERR_CONNECTION_REFUSED
**Causa:** Los contenedores no están corriendo o nginx no arrancó.

**Solución:**
```bash
docker-compose ps
docker-compose logs nginx
docker-compose restart nginx
```

### Error: 502 Bad Gateway
**Causa:** Nginx no puede conectarse al backend o frontend.

**Solución:**
```bash
# Verificar que backend y frontend estén corriendo
docker-compose logs backend
docker-compose logs frontend

# Verificar red interna
docker network inspect instrumentkb_instrumentkb-network
```

### Backend no responde
```bash
# Ver logs del backend
docker-compose logs -f backend

# Entrar al contenedor
docker exec -it instrumentkb-backend sh

# Verificar conexión a DB desde el backend
docker exec -it instrumentkb-backend sh -c "npx prisma db push"
```

### Quiero usar otro puerto (no 8080)
Edita `docker-compose.yml`:
```yaml
nginx:
  ports:
    - "PUERTO_DESEADO:80"  # Ejemplo: "9090:80"
```

## 🔐 Configuración para Dominio con HTTPS

Si tienes un dominio (ej: `instrumentkb.tuempresa.com`):

### Opción A: Con Certbot (Let's Encrypt)
```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d instrumentkb.tuempresa.com

# Actualizar nginx.conf con el dominio
```

### Opción B: Con Traefik (recomendado para Docker)
Ver documentación de Traefik para configuración automática de SSL.

## 📊 Comparación: Local vs Producción

| Aspecto | Local (Desarrollo) | Producción |
|---------|-------------------|------------|
| Puerto de acceso | 3000 (frontend directo) | 8080 (nginx) |
| URL Backend | http://localhost:3002/api | /api (relativa) |
| CORS | No necesario | Manejado por nginx |
| SSL/HTTPS | No | Recomendado |
| Proxy | Vite dev server | Nginx |

## 🎯 Comandos Útiles

```bash
# Ver todos los logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f nginx
docker-compose logs -f backend

# Reiniciar un servicio
docker-compose restart nginx

# Reconstruir una imagen
docker-compose build --no-cache frontend

# Ver el consumo de recursos
docker stats

# Limpiar todo y empezar de cero
docker-compose down -v
docker system prune -a
```

## 📈 Monitoreo

### Verificar salud de servicios
```bash
# Health check del backend
curl http://localhost:8080/api/health

# Debería responder: {"status":"ok"}
```

### Ver estado de PostgreSQL
```bash
docker exec -it instrumentkb-db psql -U kb_user -d instruments -c "SELECT COUNT(*) FROM articles;"
```

## 🚨 Importante para Producción

1. **NO uses puerto 80, 3001, o 5433** - Ya están ocupados por SAP Analytics
2. **Accede siempre por puerto 8080** - No uses :3000 o :3002 directamente
3. **Usa un dominio real** - En vez de IP:8080, configura un subdominio
4. **Habilita HTTPS** - No uses HTTP en producción real
5. **Configura backups** - Para PostgreSQL y archivos uploads/

## 📝 Variables de Entorno Importantes

En `docker-compose.yml`:
```yaml
# Frontend
VITE_API_URL: /api  # Ruta relativa (IMPORTANTE)

# Backend
PORT: 3002  # Puerto interno
DATABASE_URL: postgresql://kb_user:kb_pass@db:5432/instruments
```

## 🔧 Próximos Pasos Recomendados

1. [ ] Configurar dominio propio
2. [ ] Añadir certificado SSL/TLS
3. [ ] Configurar backups automáticos de PostgreSQL
4. [ ] Añadir monitoreo (Prometheus + Grafana)
5. [ ] Configurar límites de recursos en docker-compose
6. [ ] Implementar rate limiting en nginx
7. [ ] Configurar logs centralizados

---

**🆘 Soporte:** Si tienes problemas, revisa los logs con `docker-compose logs -f` y verifica que todos los contenedores estén "Up" con `docker-compose ps`.

