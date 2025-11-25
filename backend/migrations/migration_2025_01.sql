-- =============================================================================
-- MIGRACIÓN SEGURA PARA PRODUCCIÓN - InstrumentKB
-- =============================================================================
-- Fecha: 2025-01-24
-- Descripción: Migración que añade funcionalidades sin perder datos
--
-- CAMBIOS INCLUIDOS:
-- 1. Añadir campos de calefacción a articles
-- 2. Cambiar tipo de salida analógica de ENUM a VARCHAR
-- 3. Crear tabla de accesorios con part_number
-- 4. Asegurar que scaling_notes existe en analog_outputs
--
-- INSTRUCCIONES PARA APLICAR EN PRODUCCIÓN:
-- 
-- 1. HACER BACKUP COMPLETO DE LA BASE DE DATOS:
--    pg_dump -U your_user -d instrumentkb -F c -b -v -f backup_before_migration_$(date +%Y%m%d_%H%M%S).backup
--
-- 2. Ejecutar este archivo:
--    psql -U your_user -d instrumentkb -f migration_2025_01.sql
--
-- 3. Si algo sale mal, restaurar el backup:
--    pg_restore -U your_user -d instrumentkb -v backup_before_migration_XXXXX.backup
-- =============================================================================

BEGIN;

-- =============================================================================
-- CAMBIO 1: Añadir campos de calefacción a la tabla articles
-- =============================================================================
-- Estos campos permitirán registrar si un equipo tiene sistema de calefacción

DO $$ 
BEGIN
    -- Añadir campo has_heating (si no existe)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'has_heating'
    ) THEN
        ALTER TABLE articles ADD COLUMN has_heating BOOLEAN DEFAULT FALSE;
        COMMENT ON COLUMN articles.has_heating IS 'Indica si el equipo tiene sistema de calefacción';
    END IF;

    -- Añadir campo heating_consumption_w (si no existe)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'heating_consumption_w'
    ) THEN
        ALTER TABLE articles ADD COLUMN heating_consumption_w REAL;
        COMMENT ON COLUMN articles.heating_consumption_w IS 'Consumo del sistema de calefacción en Watts';
    END IF;

    -- Añadir campo heating_temp_min_c (si no existe)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'heating_temp_min_c'
    ) THEN
        ALTER TABLE articles ADD COLUMN heating_temp_min_c REAL;
        COMMENT ON COLUMN articles.heating_temp_min_c IS 'Temperatura mínima del rango de calefacción en °C';
    END IF;

    -- Añadir campo heating_temp_max_c (si no existe)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'heating_temp_max_c'
    ) THEN
        ALTER TABLE articles ADD COLUMN heating_temp_max_c REAL;
        COMMENT ON COLUMN articles.heating_temp_max_c IS 'Temperatura máxima del rango de calefacción en °C';
    END IF;
END $$;

-- =============================================================================
-- CAMBIO 2: Cambiar tipo de salida analógica de ENUM a VARCHAR
-- =============================================================================
-- Esto permite valores personalizados como Voltage_0_2V sin restricciones

DO $$ 
BEGIN
    -- Verificar si la columna type en analog_outputs es ENUM
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analog_outputs' 
        AND column_name = 'type'
        AND udt_name = 'AnalogOutputType'
    ) THEN
        -- Cambiar el tipo de ENUM a VARCHAR sin perder datos
        -- Primero crear columna temporal
        ALTER TABLE analog_outputs ADD COLUMN type_temp VARCHAR(100);
        
        -- Copiar datos convirtiendo ENUM a VARCHAR
        UPDATE analog_outputs SET type_temp = type::text;
        
        -- Eliminar columna antigua
        ALTER TABLE analog_outputs DROP COLUMN type;
        
        -- Renombrar columna temporal
        ALTER TABLE analog_outputs RENAME COLUMN type_temp TO type;
        
        -- Añadir constraint NOT NULL
        ALTER TABLE analog_outputs ALTER COLUMN type SET NOT NULL;
        
        RAISE NOTICE 'Columna analog_outputs.type convertida de ENUM a VARCHAR exitosamente';
    END IF;
END $$;

