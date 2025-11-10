#!/bin/bash

echo "🐳 InstrumentKB v2.0 - Docker Start Script"
echo "=========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Verificar Docker
print_color $BLUE "🔍 Verificando Docker..."
if ! command -v docker &> /dev/null; then
    print_color $RED "❌ Docker no está instalado"
    exit 1
fi

if ! docker info &> /dev/null; then
    print_color $RED "❌ Docker no está corriendo"
    exit 1
fi

print_color $GREEN "✅ Docker está listo"

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_color $RED "❌ Docker Compose no está instalado"
    exit 1
fi

print_color $GREEN "✅ Docker Compose está listo"
echo ""

# Limpiar contenedores anteriores
print_color $YELLOW "🧹 Limpiando contenedores anteriores..."
docker-compose down 2>/dev/null || docker compose down 2>/dev/null

# Crear directorios necesarios
print_color $BLUE "📁 Creando directorios..."
mkdir -p backend/uploads/documents
mkdir -p backend/uploads/images

# Construir imágenes
print_color $BLUE "🔨 Construyendo imágenes Docker..."
if docker-compose build 2>/dev/null; then
    print_color $GREEN "✅ Imágenes construidas"
else
    docker compose build
    print_color $GREEN "✅ Imágenes construidas"
fi
echo ""

# Levantar servicios
print_color $BLUE "🚀 Levantando servicios..."
echo ""

if docker-compose up -d 2>/dev/null; then
    print_color $GREEN "✅ Servicios levantados"
else
    docker compose up -d
    print_color $GREEN "✅ Servicios levantados"
fi

echo ""
print_color $YELLOW "⏳ Esperando que los servicios estén listos..."
echo ""

# Esperar PostgreSQL
print_color $BLUE "   🐘 PostgreSQL..."
for i in {1..30}; do
    if docker-compose exec -T db pg_isready -U kb_user -d instruments &>/dev/null || \
       docker compose exec -T db pg_isready -U kb_user -d instruments &>/dev/null; then
        print_color $GREEN "   ✅ PostgreSQL está listo"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        print_color $RED "   ❌ Timeout esperando PostgreSQL"
        exit 1
    fi
done

# Esperar Backend
print_color $BLUE "   🔧 Backend..."
for i in {1..60}; do
    if curl -s http://localhost:3002/api/health &>/dev/null; then
        print_color $GREEN "   ✅ Backend está listo"
        break
    fi
    sleep 2
    if [ $i -eq 60 ]; then
        print_color $RED "   ❌ Timeout esperando Backend"
        print_color $YELLOW "   📋 Ver logs: docker-compose logs backend"
        exit 1
    fi
done

# Esperar Frontend
print_color $BLUE "   ⚛️  Frontend..."
for i in {1..60}; do
    if curl -s http://localhost:3000 &>/dev/null; then
        print_color $GREEN "   ✅ Frontend está listo"
        break
    fi
    sleep 2
    if [ $i -eq 60 ]; then
        print_color $RED "   ❌ Timeout esperando Frontend"
        print_color $YELLOW "   📋 Ver logs: docker-compose logs frontend"
        exit 1
    fi
done

echo ""
print_color $GREEN "🎉 ¡InstrumentKB está listo!"
echo ""
print_color $BLUE "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_color $GREEN "📱 Frontend:  http://localhost:3000"
print_color $GREEN "🔌 Backend:   http://localhost:3002"
print_color $GREEN "🗄️  Database:  localhost:5434"
print_color $BLUE "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_color $YELLOW "📝 Comandos útiles:"
echo "   Ver logs:      docker-compose logs -f"
echo "   Parar:         docker-compose down"
echo "   Reiniciar:     docker-compose restart"
echo "   Entrar a DB:   docker-compose exec db psql -U kb_user -d instruments"
echo ""

# Test básico
print_color $BLUE "🧪 Ejecutando tests básicos..."
echo ""

# Test 1: Health check backend
if curl -s http://localhost:3002/api/health | grep -q "ok"; then
    print_color $GREEN "✅ Test 1: Backend health check OK"
else
    print_color $RED "❌ Test 1: Backend health check FAILED"
fi

# Test 2: Artículos SAP
ARTICLES=$(curl -s http://localhost:3002/api/articles | grep -o "INS-" | wc -l)
if [ "$ARTICLES" -gt 0 ]; then
    print_color $GREEN "✅ Test 2: Artículos SAP cargados ($ARTICLES encontrados)"
else
    print_color $YELLOW "⚠️  Test 2: No hay artículos SAP (normal en primera ejecución)"
fi

# Test 3: Fabricantes
MANUFACTURERS=$(curl -s http://localhost:3002/api/manufacturers | grep -o "manufacturer_id" | wc -l)
if [ "$MANUFACTURERS" -gt 0 ]; then
    print_color $GREEN "✅ Test 3: Fabricantes cargados ($MANUFACTURERS encontrados)"
else
    print_color $YELLOW "⚠️  Test 3: No hay fabricantes"
fi

# Test 4: Frontend responde
if curl -s http://localhost:3000 | grep -q "InstrumentKB\|root"; then
    print_color $GREEN "✅ Test 4: Frontend responde correctamente"
else
    print_color $RED "❌ Test 4: Frontend no responde"
fi

echo ""
print_color $GREEN "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_color $GREEN "✅ Todos los tests completados"
print_color $GREEN "🌐 Abre http://localhost:3000 en tu navegador"
print_color $GREEN "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

