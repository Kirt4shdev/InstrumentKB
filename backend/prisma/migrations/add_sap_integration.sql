-- Migration to add SAP integration
-- Version: 2.0
-- Generated: 2025-11-09

-- Create articles table (SAP integration)
CREATE TABLE articles (
  article_id TEXT PRIMARY KEY,
  sap_itemcode TEXT UNIQUE,
  sap_description TEXT NOT NULL,
  family TEXT,
  subfamily TEXT,
  internal_notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add article_id to instruments table
ALTER TABLE instruments
  ADD COLUMN article_id TEXT REFERENCES articles(article_id)
    ON UPDATE CASCADE ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_instruments_article_id ON instruments(article_id);
CREATE INDEX idx_articles_active ON articles(active);
CREATE INDEX idx_articles_family ON articles(family);

-- Insert sample articles
INSERT INTO articles (article_id, sap_itemcode, sap_description, family, subfamily, internal_notes, active) VALUES
('INS-000347', 'A1000347', 'Sensor CTD Oceanográfico Sea-Bird SBE 37-SI MicroCAT', 'Sensores', 'Oceanografía', 'Sensor de alta precisión para mediciones submarinas', TRUE),
('INS-000512', 'A1000512', 'Datalogger Industrial Campbell Scientific CR1000X', 'Dataloggers', 'Industriales', 'Datalogger robusto para entornos industriales', TRUE),
('INS-000789', 'A1000789', 'Estación Meteorológica Completa Vaisala WXT536', 'Sensores', 'Meteorología', 'Estación todo-en-uno para monitoreo meteorológico', TRUE);

-- Comments
COMMENT ON TABLE articles IS 'Artículos SAP - Nexo maestro corporativo';
COMMENT ON COLUMN articles.article_id IS 'Código maestro interno del artículo';
COMMENT ON COLUMN articles.sap_itemcode IS 'ItemCode en SAP Business One';
COMMENT ON COLUMN articles.sap_description IS 'Descripción oficial del artículo en SAP';
COMMENT ON COLUMN articles.family IS 'Clasificación: Sensores, Dataloggers, Transmisores, etc.';
COMMENT ON COLUMN articles.subfamily IS 'Subclasificación: Oceanografía, Meteorología, Industrial, etc.';

