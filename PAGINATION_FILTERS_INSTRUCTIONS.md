# Paginación y Filtros en la Página Principal

## Resumen de Cambios

Se han implementado las siguientes funcionalidades en la tabla de artículos de la página principal:

### 1. **Paginación**
- Control de número de elementos por página (10, 25, 50, 100)
- Navegación entre páginas con controles intuitivos
- Información de rango de elementos mostrados
- Botones de navegación con "edges" (primera y última página)

### 2. **Filtros Avanzados**
Panel de filtros desplegable con las siguientes opciones:
- **Código SAP**: Búsqueda por texto
- **Modelo**: Búsqueda por texto
- **Categoría**: Selección múltiple de categorías
- **Fabricante**: Selección múltiple de fabricantes
- **Estado**: Filtro por activo/inactivo
- **Items por página**: Selector de paginación

### 3. **Ordenamiento de Columnas**
Todas las columnas principales son ordenables haciendo click en el encabezado:
- Código SAP
- Tipo
- Descripción
- Categoría
- Fabricante
- Modelo
- Estado

### 4. **Búsqueda Global**
Búsqueda general que filtra por:
- Código SAP
- Descripción
- Modelo

## Características Implementadas

### Paginación Inteligente
```typescript
// Configuración de paginación
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(25);
```

- **Valores por defecto**: 25 elementos por página
- **Opciones**: 10, 25, 50, 100 elementos
- **Controles**: Botones de primera, anterior, siguiente, última página
- **Información**: Muestra rango actual (ej: "Mostrando 1-25 de 100 artículos")

### Filtros Avanzados
```typescript
const [filters, setFilters] = useState({
  sap_itemcode: '',
  category: [] as string[],
  manufacturer: [] as string[],
  model: '',
  active: null as boolean | null,
});
```

#### Panel Desplegable
- Botón "Filtros" para mostrar/ocultar panel
- Mantiene filtros aplicados aunque esté colapsado
- Botón "Limpiar Filtros" para resetear todos los filtros

#### Filtros de Texto
- **Código SAP**: Búsqueda case-insensitive
- **Modelo**: Búsqueda case-insensitive

#### Filtros de Selección Múltiple
- **Categoría**: MultiSelect con búsqueda
- **Fabricante**: MultiSelect con búsqueda
- Ambos permiten seleccionar múltiples valores
- Búsqueda interna en las opciones

#### Filtro de Estado
- **Todos**: Muestra activos e inactivos
- **Activo**: Solo artículos activos
- **Inactivo**: Solo artículos inactivos

### Ordenamiento
- Click en header de columna para ordenar
- Primer click: orden ascendente
- Segundo click: orden descendente
- Indicador visual (flecha arriba/abajo)
- Ordenamiento inteligente:
  - Texto: alfabético
  - Números: numérico
  - Nulls/undefined: al final

### Contador de Resultados
Footer dinámico que muestra:
- Con filtros: "X artículos filtrados de Y totales"
- Sin filtros: "Total: Y artículos"

## Interfaz de Usuario

### Barra de Búsqueda
```
┌─────────────────────────────────────────────────────────────┐
│ [🔍 Buscar...] [Tipo ▼] [Buscar] [Filtros ▼]               │
└─────────────────────────────────────────────────────────────┘
```

### Panel de Filtros (Desplegable)
```
┌─────────────────────────────────────────────────────────────┐
│ ┌──────────────────┐ ┌──────────────────┐                   │
│ │ Código SAP       │ │ Modelo           │                   │
│ └──────────────────┘ └──────────────────┘                   │
│                                                               │
│ ┌──────────────────┐ ┌──────────────────┐                   │
│ │ Categoría ✓✓     │ │ Fabricante ✓✓    │                   │
│ └──────────────────┘ └──────────────────┘                   │
│                                                               │
│ ┌──────────────────┐ ┌──────────────────┐                   │
│ │ Estado ▼         │ │ Por página ▼     │                   │
│ └──────────────────┘ └──────────────────┘                   │
│                                                               │
│                            [Limpiar Filtros]                 │
└─────────────────────────────────────────────────────────────┘
```

### Tabla con Headers Ordenables
```
┌────────────────────────────────────────────────────────────┐
│ Código SAP ▲ │ Tipo │ Descripción │ Categoría │ ... │ ⚙️  │
├─────────────┼──────┼─────────────┼───────────┼─────┼────┤
│ ...         │ ...  │ ...         │ ...       │ ... │ ... │
└────────────────────────────────────────────────────────────┘
```

### Paginación
```
┌─────────────────────────────────────────────────────────────┐
│ Mostrando 1-25 de 100 artículos                             │
│                          [« 1 2 3 ... 4 »]                  │
└─────────────────────────────────────────────────────────────┘
```

## Flujo de Uso

### 1. Búsqueda Básica
1. Escribir en campo de búsqueda
2. Presionar Enter o click en "Buscar"
3. Se filtran artículos por código, descripción o modelo

### 2. Filtros Avanzados
1. Click en botón "Filtros"
2. Panel se despliega
3. Aplicar filtros deseados:
   - Escribir texto en campos de búsqueda
   - Seleccionar opciones en MultiSelect
   - Elegir estado
