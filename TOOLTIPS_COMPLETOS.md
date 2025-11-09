# 📘 Tooltips para todos los campos del formulario

## Uso:
Copiar los tooltips correspondientes al componente `LabelWithTooltip`

---

## 📋 **DATOS BÁSICOS**

### Información SAP
```typescript
"SAP ItemCode": "Código único del artículo en SAP Business One. Ejemplo: 'A1000123'. Este código debe ser único en todo el sistema y se usa para sincronizar con SAP."

"Descripción SAP": "Descripción completa y detallada del artículo tal como aparecerá en SAP. Debe ser clara y descriptiva para facilitar búsquedas. Ejemplo: 'Sensor de temperatura PT100 con rango -50 a 200°C'."

"Tipo de Artículo": "Categoría principal del artículo según la clasificación de la empresa. Determina qué campos técnicos estarán disponibles. Por ejemplo, INSTRUMENTO habilita variables, protocolos, Modbus, etc."

"Categoría": "Sub-clasificación específica dentro del tipo de artículo. Opcional. Ejemplo: Para tipo INSTRUMENTO, categoría podría ser 'Temperatura', 'Presión', 'Caudal', etc."

"Familia": "Agrupación de artículos similares. Ejemplo: 'Sensores PT100', 'Cables Ethernet', 'Soportes metálicos'. Útil para filtrar y organizar el catálogo."

"Subfamilia": "Subdivisión de la familia para clasificación más específica. Ejemplo: Dentro de familia 'Sensores PT100', subfamilia podría ser 'PT100 clase A' o 'PT100 clase B'."
```

### Fabricante y Modelo
```typescript
"Fabricante": "Empresa que fabrica el artículo. Selecciona de la lista de fabricantes registrados. Si no existe, primero debes crearlo en el módulo de Fabricantes."

"Modelo": "Modelo específico del fabricante. Ejemplo: 'PT100-A', 'RJ45-CAT6', 'MX-2000'. Tal como aparece en el datasheet del fabricante."

"Variante": "Variación del modelo base si existe. Ejemplo: 'con display', 'versión corta', 'IP67'. Útil cuando un mismo modelo tiene versiones diferentes."
```

---

## ⚡ **TÉCNICO**

### Especificaciones Eléctricas
```typescript
"Alimentación Mín (V)": "Voltaje mínimo de alimentación que el dispositivo puede aceptar. Ejemplo: 10V. Importante para garantizar funcionamiento en condiciones de baja tensión."

"Alimentación Máx (V)": "Voltaje máximo de alimentación que el dispositivo puede tolerar sin dañarse. Ejemplo: 30V. No exceder este valor para evitar daños permanentes."

"Potencia (W)": "Consumo de potencia típico en Watts. Ejemplo: 1.5W. Útil para dimensionar fuentes de alimentación y calcular consumo energético total."

"Corriente Máx (A)": "Corriente máxima que el dispositivo puede manejar o consumir. Ejemplo: 5A. Importante para dimensionar cables y protecciones eléctricas."

"Voltaje Nominal (V)": "Voltaje de operación nominal o recomendado. Ejemplo: 24V. Este es el voltaje al que el dispositivo funciona óptimamente."
```

### Características Físicas
```typescript
"IP Rating": "Grado de protección contra polvo y agua según norma IEC 60529. Ejemplo: 'IP65' significa protección total contra polvo y protección contra chorros de agua. IP67 puede sumergirse temporalmente."

"Dimensiones (mm)": "Dimensiones físicas del artículo en milímetros. Formato: 'Largo x Ancho x Alto'. Ejemplo: '100 x 50 x 30'. Importante para verificar espacios de montaje."

"Peso (g)": "Peso del artículo en gramos. Ejemplo: 500g. Útil para calcular cargas en estructuras y costos de envío."

"Longitud (m)": "Longitud total del artículo en metros. Principalmente para cables y elementos lineales. Ejemplo: 100m para un rollo de cable."

"Diámetro (mm)": "Diámetro del artículo en milímetros. Principalmente para cables, tuberías y elementos cilíndricos. Ejemplo: 7.5mm para un cable."

"Material": "Material de construcción del artículo. Ejemplo: 'Cobre + PVC', 'Acero inoxidable 316', 'Aluminio anodizado'. Importante para compatibilidad química y durabilidad."

"Color": "Color del artículo. Ejemplo: 'Negro', 'Gris RAL7035', 'Azul'. Útil para identificación visual y cumplimiento de códigos de color."
```

