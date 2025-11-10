# 📋 Lista Completa de Campos de Artículos - InstrumentKB

## Tabla de Contenidos
- [Información Básica](#información-básica)
- [Información SAP](#información-sap)
- [Información Técnica](#información-técnica)
- [Especificaciones Eléctricas](#especificaciones-eléctricas)
- [Especificaciones Mecánicas](#especificaciones-mecánicas)
- [Campos Específicos por Tipo](#campos-específicos-por-tipo)
- [Variables Medidas](#variables-medidas)
- [Protocolos de Comunicación](#protocolos-de-comunicación)
- [Entradas/Salidas (I/O)](#entradassal idas-io)
- [Registros Modbus](#registros-modbus)
- [Gestión de Stock](#gestión-de-stock)
- [Etiquetas y Metadatos](#etiquetas-y-metadatos)

---

## 📌 Información Básica

### Identificación del Artículo
- **ID del Artículo** (`article_id`): Identificador único del artículo
- **Tipo de Artículo** (`article_type`): Tipo principal del artículo
  - `INSTRUMENTO`
  - `CABLE`
  - `SOPORTE`
  - `APARAMENTA_AC`
  - `APARAMENTA_DC`
  - `SENSOR`
  - `ACTUADOR`
  - `DATALOGGER`
  - `FUENTE_ALIMENTACION`
  - `MODULO_IO`
  - `GATEWAY`
  - `CONECTOR`
  - `SOFTWARE`
  - `LICENCIA`

### Estado
- **Activo** (`active`): Si el artículo está activo o inactivo (booleano)
- **Fecha de Creación** (`created_at`): Timestamp de creación automática
- **Última Actualización** (`updated_at`): Timestamp de última modificación

---

## 🏢 Información SAP

### Códigos SAP
- **Código SAP** (`sap_itemcode`): Código del artículo en SAP
- **Descripción SAP** (`sap_description`): Descripción oficial del artículo en SAP (máx. 100 caracteres)

### Clasificación Jerárquica
- **Familia** (`family`): Familia a la que pertenece el artículo (ej: "Instrumentación")
- **Subfamilia** (`subfamily`): Subfamilia dentro de la familia (ej: "Medidores de Caudal")
- **Categoría** (`category`): Categoría específica del artículo (ej: "Ultrasónico")

---

## 🔧 Información Técnica

### Fabricación
- **Fabricante** (`manufacturer_id`): ID del fabricante (relación con tabla `manufacturers`)
  - **Nombre del Fabricante** (`manufacturer.name`)
  - **País del Fabricante** (`manufacturer.country`)
  - **Sitio Web** (`manufacturer.website`)
- **Modelo** (`model`): Modelo del artículo (máx. 100 caracteres)
- **Variante** (`variant`): Variante específica del modelo (máx. 50 caracteres)

### Documentación
- **Notas** (`notes`): Notas técnicas generales del artículo (texto)
- **Notas Internas** (`internal_notes`): Notas internas no visibles en exportaciones (texto)

---

## ⚡ Especificaciones Eléctricas

### Alimentación
- **Alimentación Mínima** (`power_supply_min_v`): Voltaje mínimo de alimentación (VDC)
- **Alimentación Máxima** (`power_supply_max_v`): Voltaje máximo de alimentación (VDC)
- **Voltaje Nominal** (`voltage_rating_v`): Voltaje nominal de trabajo (V)

### Consumo y Corriente
- **Corriente Máxima** (`current_max_a`): Corriente máxima soportada (A)
- **Consumo Típico** (`power_consumption_typ_w`): Consumo de potencia típico (W)
- **Consumo Máximo** (`power_consumption_max_w`): Consumo de potencia máximo (W)

---

## 📐 Especificaciones Mecánicas

### Dimensiones
- **Dimensiones** (`dimensions_mm`): Dimensiones físicas del artículo (ej: "100x50x30 mm")
- **Peso** (`weight_g`): Peso del artículo en gramos (g)
- **Grado IP** (`ip_rating`): Grado de protección IP (ej: "IP65", "IP67")

---

## 🎯 Campos Específicos por Tipo

### 📡 CABLE
- **Longitud** (`length_m`): Longitud del cable en metros (m)
- **Diámetro** (`diameter_mm`): Diámetro del cable en milímetros (mm)
- **Material** (`material`): Material del cable (ej: "Cobre", "Fibra óptica")
- **Color** (`color`): Color del cable
- **Número de Conductores** (`num_conductors`): Cantidad de conductores
- **Apantallado** (`shielded`): Si el cable está apantallado (booleano)

### 📊 INSTRUMENTO / SENSOR / DATALOGGER
Estos tipos tienen acceso a:
- **Variables Medidas** (tabla `article_variables`)
- **Protocolos de Comunicación** (tabla `article_protocols`)
- **Registros Modbus** (tabla `modbus_registers`)

### 🔌 ACTUADOR / MODULO_IO / GATEWAY
Estos tipos tienen acceso a:
- **Entradas/Salidas (I/O)** (tabla `article_io`)
- **Protocolos de Comunicación** (tabla `article_protocols`)

### ⚙️ APARAMENTA_AC / APARAMENTA_DC
Campos eléctricos adicionales para aparamenta.

### 🔩 SOPORTE / CONECTOR
Campos mecánicos y de montaje.

### 💻 SOFTWARE / LICENCIA
- **Versión del Software** (podría agregarse)
- **Tipo de Licencia** (podría agregarse)
- **Fecha de Expiración** (podría agregarse)

---

## 📊 Variables Medidas

Tabla: `article_variables` (relación muchos a muchos con `variables`)

Para cada variable asociada al artículo:

### Identificación
- **ID Variable-Artículo** (`art_var_id`): ID único de la relación
- **ID Artículo** (`article_id`): Referencia al artículo
- **ID Variable** (`variable_id`): Referencia a la variable medida
  - **Nombre de la Variable** (`variable.name`): ej: "Temperatura", "Presión", "Caudal"
  - **Símbolo** (`variable.symbol`): ej: "T", "P", "Q"

### Rango de Medición
- **Rango Mínimo** (`range_min`): Valor mínimo del rango de medición
- **Rango Máximo** (`range_max`): Valor máximo del rango de medición
- **Unidad** (`unit`): Unidad de medida (ej: "°C", "bar", "m³/h")

### Precisión
- **Precisión Absoluta** (`accuracy_abs`): Precisión en unidades absolutas
- **Precisión Relativa** (`accuracy_pct`): Precisión en porcentaje (%)
- **Resolución** (`resolution`): Resolución del sensor/instrumento

---

## 🔗 Protocolos de Comunicación

Tabla: `article_protocols`

Para cada protocolo soportado por el artículo:

### Identificación del Protocolo
- **ID Protocolo-Artículo** (`art_proto_id`): ID único
- **ID Artículo** (`article_id`): Referencia al artículo
- **Tipo de Protocolo** (`type`): Tipo de protocolo
  - `MODBUS_RTU`
  - `MODBUS_TCP`
  - `PROFINET`
  - `PROFIBUS`
  - `ETHERNET_IP`
  - `HART`
  - `FOUNDATION_FIELDBUS`
  - `4-20mA`
  - `RS485`
  - `RS232`
  - `CAN`
  - `CUSTOM`

### Capa Física
- **Capa Física** (`physical_layer`): Capa física del protocolo (ej: "RS485", "Ethernet")
- **Etiqueta del Puerto** (`port_label`): Etiqueta del conector físico (ej: "COM1", "RJ45-1")

### Configuración Serial (para protocolos serie)
- **Baudrate** (`baudrate`): Velocidad de transmisión (bps)
- **Bits de Datos** (`databits`): Bits de datos (5, 6, 7, 8)
- **Paridad** (`parity`): Paridad (`N`=None, `E`=Even, `O`=Odd)
- **Bits de Parada** (`stopbits`): Bits de parada (1, 1.5, 2)

### Configuración TCP/IP
- **Dirección IP** (`ip_address`): Dirección IP del dispositivo
- **Puerto IP** (`ip_port`): Puerto TCP/UDP
- **Máscara de Subred** (`subnet_mask`): Máscara de subred
- **Gateway** (`gateway_ip`): Gateway predeterminado

### Configuración Modbus
- **Dirección Modbus** (`modbus_address`): Dirección esclavo Modbus (1-247)

### Otros
- **Notas del Protocolo** (`notes`): Notas adicionales sobre la configuración

---

## 🔌 Entradas/Salidas (I/O)

Tabla: `article_io`

Para cada entrada o salida del artículo:

### Identificación I/O
- **ID I/O** (`io_id`): ID único
- **ID Artículo** (`article_id`): Referencia al artículo
- **Tipo de I/O** (`io_type`): Tipo de entrada/salida
  - `DI` - Entrada Digital
  - `DO` - Salida Digital
  - `AI` - Entrada Analógica
  - `AO` - Salida Analógica
  - `RTD` - Entrada RTD
  - `TC` - Entrada Termocupla

### Detalles del Canal
- **Canal** (`channel`): Número o nombre del canal (ej: "AI1", "DO3")
- **Descripción** (`description`): Descripción de la función del canal

### Especificaciones del Canal
- **Rango Mínimo** (`range_min`): Rango mínimo del canal
- **Rango Máximo** (`range_max`): Rango máximo del canal
- **Unidad** (`unit`): Unidad del canal (ej: "V", "mA", "°C")
- **Resolución** (`resolution_bits`): Resolución en bits (ej: 12, 16, 24)

---

## 📡 Registros Modbus

Tabla: `modbus_registers`

Para instrumentos con protocolo Modbus, cada registro:

### Identificación del Registro
- **ID Registro** (`reg_id`): ID único
- **ID Artículo** (`article_id`): Referencia al artículo
- **Tipo de Registro** (`register_type`): Tipo de registro Modbus
  - `COIL` - Bobina (1 bit R/W)
  - `DISCRETE_INPUT` - Entrada discreta (1 bit RO)
  - `INPUT_REGISTER` - Registro de entrada (16 bits RO)
  - `HOLDING_REGISTER` - Registro de retención (16 bits R/W)

### Dirección
- **Dirección** (`address`): Dirección del registro (decimal)

### Datos del Registro
- **Nombre** (`name`): Nombre descriptivo del registro
- **Descripción** (`description`): Descripción de la función del registro
- **Unidad** (`unit`): Unidad del valor del registro
- **Tipo de Dato** (`data_type`): Tipo de dato
  - `INT16`
  - `UINT16`
  - `INT32`
  - `UINT32`
  - `FLOAT32`
  - `BIT`
  - `STRING`

### Transformación de Datos
- **Factor de Escala** (`scale_factor`): Factor multiplicador para obtener el valor real
- **Offset** (`offset`): Valor a sumar después de aplicar el factor de escala

### Acceso
- **Solo Lectura** (`read_only`): Si el registro es de solo lectura (booleano)

---

## 📦 Gestión de Stock

### Inventario
- **Stock Actual** (`current_stock`): Cantidad actual en inventario (número)
- **Stock Mínimo** (`min_stock`): Cantidad mínima antes de reorden (número)
- **Ubicación** (`stock_location`): Ubicación física del stock (ej: "Almacén A, Estante 3")

---

## 🏷️ Etiquetas y Metadatos

### Tags
Tabla: `article_tags` (relación muchos a muchos con `tags`)

Para cada etiqueta asociada:
- **ID Tag** (`tag_id`): ID único del tag
- **Nombre del Tag** (`tag`): Nombre de la etiqueta (ej: "Crítico", "Obsoleto", "Preferido")

### Fabricantes Asociados
Tabla: `manufacturers`

- **ID Fabricante** (`manufacturer_id`)
- **Nombre** (`name`)
- **País** (`country`)
- **Sitio Web** (`website`)
- **Notas** (`notes`)

---

## 📝 Resumen por Tipo de Artículo

### INSTRUMENTO
Puede tener:
- ✅ Información Básica
- ✅ Información SAP
- ✅ Información Técnica
- ✅ Especificaciones Eléctricas
- ✅ Especificaciones Mecánicas
- ✅ **Variables Medidas**
- ✅ **Protocolos de Comunicación**
- ✅ **Registros Modbus** (si tiene Modbus)
- ✅ Gestión de Stock
- ✅ Tags

### CABLE
Puede tener:
- ✅ Información Básica
- ✅ Información SAP
- ✅ **Longitud, Diámetro, Material, Color**
- ✅ Gestión de Stock
- ✅ Tags

### SENSOR
Puede tener:
- ✅ Información Básica
- ✅ Información SAP
- ✅ Información Técnica
- ✅ Especificaciones Eléctricas
- ✅ Especificaciones Mecánicas
- ✅ **Variables Medidas**
- ✅ **Protocolos de Comunicación**
- ✅ Gestión de Stock
- ✅ Tags

### DATALOGGER / GATEWAY
Puede tener:
- ✅ Información Básica
- ✅ Información SAP
- ✅ Información Técnica
- ✅ Especificaciones Eléctricas
- ✅ Especificaciones Mecánicas
- ✅ **Variables Medidas**
- ✅ **Protocolos de Comunicación**
- ✅ **Entradas/Salidas (I/O)**
- ✅ Gestión de Stock
- ✅ Tags

### ACTUADOR / MODULO_IO
Puede tener:
- ✅ Información Básica
- ✅ Información SAP
- ✅ Información Técnica
- ✅ Especificaciones Eléctricas
- ✅ Especificaciones Mecánicas
- ✅ **Protocolos de Comunicación**
- ✅ **Entradas/Salidas (I/O)**
- ✅ Gestión de Stock
- ✅ Tags

### SOPORTE / CONECTOR / APARAMENTA_AC / APARAMENTA_DC
Puede tener:
- ✅ Información Básica
- ✅ Información SAP
- ✅ Información Técnica
- ✅ Especificaciones Eléctricas (según aplique)
- ✅ Especificaciones Mecánicas
- ✅ Gestión de Stock
- ✅ Tags

### SOFTWARE / LICENCIA
Puede tener:
- ✅ Información Básica
- ✅ Información SAP
- ✅ Notas
- ✅ Tags

---

## 🎯 Ejemplo Completo de un Artículo

```json
{
  "article_id": "INST-TEMP-001",
  "article_type": "INSTRUMENTO",
  "active": true,
  
  "sap_itemcode": "SAP123456",
  "sap_description": "Transmisor de temperatura 4-20mA",
  "family": "Instrumentación",
  "subfamily": "Medidores de Temperatura",
  "category": "RTD",
  
  "manufacturer_id": 1,
  "manufacturer": {
    "name": "Siemens",
    "country": "Alemania",
    "website": "https://www.siemens.com"
  },
  "model": "SITRANS TH300",
  "variant": "Standard",
  
  "power_supply_min_v": 12,
  "power_supply_max_v": 30,
  "power_consumption_typ_w": 0.5,
  "current_max_a": 0.025,
  
  "ip_rating": "IP67",
  "dimensions_mm": "100x50x30",
  "weight_g": 250,
  
  "notes": "Transmisor de temperatura con salida 4-20mA",
  "internal_notes": "Preferir este modelo para aplicaciones industriales",
  
  "current_stock": 15,
  "min_stock": 5,
  "stock_location": "Almacén Principal, Estante A3",
  
  "article_variables": [
    {
      "variable": { "name": "Temperatura", "symbol": "T" },
      "range_min": -50,
      "range_max": 200,
      "unit": "°C",
      "accuracy_abs": 0.1,
      "accuracy_pct": null,
      "resolution": "0.01°C"
    }
  ],
  
  "article_protocols": [
    {
      "type": "4-20mA",
      "physical_layer": "Analógico",
      "port_label": "OUT+"
    },
    {
      "type": "HART",
      "physical_layer": "4-20mA",
      "port_label": "OUT+",
      "modbus_address": 1
    }
  ],
  
  "tags": [
    { "tag": "Preferido" },
    { "tag": "Alta Precisión" }
  ]
}
```

---

## 📌 Notas Finales

Este documento incluye **TODOS** los campos posibles que un artículo puede tener en el sistema InstrumentKB. Dependiendo del tipo de artículo, algunos campos estarán disponibles y otros no.

**Total de Campos Base**: ~40 campos
**Tablas Relacionadas**: 6 tablas (variables, protocolos, I/O, Modbus, tags, fabricantes)
**Campos Totales Posibles** (con relaciones): ~100+ campos

---

**Última actualización**: 10 de noviembre de 2025

