import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Crear fabricantes
  console.log('📦 Creando fabricantes...');
  const seabird = await prisma.manufacturer.upsert({
    where: { name: 'Sea-Bird Scientific' },
    update: {},
    create: {
      name: 'Sea-Bird Scientific',
      country: 'USA',
      website: 'https://www.seabird.com',
      support_email: 'support@seabird.com',
      notes: 'Líder mundial en instrumentación oceanográfica',
    },
  });

  const vaisala = await prisma.manufacturer.upsert({
    where: { name: 'Vaisala' },
    update: {},
    create: {
      name: 'Vaisala',
      country: 'Finland',
      website: 'https://www.vaisala.com',
      support_email: 'support@vaisala.com',
      notes: 'Sensores de temperatura, humedad y presión',
    },
  });

  const campbell = await prisma.manufacturer.upsert({
    where: { name: 'Campbell Scientific' },
    update: {},
    create: {
      name: 'Campbell Scientific',
      country: 'USA',
      website: 'https://www.campbellsci.com',
      support_email: 'support@campbellsci.com',
      notes: 'Fabricante de dataloggers y sensores meteorológicos',
    },
  });

  const phoenix = await prisma.manufacturer.upsert({
    where: { name: 'Phoenix Contact' },
    update: {},
    create: {
      name: 'Phoenix Contact',
      country: 'Germany',
      website: 'https://www.phoenixcontact.com',
      support_email: 'info@phoenixcontact.com',
      notes: 'Fabricante de componentes electrónicos industriales',
    },
  });

  console.log(`✅ Fabricantes creados: ${4}`);

  // Crear diccionario de variables
  console.log('📚 Creando variables...');
  const temperature = await prisma.variableDict.upsert({
    where: { name: 'Temperature' },
    update: {},
    create: {
      name: 'Temperature',
      unit_default: '°C',
      description: 'Temperatura del fluido o ambiente',
    },
  });

  const pressure = await prisma.variableDict.upsert({
    where: { name: 'Pressure' },
    update: {},
    create: {
      name: 'Pressure',
      unit_default: 'dbar',
      description: 'Presión absoluta',
    },
  });

  const salinity = await prisma.variableDict.upsert({
    where: { name: 'Salinity' },
    update: {},
    create: {
      name: 'Salinity',
      unit_default: 'PSU',
      description: 'Salinidad del agua',
    },
  });

  const conductivity = await prisma.variableDict.upsert({
    where: { name: 'Conductivity' },
    update: {},
    create: {
      name: 'Conductivity',
      unit_default: 'S/m',
      description: 'Conductividad eléctrica',
    },
  });

  const humidity = await prisma.variableDict.upsert({
    where: { name: 'Humidity' },
    update: {},
    create: {
      name: 'Humidity',
      unit_default: '%RH',
      description: 'Humedad relativa',
    },
  });

  const windSpeed = await prisma.variableDict.upsert({
    where: { name: 'Wind Speed' },
    update: {},
    create: {
      name: 'Wind Speed',
      unit_default: 'm/s',
      description: 'Velocidad del viento',
    },
  });

  console.log(`✅ Variables creadas: ${6}`);

  // =====================================================
  // ARTÍCULO 1: INSTRUMENTO - Sensor CTD
  // =====================================================
  const ctdArticle = await prisma.article.upsert({
    where: { article_id: 'INS-000347' },
    update: {},
    create: {
      article_id: 'INS-000347',
      sap_itemcode: 'A1000347',
      sap_description: 'Sensor CTD Oceanográfico Sea-Bird SBE 37-SI MicroCAT',
      article_type: 'INSTRUMENTO',
      category: 'CTD Sensor',
      family: 'Sensores',
      subfamily: 'Oceanografía',
      manufacturer_id: seabird.manufacturer_id,
      model: 'SBE 37-SI',
      variant: 'MicroCAT',
      power_supply_min_v: 7,
      power_supply_max_v: 15,
      power_consumption_typ_w: 0.015,
      ip_rating: 'IP68',
      dimensions_mm: '13.5 cm length x 3.8 cm diameter',
      weight_g: 430,
      oper_temp_min_c: -5,
      oper_temp_max_c: 35,
      oper_humidity_min_pct: 0,
      oper_humidity_max_pct: 100,
      altitude_max_m: 7000,
      emc_compliance: 'CE',
      certifications: 'CE, RoHS',
      first_release_year: 2000,
      last_revision_year: 2023,
      internal_notes: 'Sensor de alta precisión para mediciones submarinas',
      active: true,
    },
  });

  // Variables para CTD
  await prisma.articleVariable.createMany({
    data: [
      {
        article_id: ctdArticle.article_id,
        variable_id: temperature.variable_id,
        range_min: -5,
        range_max: 35,
        unit: '°C',
        accuracy_abs: 0.002,
        resolution: 0.0001,
        update_rate_hz: 1,
        notes: 'ITS-90 temperature scale',
      },
      {
        article_id: ctdArticle.article_id,
        variable_id: pressure.variable_id,
        range_min: 0,
        range_max: 7000,
        unit: 'dbar',
        accuracy_abs: 0.1,
        resolution: 0.001,
        update_rate_hz: 1,
        notes: 'Absolute pressure',
      },
      {
        article_id: ctdArticle.article_id,
        variable_id: conductivity.variable_id,
        range_min: 0,
        range_max: 9,
        unit: 'S/m',
        accuracy_abs: 0.0003,
        resolution: 0.00001,
        update_rate_hz: 1,
      },
      {
        article_id: ctdArticle.article_id,
        variable_id: salinity.variable_id,
        range_min: 0,
        range_max: 42,
        unit: 'PSU',
        accuracy_abs: 0.005,
        resolution: 0.0001,
        update_rate_hz: 1,
        notes: 'Calculated from conductivity and temperature',
      },
    ],
    skipDuplicates: true,
  });

  // Protocolos para CTD
  await prisma.articleProtocol.create({
    data: {
      article_id: ctdArticle.article_id,
      type: 'ModbusRTU',
      physical_layer: 'RS-485',
      port_label: 'Connector 1',
      default_address: '1',
      baudrate: 9600,
      databits: 8,
      parity: 'N',
      stopbits: 1,
      notes: 'Standard Modbus RTU over RS-485',
    },
  });

  // Tags para CTD
  await prisma.tag.createMany({
    data: [
      { article_id: ctdArticle.article_id, tag: 'oceanography' },
      { article_id: ctdArticle.article_id, tag: 'CTD' },
      { article_id: ctdArticle.article_id, tag: 'underwater' },
      { article_id: ctdArticle.article_id, tag: 'high-precision' },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Artículo INSTRUMENTO creado: ${ctdArticle.article_id}`);

  // =====================================================
  // ARTÍCULO 2: DATALOGGER
  // =====================================================
  const dataloggerArticle = await prisma.article.upsert({
    where: { article_id: 'INS-000512' },
    update: {},
    create: {
      article_id: 'INS-000512',
      sap_itemcode: 'A1000512',
      sap_description: 'Datalogger Industrial Campbell Scientific CR1000X',
      article_type: 'DATALOGGER',
      category: 'Industrial Datalogger',
      family: 'Dataloggers',
      subfamily: 'Industriales',
      manufacturer_id: campbell.manufacturer_id,
      model: 'CR1000X',
      power_supply_min_v: 9.6,
      power_supply_max_v: 18,
      power_consumption_typ_w: 1.2,
      ip_rating: 'IP65',
      dimensions_mm: '23.9 x 10.2 x 6.1 cm',
      weight_g: 680,
      oper_temp_min_c: -40,
      oper_temp_max_c: 70,
      storage_temp_min_c: -50,
      storage_temp_max_c: 80,
      oper_humidity_min_pct: 0,
      oper_humidity_max_pct: 95,
      emc_compliance: 'CE, FCC',
      certifications: 'CE, FCC, RoHS',
      first_release_year: 2019,
      last_revision_year: 2024,
      internal_notes: 'Datalogger robusto para entornos industriales',
      active: true,
    },
  });

  // Protocolos para Datalogger
  await prisma.articleProtocol.createMany({
    data: [
      {
        article_id: dataloggerArticle.article_id,
        type: 'ModbusRTU',
        physical_layer: 'RS-232/RS-485',
        port_label: 'COM1',
        baudrate: 115200,
        databits: 8,
        parity: 'N',
        stopbits: 1,
      },
      {
        article_id: dataloggerArticle.article_id,
        type: 'ModbusTCP',
        physical_layer: 'Ethernet',
        port_label: 'RJ45',
        ip_address: '192.168.1.100',
        ip_port: 502,
      },
    ],
    skipDuplicates: true,
  });

  // Tags para Datalogger
  await prisma.tag.createMany({
    data: [
      { article_id: dataloggerArticle.article_id, tag: 'datalogger' },
      { article_id: dataloggerArticle.article_id, tag: 'industrial' },
      { article_id: dataloggerArticle.article_id, tag: 'modbus' },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Artículo DATALOGGER creado: ${dataloggerArticle.article_id}`);

  // =====================================================
  // ARTÍCULO 3: CABLE
  // =====================================================
  const cableArticle = await prisma.article.upsert({
    where: { article_id: 'CAB-001234' },
    update: {},
    create: {
      article_id: 'CAB-001234',
      sap_itemcode: 'C2001234',
      sap_description: 'Cable RS485 Apantallado 2x0.75mm² + Malla',
      article_type: 'CABLE',
      category: 'Signal Cable',
      family: 'Cables',
      subfamily: 'Comunicaciones',
      model: 'RS485-2X075-SHIELD',
      length_m: 100,
      diameter_mm: 7.5,
      material: 'Cobre + PVC',
      color: 'Negro',
      oper_temp_min_c: -20,
      oper_temp_max_c: 80,
      certifications: 'UL, CE',
      internal_notes: 'Cable para comunicaciones industriales RS485',
      active: true,
      current_stock: 500,
      min_stock: 100,
    },
  });

  await prisma.tag.createMany({
    data: [
      { article_id: cableArticle.article_id, tag: 'cable' },
      { article_id: cableArticle.article_id, tag: 'RS485' },
      { article_id: cableArticle.article_id, tag: 'shielded' },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Artículo CABLE creado: ${cableArticle.article_id}`);

  // =====================================================
  // ARTÍCULO 4: SOPORTE
  // =====================================================
  const soporteArticle = await prisma.article.upsert({
    where: { article_id: 'SOP-005678' },
    update: {},
    create: {
      article_id: 'SOP-005678',
      sap_itemcode: 'S3005678',
      sap_description: 'Soporte DIN Rail 35mm para Montaje de Módulos',
      article_type: 'SOPORTE',
      category: 'DIN Rail Mount',
      family: 'Soportes',
      subfamily: 'Montaje',
      length_m: 1,
      material: 'Aluminio',
      dimensions_mm: '1000 x 35 x 7.5 mm',
      weight_g: 250,
      certifications: 'CE',
      internal_notes: 'Riel DIN estándar 35mm para montaje de equipos',
      active: true,
      current_stock: 50,
      min_stock: 10,
    },
  });

  await prisma.tag.createMany({
    data: [
      { article_id: soporteArticle.article_id, tag: 'mounting' },
      { article_id: soporteArticle.article_id, tag: 'DIN-rail' },
      { article_id: soporteArticle.article_id, tag: 'industrial' },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Artículo SOPORTE creado: ${soporteArticle.article_id}`);

  // =====================================================
  // ARTÍCULO 5: APARAMENTA AC
  // =====================================================
  const aparamentaArticle = await prisma.article.upsert({
    where: { article_id: 'APA-009999' },
    update: {},
    create: {
      article_id: 'APA-009999',
      sap_itemcode: 'AP009999',
      sap_description: 'Interruptor Automático Magnetotérmico 3P 32A Curva C',
      article_type: 'APARAMENTA_AC',
      category: 'Circuit Breaker',
      family: 'Protección',
      subfamily: 'Magnetotérmicos',
      manufacturer_id: phoenix.manufacturer_id,
      model: 'MCB-3P-32A-C',
      voltage_rating_v: 400,
      current_max_a: 32,
      dimensions_mm: '54 x 90 x 78 mm',
      weight_g: 180,
      certifications: 'IEC 60898, CE',
      internal_notes: 'Protección contra sobrecargas y cortocircuitos',
      active: true,
      current_stock: 20,
      min_stock: 5,
    },
  });

  await prisma.tag.createMany({
    data: [
      { article_id: aparamentaArticle.article_id, tag: 'protection' },
      { article_id: aparamentaArticle.article_id, tag: 'circuit-breaker' },
      { article_id: aparamentaArticle.article_id, tag: 'AC' },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Artículo APARAMENTA_AC creado: ${aparamentaArticle.article_id}`);

  // =====================================================
  // ARTÍCULO 6: FUENTE DE ALIMENTACIÓN
  // =====================================================
  const fuenteArticle = await prisma.article.upsert({
    where: { article_id: 'PWR-002468' },
    update: {},
    create: {
      article_id: 'PWR-002468',
      sap_itemcode: 'PW002468',
      sap_description: 'Fuente de Alimentación DIN Rail 24VDC 5A 120W',
      article_type: 'FUENTE_ALIMENTACION',
      category: 'Power Supply',
      family: 'Alimentación',
      subfamily: 'DIN Rail',
      manufacturer_id: phoenix.manufacturer_id,
      model: 'QUINT4-PS/1AC/24DC/5',
      power_supply_min_v: 100,
      power_supply_max_v: 240,
      voltage_rating_v: 24,
      current_max_a: 5,
      power_consumption_typ_w: 120,
      dimensions_mm: '125 x 125 x 62 mm',
      weight_g: 620,
      oper_temp_min_c: -25,
      oper_temp_max_c: 70,
      emc_compliance: 'CE',
      certifications: 'CE, UL, cULus',
      internal_notes: 'Fuente switching con protección contra sobretensión',
      active: true,
      current_stock: 15,
      min_stock: 3,
    },
  });

  await prisma.tag.createMany({
    data: [
      { article_id: fuenteArticle.article_id, tag: 'power-supply' },
      { article_id: fuenteArticle.article_id, tag: '24VDC' },
      { article_id: fuenteArticle.article_id, tag: 'DIN-rail' },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Artículo FUENTE_ALIMENTACION creado: ${fuenteArticle.article_id}`);

  console.log('🎉 Seed completado exitosamente!');
  console.log(`📊 Total de artículos creados: 6`);
  console.log(`   - 1 INSTRUMENTO (CTD Sensor)`);
  console.log(`   - 1 DATALOGGER`);
  console.log(`   - 1 CABLE`);
  console.log(`   - 1 SOPORTE`);
  console.log(`   - 1 APARAMENTA_AC`);
  console.log(`   - 1 FUENTE_ALIMENTACION`);
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