### Condiciones Ambientales
```typescript
"Temp. Op. Mín (°C)": "Temperatura mínima de operación en grados Celsius. Ejemplo: -20°C. Por debajo de esta temperatura el dispositivo puede no funcionar correctamente o dañarse."

"Temp. Op. Máx (°C)": "Temperatura máxima de operación en grados Celsius. Ejemplo: 70°C. Por encima de esta temperatura el dispositivo puede fallar o sufrir daños permanentes."

"Temp. Almac. Mín (°C)": "Temperatura mínima de almacenamiento seguro. Ejemplo: -40°C. Cuando el dispositivo está apagado puede tolerar temperaturas más extremas que en operación."

"Temp. Almac. Máx (°C)": "Temperatura máxima de almacenamiento seguro. Ejemplo: 85°C. Importante para condiciones de transporte y almacén."

"Humedad Op. Mín (%)": "Humedad relativa mínima de operación. Ejemplo: 0%. Importante en ambientes muy secos que pueden generar electricidad estática."

"Humedad Op. Máx (%)": "Humedad relativa máxima de operación. Ejemplo: 95%. Por encima puede causar condensación y daños eléctricos. Atención: sin condensación."

"Altitud Máx (m)": "Altitud máxima de operación sobre el nivel del mar. Ejemplo: 3000m. A mayor altitud hay menor presión atmosférica, lo que puede afectar el funcionamiento y refrigeración."
```

### Certificaciones
```typescript
"EMC Compliance": "Cumplimiento de compatibilidad electromagnética. Ejemplo: 'CE, FCC'. Garantiza que el dispositivo no genera interferencias ni es susceptible a ellas."

"Certificaciones": "Certificaciones y aprobaciones de seguridad. Ejemplo: 'CE, UL, RoHS, ATEX'. Requeridas para cumplimiento legal y uso en ambientes peligrosos (ATEX para atmósferas explosivas)."

"Año Primera Versión": "Año en que se lanzó la primera versión de este producto. Ejemplo: 2020. Útil para evaluar madurez del producto."

"Año Última Revisión": "Año de la última revisión o actualización del producto. Ejemplo: 2024. Indica si el producto está actualizado."
```

---

## 📊 **VARIABLES** (solo instrumentos)

```typescript
"Variable": "Magnitud física que el instrumento puede medir. Ejemplo: 'Temperatura', 'Presión', 'Caudal'. Selecciona de la lista de variables registradas."

"Rango Mín": "Valor mínimo que el instrumento puede medir. Ejemplo: -50 para un sensor de temperatura. Define el límite inferior del rango de medición."

"Rango Máx": "Valor máximo que el instrumento puede medir. Ejemplo: 200 para un sensor de temperatura. Define el límite superior del rango de medición."

"Unidad": "Unidad de medida de la variable. Ejemplo: '°C', 'bar', 'm³/h', 'mA'. Debe ser consistente con la variable medida."

"Precisión": "Precisión absoluta de la medición. Ejemplo: ±0.1 significa que el error máximo es de 0.1 unidades. Menor valor = mayor precisión."

"Resolución": "Cambio mínimo detectable en la medición. Ejemplo: 0.01 significa que puede detectar cambios de 0.01 unidades. Importante para aplicaciones que requieren alta sensibilidad."

"Tasa de actualización (Hz)": "Frecuencia de actualización de la medición en Hertz. Ejemplo: 1Hz = 1 medición por segundo, 10Hz = 10 mediciones por segundo. Importante para procesos dinámicos."
```

---

## 🔌 **PROTOCOLOS** (solo instrumentos)

