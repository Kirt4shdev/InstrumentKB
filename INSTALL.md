# ⚡ Instalación Rápida - 5 Minutos

## Opción 1: Docker (Más Fácil) 🐳

### Windows
```cmd
# Doble click en:
start.bat
```

### Linux/Mac
```bash
chmod +x start.sh
./start.sh
```

**¡Listo!** Abre http://localhost:3000

---

## Opción 2: Sin Docker (Manual) 💻

### 1. PostgreSQL
```bash
# Instalar PostgreSQL 16
# Windows: https://www.postgresql.org/download/windows/
# Linux: sudo apt install postgresql

# Crear base de datos
psql -U postgres
CREATE DATABASE instruments;
\q
```

### 2. Backend
```bash
cd backend
npm install
echo DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/instruments > .env
echo STORAGE_PATH=./uploads >> .env
echo PORT=3001 >> .env
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

### 3. Frontend (nueva terminal)
```bash
cd frontend
npm install
npm run dev
```

**¡Listo!** Abre http://localhost:3000

---

## ✅ Verificar que Todo Funciona

1. Backend: http://localhost:3001/api/health debe mostrar `{"status":"ok"}`
2. Frontend: http://localhost:3000 debe cargar la interfaz
3. Ver datos de ejemplo en el listado

---

## 🆘 Problemas?

### "Puerto en uso"
```bash
# Cambiar puerto en backend/.env y frontend/vite.config.ts
```

### "No se conecta a PostgreSQL"
```bash
# Verificar que PostgreSQL esté corriendo
# Windows: net start postgresql-x64-16
# Linux: sudo systemctl start postgresql
```

### "Prisma Client not generated"
```bash
cd backend
npx prisma generate
```

---

## 📚 Siguiente Paso

Lee **QUICKSTART.md** para guía detallada o **README.md** para documentación completa.

---

**Tiempo estimado:** 5 minutos con Docker, 15 sin Docker

