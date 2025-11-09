// Tipos de artículo
export type ArticleType =
  | 'INSTRUMENTO'
  | 'CABLE'
  | 'SOPORTE'
  | 'APARAMENTA_AC'
  | 'APARAMENTA_DC'
  | 'SENSOR'
  | 'ACTUADOR'
  | 'DATALOGGER'
  | 'FUENTE_ALIMENTACION'
  | 'MODULO_IO'
  | 'GATEWAY'
  | 'CAJA_CONEXIONES'
  | 'RACK'
  | 'PANEL'
  | 'PROTECCION'
  | 'CONECTOR'
  | 'HERRAMIENTA'
  | 'CONSUMIBLE'
  | 'REPUESTO'
  | 'SOFTWARE'
  | 'LICENCIA'
  | 'OTROS';

export interface Article {
  article_id: string;
  sap_itemcode?: string;
  sap_description: string;
  article_type: ArticleType;
  category?: string;
  family?: string;
  subfamily?: string;
  manufacturer_id?: number;
  model?: string;
  variant?: string;
  
  // Especificaciones técnicas
  power_supply_min_v?: number;
  power_supply_max_v?: number;
  power_consumption_typ_w?: number;
  current_max_a?: number;
  voltage_rating_v?: number;
  
  // Características físicas
  ip_rating?: string;
  dimensions_mm?: string;
  weight_g?: number;
  length_m?: number;
  diameter_mm?: number;
  material?: string;
  color?: string;
  
  // Condiciones ambientales
  oper_temp_min_c?: number;
  oper_temp_max_c?: number;
  storage_temp_min_c?: number;
  storage_temp_max_c?: number;
  oper_humidity_min_pct?: number;
  oper_humidity_max_pct?: number;
  altitude_max_m?: number;
  
  // Certificaciones
  emc_compliance?: string;
  certifications?: string;
  
  // Ciclo de vida
  first_release_year?: number;
  last_revision_year?: number;
  discontinued?: boolean;
  replacement_article_id?: string;
  
  // Gestión
  internal_notes?: string;
  active: boolean;
  stock_location?: string;
  min_stock?: number;
  current_stock?: number;
  
  created_at: string;
  updated_at: string;
  
  // Relaciones
  manufacturer?: Manufacturer;
  article_variables?: ArticleVariable[];
  article_protocols?: ArticleProtocol[];
  tags?: Tag[];
  documents?: Document[];
  images?: Image[];
  analog_outputs?: AnalogOutput[];
  digital_io?: DigitalIO[];
  modbus_registers?: ModbusRegister[];
  sdi12_commands?: SDI12Command[];
  nmea_sentences?: NMEASentence[];
  replaced_by?: Article[];
  replacement_for?: Article;
}

export interface Manufacturer {
  manufacturer_id: number;
  name: string;
  country?: string;
  website?: string;
  support_email?: string;
  notes?: string;
}

export interface VariableDict {
  variable_id: number;
  name: string;
  unit_default?: string;
  description?: string;
}

export interface ArticleVariable {
  art_var_id: number;
  article_id: string;
  variable_id: number;
  range_min?: number;
  range_max?: number;
  unit?: string;
  accuracy_abs?: number;
  accuracy_rel_pct?: number;
  resolution?: number;
  update_rate_hz?: number;
  notes?: string;
  variable?: VariableDict;
}

export interface ArticleProtocol {
  art_proto_id: number;
  article_id: string;
  type: string;
  physical_layer?: string;
  port_label?: string;
  default_address?: string;
  baudrate?: number;
  databits?: number;
  parity?: string;
  stopbits?: number;
  ip_address?: string;
  ip_port?: number;
  notes?: string;
}

export interface Tag {
  tag_id: number;
  article_id: string;
  tag: string;
}

export interface Document {
  document_id: number;
  article_id: string;
  type: string;
  title: string;
  language?: string;
  revision?: string;
  publish_date?: string;
  url_or_path: string;
  sha256?: string;
  notes?: string;
}

export interface Image {
  image_id: number;
  article_id: string;
  caption?: string;
  url_or_path: string;
  credit?: string;
  license?: string;
  notes?: string;
}

export interface AnalogOutput {
  analog_out_id: number;
  article_id: string;
  type: string;
  num_channels?: number;
  range_min?: number;
  range_max?: number;
  unit?: string;
  load_min_ohm?: number;
  load_max_ohm?: number;
  accuracy?: string;
  scaling_notes?: string;
}

export interface DigitalIO {
  dio_id: number;
  article_id: string;
  direction: string;
  signal_type: string;
  voltage_level?: string;
  current_max_ma?: number;
  frequency_max_hz?: number;
  notes?: string;
}

export interface ModbusRegister {
  modbus_id: number;
  article_id: string;
  function_code: number;
  address: number;
  name: string;
  description?: string;
  datatype?: string;
  scale?: number;
  unit?: string;
  rw: string;
  min?: number;
  max?: number;
  default_value?: string;
  notes?: string;
  reference_document_id?: number;
}

export interface SDI12Command {
  sdi12_id: number;
  article_id: string;
  command: string;
  description?: string;
  response_format?: string;
  reference_document_id?: number;
}

export interface NMEASentence {
  nmea_id: number;
  article_id: string;
  sentence: string;
  description?: string;
  fields?: string;
  reference_document_id?: number;
}

export interface ArticleTypeOption {
  value: ArticleType;
  label: string;
}