```typescript
"Protocolo": "Protocolo de comunicación que el dispositivo soporta. ModbusRTU y SDI-12 son típicos en RS-485, ModbusTCP en Ethernet. Determina cómo se intercambian datos."

"Capa Física": "Medio de transmisión física. RS-485 para comunicación industrial robusta (hasta 1200m), RS-232 para distancias cortas (<15m), Ethernet para redes TCP/IP."

"Puerto / Conector": "Identificación del puerto o tipo de conector. Ejemplo: 'COM1' para puertos serie, 'RJ45' para Ethernet, 'DB9' para conectores serie de 9 pines."

"Baudrate": "Velocidad de comunicación en bits por segundo (bps). Ejemplo: 9600 bps es común para Modbus. Todos los dispositivos de la red deben usar el mismo baudrate."

"Data Bits": "Número de bits de datos por carácter. 8 bits es el estándar moderno (permite 256 caracteres). 7 bits es legacy, usado en sistemas antiguos."

"Paridad": "Bit de verificación de errores. None (N) = sin paridad (más común), Even (E) = paridad par, Odd (O) = paridad impar. Debe coincidir en toda la red."

"Stop Bits": "Bits de parada que marcan el final de cada carácter. 1 bit es estándar. 2 bits se usa en comunicaciones lentas o ruidosas para mayor robustez."

"Dirección por defecto": "Dirección del dispositivo en la red. Para Modbus: 1-247, para SDI-12: 0-9 o a-z. Cada dispositivo en la red debe tener una dirección única."

"IP Address": "Dirección IP del dispositivo en la red. Formato: 192.168.1.100. Debe estar en la misma subred que el sistema de control. Ejemplo: 192.168.1.x para subred /24."

"Puerto TCP": "Puerto TCP para comunicación de red. Ejemplo: 502 es el puerto estándar para Modbus TCP. Los puertos <1024 son reservados del sistema."
```

---

## 🔄 **I/O ANALÓGICO** (solo instrumentos)

```typescript
"Tipo": "Tipo de salida analógica. 4-20mA es estándar industrial (permite detectar cable roto porque 0mA indica fallo), 0-10V común en automatización de edificios."

"Canales": "Número de salidas analógicas independientes. Ejemplo: 2 significa que puede tener 2 señales simultáneas independientes."

"Rango Mín": "Valor mínimo de la salida. Para 4-20mA sería 4, para 0-10V sería 0. Este valor corresponde al 0% de la escala."

"Rango Máx": "Valor máximo de la salida. Para 4-20mA sería 20, para 0-10V sería 10. Este valor corresponde al 100% de la escala."

"Unidad": "Unidad de la señal de salida. Ejemplo: 'mA', 'V', 'Hz'. Debe coincidir con el tipo seleccionado."

"Carga Mín (Ω)": "Resistencia mínima de carga en Ohmios. Por debajo de este valor la salida puede no funcionar correctamente."

"Carga Máx (Ω)": "Resistencia máxima de carga en Ohmios. Para 4-20mA típicamente 250-600Ω. Determina la longitud máxima del cable."
```

---

## 💾 **I/O DIGITAL** (solo instrumentos)

```typescript
"Dirección": "Tipo de señal. Input = entrada (el dispositivo recibe la señal), Output = salida (el dispositivo genera la señal)."

"Tipo de Señal": "Tecnología de la señal. TTL (0-5V lógica digital), Relay (contacto seco), Pulse (señal pulsante), 4-20mA (señal de corriente)."

"Nivel Voltaje": "Nivel de voltaje de la señal digital. Ejemplo: '3.3V' para TTL moderno, '24V' para señales industriales, '5V' para TTL clásico."

"Corriente Máx (mA)": "Corriente máxima que la salida puede proporcionar o la entrada puede recibir. Ejemplo: 20mA. No exceder para evitar daños."

"Frecuencia Máx (Hz)": "Frecuencia máxima de conmutación. Ejemplo: 1000Hz significa que puede cambiar de estado hasta 1000 veces por segundo. Importante para contadores rápidos."
```

---

## 📡 **MODBUS** (solo instrumentos)

