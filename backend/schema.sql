-- InstrumentKB Database Schema
-- PostgreSQL 12+
-- Run this file to create the database structure without Prisma

-- Create ENUMs
CREATE TYPE "ArticleType" AS ENUM (
  'INSTRUMENTO',
  'CABLE',
  'SOPORTE',
  'APARAMENTA_AC',
  'APARAMENTA_DC',
  'SENSOR',
  'ACTUADOR',
  'DATALOGGER',
  'FUENTE_ALIMENTACION',
  'MODULO_IO',
  'GATEWAY',
  'CAJA_CONEXIONES',
  'RACK',
  'PANEL',
  'PROTECCION',
  'CONECTOR',
  'HERRAMIENTA',
  'CONSUMIBLE',
  'REPUESTO',
  'SOFTWARE',
  'LICENCIA',
  'OTROS'
);

CREATE TYPE "DocumentType" AS ENUM (
  'datasheet',
  'manual',
  'quickstart',
  'appnote',
  'firmware',
  'catalog',
  'certificate',
  'drawing',
  'specification',
  'other'
);

-- AnalogOutputType ENUM eliminado - ahora se usa VARCHAR para permitir valores personalizados
-- Antes: CREATE TYPE "AnalogOutputType" AS ENUM (...)
-- Ahora: analog_outputs.type es VARCHAR(100)

CREATE TYPE "IODirection" AS ENUM (
  'input',
  'output'
);

CREATE TYPE "SignalType" AS ENUM (
  'Current_4_20mA',
  'Voltage_0_10V',
  'Pulse',
  'Relay',
  'TTL',
  'Other'
);

CREATE TYPE "ProtocolType" AS ENUM (
  'ModbusRTU',
  'ModbusTCP',
  'SDI12',
  'NMEA0183',
  'CANopen',
  'Profinet',
  'EthernetIP',
  'RS232',
  'RS485',
  'Other'
);

CREATE TYPE "Parity" AS ENUM (
  'N',
  'E',
  'O'
);

CREATE TYPE "ReadWrite" AS ENUM (
  'R',
  'W',
  'RW'
);

-- Manufacturers table
CREATE TABLE manufacturers (
  manufacturer_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  country VARCHAR(100),
  website VARCHAR(500),
  support_email VARCHAR(255),
  notes TEXT
);

-- Variables dictionary
CREATE TABLE variables_dict (
  variable_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  unit_default VARCHAR(50),
  description TEXT
);