-- =============================================================================
-- CAMBIO 3: Crear tabla de accesorios con part_number
-- =============================================================================

-- Crear tabla accessories si no existe
CREATE TABLE IF NOT EXISTS accessories (
    accessory_id SERIAL PRIMARY KEY,
    article_id VARCHAR(100) NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    part_number VARCHAR(255),
    description TEXT,
    quantity INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT accessories_article_id_name_unique UNIQUE(article_id, name)
);

-- Añadir índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_accessories_article_id ON accessories(article_id);

-- Comentarios para documentación
COMMENT ON TABLE accessories IS 'Accesorios asociados a cada artículo';
COMMENT ON COLUMN accessories.part_number IS 'Número de parte del accesorio';
COMMENT ON COLUMN accessories.quantity IS 'Cantidad de unidades del accesorio incluidas';

-- =============================================================================
-- CAMBIO 4: Asegurar que scaling_notes existe en analog_outputs
-- =============================================================================

DO $$ 
BEGIN
    -- Verificar si la columna scaling_notes existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analog_outputs' AND column_name = 'scaling_notes'
    ) THEN
        ALTER TABLE analog_outputs ADD COLUMN scaling_notes TEXT;
        COMMENT ON COLUMN analog_outputs.scaling_notes IS 'Notas sobre el escalado y configuración de la salida analógica';
    END IF;
END $$;

-- =============================================================================
-- CAMBIO 5: Eliminar ENUM AnalogOutputType si ya no se usa
-- =============================================================================

DO $$ 
BEGIN
    -- Solo eliminar el ENUM si la columna ya fue convertida
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analog_outputs' 
        AND column_name = 'type'
        AND udt_name = 'AnalogOutputType'
    ) THEN
        -- Verificar si el tipo ENUM existe antes de intentar eliminarlo
        IF EXISTS (
            SELECT 1 FROM pg_type WHERE typname = 'AnalogOutputType'
        ) THEN
            DROP TYPE "AnalogOutputType";
            RAISE NOTICE 'ENUM AnalogOutputType eliminado exitosamente';
        END IF;
    END IF;
END $$;

-- =============================================================================
-- VERIFICACIÓN Y ESTADÍSTICAS
-- =============================================================================

-- Mostrar resumen de cambios
DO $$ 
DECLARE
    articles_count INTEGER;
    analog_outputs_count INTEGER;
    accessories_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO articles_count FROM articles;
    SELECT COUNT(*) INTO analog_outputs_count FROM analog_outputs;
    SELECT COUNT(*) INTO accessories_count FROM accessories;
    
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'MIGRACIÓN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Artículos en la base de datos: %', articles_count;
    RAISE NOTICE 'Salidas analógicas: %', analog_outputs_count;
    RAISE NOTICE 'Accesorios: %', accessories_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Nuevos campos añadidos a articles:';
    RAISE NOTICE '  - has_heating (BOOLEAN)';
    RAISE NOTICE '  - heating_consumption_w (REAL)';
    RAISE NOTICE '  - heating_temp_min_c (REAL)';
    RAISE NOTICE '  - heating_temp_max_c (REAL)';
    RAISE NOTICE '';
    RAISE NOTICE 'Tabla accessories creada con soporte para part_number';
    RAISE NOTICE 'Tipo de analog_outputs.type cambiado a VARCHAR (permite valores personalizados)';
    RAISE NOTICE '=============================================================================';
END $$;

COMMIT;

-- =============================================================================
-- ROLLBACK (Solo en caso de emergencia)
-- =============================================================================
-- Si necesitas hacer rollback, ejecuta esto:
-- 
-- BEGIN;
-- ALTER TABLE articles DROP COLUMN IF EXISTS has_heating;
-- ALTER TABLE articles DROP COLUMN IF EXISTS heating_consumption_w;
-- ALTER TABLE articles DROP COLUMN IF EXISTS heating_temp_min_c;
-- ALTER TABLE articles DROP COLUMN IF EXISTS heating_temp_max_c;
-- DROP TABLE IF EXISTS accessories CASCADE;
-- COMMIT;
-- 
-- Luego restaura el backup completo.
-- =============================================================================





