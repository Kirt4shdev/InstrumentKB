# Exportación e Importación ZIP con Archivos

## Resumen de Cambios

Se ha implementado la funcionalidad de exportación e importación masiva en formato ZIP que incluye:
- **Base de datos completa** (JSON con todos los artículos y relaciones)
- **Archivos físicos** (documentos e imágenes) manteniendo la estructura de carpetas original

## Características

### Exportación ZIP
- **Endpoint Backend**: `GET /api/export/zip`
- **Contenido del ZIP**:
  - `data.json`: Exportación completa de la base de datos en formato JSON
  - `uploads/`: Carpeta con todos los archivos (documentos e imágenes) organizados en sus subcarpetas originales
  - `README.txt`: Archivo de instrucciones con estadísticas de la exportación

### Importación ZIP
- **Endpoint Backend**: `POST /api/import/zip`
- **Proceso**:
  1. Extrae el ZIP en un directorio temporal
  2. Lee el archivo `data.json` con los datos de la base de datos
  3. Copia todos los archivos de la carpeta `uploads/` al directorio de almacenamiento manteniendo la estructura
  4. Importa todos los artículos y relaciones a la base de datos
  5. Limpia los archivos temporales

## Cómo Usar

### Desde la Interfaz Web

#### Exportar Backup Completo
1. Click en el botón **"Exportar"** en la barra superior
2. Seleccionar **"ZIP (Con archivos)"** en la sección "Backup Completo"
3. El navegador descargará un archivo `.zip` con nombre `instrumentkb-complete-backup-[timestamp].zip`
4. **Nota**: Este proceso puede tardar varios minutos dependiendo de la cantidad de archivos

#### Importar Backup Completo
1. Click en el botón **"Importar"** en la barra superior
2. Seleccionar **"ZIP (Con archivos)"** en la sección "Backup Completo"
3. Seleccionar el archivo `.zip` descargado previamente
4. El sistema procesará el archivo y mostrará un resumen:
   - Artículos creados
   - Artículos actualizados
   - Artículos fallidos (si hay)
   - Archivos copiados
   - Archivos omitidos (si hay)
5. La página se recargará automáticamente para mostrar los datos importados

### Desde la API

#### Exportar ZIP
```bash
curl -X GET http://localhost:3001/api/export/zip -o backup.zip
```

#### Importar ZIP
```bash
curl -X POST http://localhost:3001/api/import/zip \
  -F "file=@backup.zip"
```

## Estructura del ZIP Exportado

```
instrumentkb-complete-backup-[timestamp].zip
├── data.json                          # Datos completos de la BD
├── README.txt                         # Instrucciones e información
└── uploads/                           # Archivos físicos
    ├── Documents/                     # Documentos
    │   ├── Datasheets/
    │   │   └── datasheet1.pdf
    │   ├── Manuals/
    │   │   └── manual1.pdf
    │   └── ...
    └── Images/                        # Imágenes
        ├── Product_Photos/
        │   └── photo1.jpg
        └── ...
```

## Beneficios

1. **Backup Completo**: Todo en un solo archivo ZIP fácil de transferir
2. **Estructura Preservada**: Las carpetas se mantienen tal como están, facilitando el "copiar y pegar"
3. **Portabilidad**: Puedes mover la base de conocimientos entre diferentes instalaciones
4. **Disaster Recovery**: Restauración completa del sistema desde un solo archivo
5. **Versionado**: Puedes mantener múltiples versiones del backup con diferentes timestamps

## Notas Técnicas

### Backend
- **Dependencias añadidas**:
  - `archiver`: Para crear archivos ZIP
  - `extract-zip`: Para extraer archivos ZIP
  - `@types/archiver`: Tipos de TypeScript para archiver

- **Archivos modificados**:
  - `backend/src/routes/export.ts`: Nuevo endpoint `/export/zip`
  - `backend/src/routes/import.ts`: Nuevo endpoint `/import/zip`
  - `backend/src/routes/articles.ts`: Corrección de tipos TypeScript

### Frontend
- **Archivos modificados**:
  - `frontend/src/api.ts`: Funciones `exportZIP()` y `importZIP()`
  - `frontend/src/App.tsx`: Nuevos botones y manejadores para ZIP

### Consideraciones
- El proceso de exportación puede ser lento si hay muchos archivos
- El proceso de importación crea un directorio temporal que se elimina automáticamente
- Los archivos duplicados se sobrescriben durante la importación
- La importación maneja los conflictos de registros actualizando los existentes

## Solución de Problemas

### Exportación tarda mucho
- Normal si hay muchos archivos (cientos de MB)
- El navegador puede parecer que no responde, pero está procesando
- Espera pacientemente hasta que se descargue el archivo

### Error al importar
- Verifica que el archivo ZIP tenga la estructura correcta
- Asegúrate de que el archivo `data.json` exista en la raíz del ZIP
- Revisa los logs del servidor para más detalles

### Archivos faltantes
- El archivo `README.txt` dentro del ZIP lista todos los archivos que no se pudieron exportar
- Verifica que los archivos existan físicamente en el servidor antes de exportar
- Los archivos con URLs externas (http/https) no se incluyen en el ZIP

## Próximos Pasos

Para usar la funcionalidad:

1. **Iniciar el backend**:
   ```bash
   cd backend
   npm install  # Si aún no se instaló
   npm run dev
   ```

2. **Iniciar el frontend**:
   ```bash
   cd frontend
   npm install  # Si aún no se instaló
   npm run dev
   ```

3. Acceder a la interfaz web y probar la exportación/importación ZIP

## Compatibilidad con Otros Formatos

La exportación/importación ZIP es compatible con los formatos existentes:
- **JSON**: Solo datos, sin archivos
- **Excel**: Tablas separadas, sin archivos
- **SQL**: Dump de PostgreSQL, sin archivos

El formato **ZIP es el único que incluye archivos físicos**, haciéndolo ideal para:
- Backups completos
- Migración entre servidores
- Disaster recovery
- Archivado a largo plazo