-- Articles table (main table)
CREATE TABLE articles (
  article_id VARCHAR(100) PRIMARY KEY,
  sap_itemcode VARCHAR(100) UNIQUE,
  sap_description TEXT NOT NULL,
  article_type "ArticleType" NOT NULL,
  category VARCHAR(200),
  family VARCHAR(200),
  subfamily VARCHAR(200),
  
  manufacturer_id INTEGER REFERENCES manufacturers(manufacturer_id) ON DELETE SET NULL,
  model VARCHAR(255),
  variant VARCHAR(255),
  
  power_supply_min_v REAL,
  power_supply_max_v REAL,
  power_consumption_typ_w REAL,
  current_max_a REAL,
  voltage_rating_v REAL,
  
  ip_rating VARCHAR(50),
  dimensions_mm VARCHAR(200),
  weight_g REAL,
  length_m REAL,
  diameter_mm REAL,
  material VARCHAR(200),
  color VARCHAR(100),
  
  oper_temp_min_c REAL,
  oper_temp_max_c REAL,
  storage_temp_min_c REAL,
  storage_temp_max_c REAL,
  oper_humidity_min_pct REAL,
  oper_humidity_max_pct REAL,
  altitude_max_m REAL,
  
  has_heating BOOLEAN DEFAULT FALSE,
  heating_consumption_w REAL,
  heating_temp_min_c REAL,
  heating_temp_max_c REAL,
  
  emc_compliance TEXT,
  certifications TEXT,
  
  first_release_year INTEGER,
  last_revision_year INTEGER,
  discontinued BOOLEAN DEFAULT FALSE,
  replacement_article_id VARCHAR(100) REFERENCES articles(article_id) ON DELETE SET NULL,
  
  internal_notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  stock_location VARCHAR(200),
  min_stock INTEGER,
  current_stock INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for articles
CREATE INDEX idx_articles_type ON articles(article_type);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_manufacturer ON articles(manufacturer_id);
CREATE INDEX idx_articles_active ON articles(active);
CREATE INDEX idx_articles_family ON articles(family);
CREATE INDEX idx_articles_discontinued ON articles(discontinued);

-- Documents
CREATE TABLE documents (
  document_id SERIAL PRIMARY KEY,
  article_id VARCHAR(100) NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
  type "DocumentType" NOT NULL,
  title VARCHAR(500) NOT NULL,
  language VARCHAR(10),
  revision VARCHAR(50),
  publish_date TIMESTAMP,
  url_or_path TEXT NOT NULL,
  sha256 VARCHAR(64),
  notes TEXT
);

-- Images
CREATE TABLE images (
  image_id SERIAL PRIMARY KEY,
  article_id VARCHAR(100) NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
  caption TEXT,
  url_or_path TEXT NOT NULL,
  credit VARCHAR(255),
  license VARCHAR(100),
  notes TEXT
);

-- Article Variables
CREATE TABLE article_variables (
  art_var_id SERIAL PRIMARY KEY,
  article_id VARCHAR(100) NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
  variable_id INTEGER NOT NULL REFERENCES variables_dict(variable_id),
  range_min REAL,
  range_max REAL,
  unit VARCHAR(50),
  accuracy_abs REAL,
  accuracy_rel_pct REAL,
  resolution REAL,
  update_rate_hz REAL,
  notes TEXT,
  UNIQUE(article_id, variable_id)
);

-- Analog Outputs
CREATE TABLE analog_outputs (
  analog_out_id SERIAL PRIMARY KEY,
  article_id VARCHAR(100) NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  num_channels INTEGER,
  range_min REAL,
  range_max REAL,
  unit VARCHAR(50),
  load_min_ohm REAL,
  load_max_ohm REAL,
  accuracy VARCHAR(100),
  scaling_notes TEXT
);

-- Digital I/O
CREATE TABLE digital_io (
  dio_id SERIAL PRIMARY KEY,
  article_id VARCHAR(100) NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
  direction "IODirection" NOT NULL,
  signal_type "SignalType" NOT NULL,
  voltage_level VARCHAR(50),
  current_max_ma REAL,
  frequency_max_hz REAL,
  notes TEXT
);

-- Article Protocols
CREATE TABLE article_protocols (
  art_proto_id SERIAL PRIMARY KEY,
  article_id VARCHAR(100) NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
  type "ProtocolType" NOT NULL,
  physical_layer VARCHAR(100),
  port_label VARCHAR(100),
  default_address VARCHAR(50),
  baudrate INTEGER,
  databits INTEGER,
  parity "Parity",
  stopbits INTEGER,
  ip_address VARCHAR(50),
  ip_port INTEGER,
  notes TEXT
);

-- Modbus Registers
CREATE TABLE modbus_registers (
  modbus_id SERIAL PRIMARY KEY,
  article_id VARCHAR(100) NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
  function_code INTEGER NOT NULL,
  address INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  datatype VARCHAR(50),
  scale REAL,
  unit VARCHAR(50),
  rw "ReadWrite" NOT NULL,
  min REAL,
  max REAL,
  default_value VARCHAR(100),
  notes TEXT,
  reference_document_id INTEGER REFERENCES documents(document_id),
  UNIQUE(article_id, function_code, address)
);

-- SDI-12 Commands
CREATE TABLE sdi12_commands (
  sdi12_id SERIAL PRIMARY KEY,
  article_id VARCHAR(100) NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
  command VARCHAR(100) NOT NULL,
  description TEXT,
  response_format TEXT,
  reference_document_id INTEGER REFERENCES documents(document_id),
  UNIQUE(article_id, command)
);

-- NMEA Sentences
CREATE TABLE nmea_sentences (
  nmea_id SERIAL PRIMARY KEY,
  article_id VARCHAR(100) NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
  sentence VARCHAR(100) NOT NULL,
  description TEXT,
  fields TEXT,
  reference_document_id INTEGER REFERENCES documents(document_id),
  UNIQUE(article_id, sentence)
);

-- Tags
CREATE TABLE tags (
  tag_id SERIAL PRIMARY KEY,
  article_id VARCHAR(100) NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL
);

-- Provenance
CREATE TABLE provenance (
  prov_id SERIAL PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id INTEGER NOT NULL,
  field_name VARCHAR(100),
  source_document_id INTEGER REFERENCES documents(document_id),
  page VARCHAR(50),
  quote_or_note TEXT,
  article_id VARCHAR(100) NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE
);

-- Accessories
CREATE TABLE accessories (
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

CREATE INDEX idx_accessories_article_id ON accessories(article_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for articles
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed some basic data
INSERT INTO manufacturers (name, country, notes) VALUES 
  ('Generic', 'International', 'Fabricante genérico para artículos sin marca específica')
ON CONFLICT (name) DO NOTHING;

INSERT INTO variables_dict (name, unit_default, description) VALUES
  ('Temperatura', '°C', 'Temperatura ambiente o de proceso'),
  ('Presión', 'bar', 'Presión de fluido o gas'),
  ('Humedad', '%RH', 'Humedad relativa'),
  ('Nivel', 'm', 'Nivel de líquido'),
  ('Caudal', 'L/min', 'Caudal volumétrico'),
  ('pH', 'pH', 'Potencial de hidrógeno'),
  ('Conductividad', 'µS/cm', 'Conductividad eléctrica'),
  ('ORP', 'mV', 'Potencial de oxidación-reducción'),
  ('Oxígeno disuelto', 'mg/L', 'Concentración de oxígeno disuelto'),
  ('Turbidez', 'NTU', 'Turbidez del agua')
ON CONFLICT (name) DO NOTHING;

COMMIT;

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;