```typescript
"FC (Function Code)": "Código de función Modbus. Los más comunes: 3=Read Holding Registers, 4=Read Input Registers, 6=Write Single Register, 16=Write Multiple Registers."

"Dirección": "Dirección del registro Modbus (0-65535). Ejemplo: 100. Es la posición en la memoria del dispositivo donde se almacena este dato."

"Nombre": "Nombre descriptivo del registro. Ejemplo: 'Temperatura actual', 'Setpoint de presión'. Facilita la identificación sin necesidad de consultar el manual."

"Descripción": "Descripción detallada de qué contiene este registro y cómo usarlo. Incluye detalles técnicos relevantes."

"Tipo Dato": "Tipo de datos del registro. INT16 = entero de 16 bits con signo, UINT16 = entero de 16 bits sin signo, FLOAT32 = número decimal de 32 bits (2 registros)."

"Escala": "Factor de escala para convertir el valor del registro al valor real. Ejemplo: 0.1 significa que el valor leído debe multiplicarse por 0.1. Si el registro es 250, el valor real es 25.0."

"R/W": "Permisos de acceso. R = Solo lectura, W = Solo escritura, RW = Lectura y escritura. Los parámetros configurables suelen ser RW."

"Mín": "Valor mínimo válido para este registro. Intentar escribir por debajo generará error."

"Máx": "Valor máximo válido para este registro. Intentar escribir por encima generará error."

"Valor por defecto": "Valor inicial del registro tras reset del dispositivo. Útil para saber el estado por defecto."
```

---

## 🌊 **SDI-12** (solo instrumentos)

```typescript
"Comando": "Comando SDI-12. Formato: <dirección><comando>. Ejemplos: '0M!' (iniciar medición del sensor 0), '0D0!' (enviar datos), 'a!' (cambiar dirección)."

"Descripción": "Explicación de qué hace este comando. Ejemplo: 'Inicia la medición de temperatura y humedad'. Útil como referencia rápida."

"Formato de Respuesta": "Formato de la respuesta del sensor. Ejemplo: '0+25.3+65.2' significa dirección 0, temperatura 25.3°C, humedad 65.2%. Ayuda a interpretar los datos recibidos."
```

---

## 🛰️ **NMEA 0183** (solo instrumentos)

```typescript
"Sentencia": "Sentencia NMEA 0183. Formato: $TTSSS. Ejemplos: '$GPGGA' (datos GPS), '$GPRMC' (posición y velocidad). El $ indica inicio de sentencia."

"Descripción": "Descripción de qué información contiene esta sentencia. Ejemplo: '$GPGGA contiene tiempo, posición, calidad de señal y número de satélites'."

"Campos": "Lista de campos que contiene la sentencia separados por comas. Ejemplo: 'time,lat,lon,quality,sats,hdop,alt'. Útil para parsear los datos recibidos."
```

---

## 📁 **ARCHIVOS**

### Documentos
```typescript
"Tipo": "Tipo de documento. Datasheet = hoja de datos técnicos, Manual = manual de usuario, Certificate = certificado (calibración, conformidad), Drawing = plano técnico."

"Título": "Título descriptivo del documento. Ejemplo: 'Datasheet PT100-A Rev.3', 'Manual de instalación español'. Facilita la búsqueda."

"Idioma": "Idioma del documento. Código ISO: 'ES' = español, 'EN' = inglés, 'FR' = francés, 'DE' = alemán. Útil para documentación multiidioma."

"URL / Ruta": "Ubicación del documento. Puede ser una URL (https://...) o ruta local (/uploads/...). Si es local, el archivo debe estar en el servidor."
```

### Imágenes
```typescript
"Descripción": "Descripción de la imagen. Ejemplo: 'Vista frontal', 'Diagrama de conexiones', 'Dimensiones de montaje'. Ayuda a identificar la imagen."

"URL / Ruta": "Ubicación de la imagen. URL externa (https://...) o ruta local (/uploads/images/...). Formatos soportados: JPG, PNG, GIF."
```

---

## 📝 **OTROS**

```typescript
"Tags": "Etiquetas para clasificación y búsqueda rápida. Ejemplos: 'ethernet', 'inalámbrico', 'outdoor', 'explosivos'. Separa con Enter. Útil para filtrado."

"Notas Internas": "Notas de uso interno. Información que no aparece en SAP pero es útil para el equipo técnico. Ejemplo: 'Compatible con proyecto X', 'Requiere adaptador Y'."

"Artículo Activo": "Indica si el artículo está activo en el catálogo. Desactivar oculta el artículo de búsquedas normales pero mantiene el histórico. Útil para productos descontinuados."
```