4. Filtros se aplican automáticamente
5. Click en "Limpiar Filtros" para resetear

### 3. Ordenamiento
1. Click en header de columna
2. Datos se ordenan ascendentemente
3. Click nuevamente para orden descendente
4. Flecha indica dirección actual

### 4. Paginación
1. Navegar con botones numéricos
2. Usar botones «/» para primera/última página
3. Cambiar items por página en filtros avanzados

## Optimizaciones

### Performance
- Filtrado y ordenamiento en cliente (rápido para conjuntos pequeños-medianos)
- Paginación después de filtros (solo renderiza elementos visibles)
- Reseteo de página al cambiar filtros

### UX/UI
- Filtros colapsables para ahorrar espacio
- Indicadores visuales claros (flechas de orden, contadores)
- Búsqueda con Enter para evitar búsquedas excesivas
- MultiSelect con búsqueda interna
- Headers con cursor pointer y sin selección de texto

### Estado
- Filtros mantienen su valor aunque el panel esté colapsado
- Página se resetea a 1 al aplicar nuevos filtros
- Contador muestra claramente si hay filtros activos

## Ejemplos de Uso

### Caso 1: Buscar Instrumentos de un Fabricante Específico
1. Expandir panel de filtros
2. En "Tipo": Seleccionar "INSTRUMENTO"
3. En "Fabricante": Seleccionar fabricante deseado
4. Ver resultados filtrados
5. Ordenar por "Modelo" si es necesario

### Caso 2: Artículos Inactivos para Revisión
1. Expandir panel de filtros
2. En "Estado": Seleccionar "Inactivo"
3. Ver todos los artículos inactivos
4. Ordenar por "Código SAP" o "Descripción"

### Caso 3: Buscar Cable Específico
1. Búsqueda rápida: escribir código o modelo en barra principal
2. O usar filtros:
   - Tipo: "CABLE"
   - Modelo: escribir parte del modelo
3. Ordenar por "Fabricante" para agrupar

## Notas Técnicas

### Dependencias Agregadas
- `@mantine/core`: Componentes Pagination, MultiSelect, Collapse
- Iconos: IconChevronDown, IconChevronUp, IconArrowUp, IconArrowDown, IconFilterOff

### Funciones Principales
```typescript
// Filtrado
const getFilteredArticles = () => { ... }

// Paginación
const getPaginatedArticles = () => { ... }

// Ordenamiento
const handleSort = (column: string) => { ... }

// Limpiar filtros
const handleClearFilters = () => { ... }
```

### Estado de Filtros
```typescript
interface Filters {
  sap_itemcode: string;
  category: string[];
  manufacturer: string[];
  model: string;
  active: boolean | null;
}
```

## Mejoras Futuras Sugeridas

1. **Persistencia de Filtros**
   - Guardar filtros en localStorage
   - Restaurar al volver a la página

2. **Exportar Filtrados**
   - Exportar solo artículos filtrados
   - Botón adicional en panel de filtros

3. **Filtros por URL**
   - Query parameters para compartir vistas filtradas
   - Deep linking a resultados específicos

4. **Paginación en Servidor**
   - Para conjuntos de datos muy grandes (>10,000 registros)
   - Endpoint con parámetros de paginación

5. **Más Filtros**
   - Rango de fechas (creación/actualización)
   - Stock mínimo/máximo
   - Presencia de documentos/imágenes

6. **Vistas Guardadas**
   - Guardar combinaciones de filtros como "vistas"
   - Acceso rápido a filtros frecuentes

7. **Filtros Rápidos (Quick Filters)**
   - Chips con filtros predefinidos
   - Ej: "Activos", "Con bajo stock", "Sin documentos"

## Archivos Modificados

- `frontend/src/pages/ArticleList.tsx`: Componente principal actualizado
  - Nuevos estados para paginación y filtros
  - Funciones de filtrado, ordenamiento y paginación
  - UI actualizada con panel de filtros desplegable
  - Headers ordenables con indicadores visuales
  - Componente de paginación

## Testing

### Casos de Prueba

1. **Paginación**
   - ✓ Cambiar página funciona correctamente
   - ✓ Cambiar items por página resetea a página 1
   - ✓ Número total de páginas es correcto
   - ✓ Rango mostrado es correcto

2. **Filtros**
   - ✓ Filtro por código SAP funciona
   - ✓ Filtro por categoría funciona
   - ✓ Filtro por fabricante funciona
   - ✓ Filtro por modelo funciona
   - ✓ Filtro por estado funciona
   - ✓ Combinación de filtros funciona
   - ✓ Limpiar filtros resetea todo

3. **Ordenamiento**
   - ✓ Ordenar por cada columna funciona
   - ✓ Alternar entre asc/desc funciona
   - ✓ Indicador visual es correcto

4. **Integración**
   - ✓ Búsqueda global + filtros avanzados
   - ✓ Filtros + ordenamiento
   - ✓ Filtros + paginación
   - ✓ Todo junto funciona correctamente

