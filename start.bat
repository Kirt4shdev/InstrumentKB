@echo off
echo Iniciando InstrumentKB...

REM Verificar que Docker este instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker no esta instalado. Por favor instala Docker primero.
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo Docker Compose no esta instalado. Por favor instala Docker Compose primero.
    exit /b 1
)

REM Levantar servicios
echo Levantando servicios con Docker Compose...
docker-compose up -d

echo Esperando a que la base de datos este lista...
timeout /t 10 /nobreak >nul

REM Ejecutar migraciones
echo Ejecutando migraciones de base de datos...
docker-compose exec -T backend npx prisma migrate deploy

echo InstrumentKB esta listo!
echo.
echo Aplicacion: http://localhost:8080
echo Backend API: http://localhost:3002 (interno)
echo Database: postgresql://kb_user:kb_pass@localhost:5434/instruments
echo.
echo Para ver los logs: docker-compose logs -f
echo Para detener: docker-compose down

pause

