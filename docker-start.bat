@echo off
echo ================================
echo InstrumentKB v2.0 - Docker Start
echo ================================
echo.

REM Verificar Docker
echo Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker no esta instalado
    pause
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker no esta corriendo
    pause
    exit /b 1
)

echo [OK] Docker esta listo
echo.

REM Limpiar contenedores anteriores
echo Limpiando contenedores anteriores...
docker-compose down >nul 2>&1

REM Crear directorios
echo Creando directorios...
if not exist "backend\uploads\documents" mkdir backend\uploads\documents
if not exist "backend\uploads\images" mkdir backend\uploads\images

REM Construir imágenes
echo.
echo Construyendo imagenes Docker...
docker-compose build
if errorlevel 1 (
    echo ERROR: No se pudieron construir las imagenes
    pause
    exit /b 1
)

echo [OK] Imagenes construidas
echo.

REM Levantar servicios
echo Levantando servicios...
docker-compose up -d
if errorlevel 1 (
    echo ERROR: No se pudieron levantar los servicios
    pause
    exit /b 1
)

echo.
echo Esperando que los servicios esten listos...
timeout /t 15 /nobreak >nul

echo.
echo ================================
echo   InstrumentKB esta listo!
echo ================================
echo.
echo Aplicacion: http://localhost:8080
echo Backend:    http://localhost:3002 (interno)
echo Database:   localhost:5434
echo.
echo Comandos utiles:
echo   Ver logs:    docker-compose logs -f
echo   Parar:       docker-compose down
echo   Reiniciar:   docker-compose restart
echo.
echo Abre http://localhost:8080 en tu navegador
echo.

pause

