#!/bin/bash

echo "🚀 Iniciando InstrumentKB..."

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Levantar servicios
echo "📦 Levantando servicios con Docker Compose..."
docker-compose up -d

echo "⏳ Esperando a que la base de datos esté lista..."
sleep 10

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones de base de datos..."
docker-compose exec -T backend npx prisma migrate deploy

echo "✅ InstrumentKB está listo!"
echo ""
echo "🌐 Aplicación: http://localhost:8080"
echo "🔌 Backend API: http://localhost:3002 (interno)"
echo "🗄️ Database: postgresql://kb_user:kb_pass@localhost:5434/instruments"
echo ""
echo "Para ver los logs: docker-compose logs -f"
echo "Para detener: docker-compose down"

