import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Script para importar datos desde un archivo JSON exportado.
 * 
 * Uso:
 *   npm run seed # Para datos de ejemplo
 *   node import-data.js export.json # Para importar desde archivo
 */

interface ExportData {
  exported_at: string;
  version: string;
  sap_integration?: boolean;
  data: {
    articles?: any[];
    manufacturers: any[];
    variables: any[];
    instruments: any[];
    instrumentVariables: any[];
    documents: any[];
    images: any[];
    analogOutputs: any[];
    digitalIO: any[];
    protocols: any[];
    modbusRegisters: any[];
    sdi12Commands: any[];
    nmeaSentences: any[];
    tags: any[];
    provenance: any[];
  };
}

async function importData(filePath: string) {
  console.log(`📂 Leyendo archivo: ${filePath}`);
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const exportData: ExportData = JSON.parse(fileContent);
  
  console.log(`📅 Exportado el: ${exportData.exported_at}`);
  console.log(`🔢 Versión: ${exportData.version}`);
  
  const { data } = exportData;
  
  try {
    // 1. Articles (PRIMERO - nexo con SAP)
    if (data.articles && data.articles.length > 0) {
      console.log('\n1️⃣ Importando artículos SAP...');
      for (const article of data.articles) {
        await prisma.article.upsert({
          where: { article_id: article.article_id },
          update: article,
          create: article
        });
      }
      console.log(`✅ ${data.articles.length} artículos SAP importados`);
    }

    // 2. Manufacturers
    console.log('\n2️⃣ Importando fabricantes...');
    for (const mfg of data.manufacturers) {
      await prisma.manufacturer.upsert({
        where: { manufacturer_id: mfg.manufacturer_id },
        update: mfg,
        create: mfg
      });
    }
    console.log(`✅ ${data.manufacturers.length} fabricantes importados`);
    
    // 3. Variables Dictionary
    console.log('\n3️⃣ Importando variables...');
    for (const variable of data.variables) {
      await prisma.variableDict.upsert({
        where: { variable_id: variable.variable_id },
        update: variable,
        create: variable
      });
    }
    console.log(`✅ ${data.variables.length} variables importadas`);
    
    // 4. Instruments (sin relaciones)
    console.log('\n4️⃣ Importando instrumentos...');
    for (const instrument of data.instruments) {
      await prisma.instrument.upsert({
        where: { instrument_id: instrument.instrument_id },
        update: instrument,
        create: instrument
      });
    }
    console.log(`✅ ${data.instruments.length} instrumentos importados`);
    
    // 4. Instrument Variables
    console.log('\n4️⃣ Importando variables de instrumentos...');
    for (const iv of data.instrumentVariables) {
      await prisma.instrumentVariable.upsert({
        where: { inst_var_id: iv.inst_var_id },
        update: iv,
        create: iv
      });
    }
    console.log(`✅ ${data.instrumentVariables.length} relaciones variable-instrumento importadas`);
    
    // 5. Documents
    console.log('\n5️⃣ Importando documentos...');
    for (const doc of data.documents) {
      await prisma.document.upsert({
        where: { document_id: doc.document_id },
        update: doc,
        create: doc
      });
    }
    console.log(`✅ ${data.documents.length} documentos importados`);
    
    // 6. Images
    console.log('\n6️⃣ Importando imágenes...');
    for (const img of data.images) {
      await prisma.image.upsert({
        where: { image_id: img.image_id },
        update: img,
        create: img
      });
    }
    console.log(`✅ ${data.images.length} imágenes importadas`);
    
    // 7. Analog Outputs
    console.log('\n7️⃣ Importando salidas analógicas...');
    for (const ao of data.analogOutputs) {
      await prisma.analogOutput.upsert({
        where: { analog_out_id: ao.analog_out_id },
        update: ao,
        create: ao
      });
    }
    console.log(`✅ ${data.analogOutputs.length} salidas analógicas importadas`);
    
    // 8. Digital I/O
    console.log('\n8️⃣ Importando E/S digitales...');
    for (const dio of data.digitalIO) {
      await prisma.digitalIO.upsert({
        where: { dio_id: dio.dio_id },
        update: dio,
        create: dio
      });
    }
    console.log(`✅ ${data.digitalIO.length} E/S digitales importadas`);
    
    // 9. Protocols
    console.log('\n9️⃣ Importando protocolos...');
    for (const protocol of data.protocols) {
      await prisma.instrumentProtocol.upsert({
        where: { inst_proto_id: protocol.inst_proto_id },
        update: protocol,
        create: protocol
      });
    }
    console.log(`✅ ${data.protocols.length} protocolos importados`);
    
    // 10. Modbus Registers
    console.log('\n🔟 Importando registros Modbus...');
    for (const mr of data.modbusRegisters) {
      await prisma.modbusRegister.upsert({
        where: { modbus_id: mr.modbus_id },
        update: mr,
        create: mr
      });
    }
    console.log(`✅ ${data.modbusRegisters.length} registros Modbus importados`);
    
    // 11. SDI-12 Commands
    console.log('\n1️⃣1️⃣ Importando comandos SDI-12...');
    for (const sdi of data.sdi12Commands) {
      await prisma.sDI12Command.upsert({
        where: { sdi12_id: sdi.sdi12_id },
        update: sdi,
        create: sdi
      });
    }
    console.log(`✅ ${data.sdi12Commands.length} comandos SDI-12 importados`);
    
    // 12. NMEA Sentences
    console.log('\n1️⃣2️⃣ Importando sentencias NMEA...');
    for (const nmea of data.nmeaSentences) {
      await prisma.nMEASentence.upsert({
        where: { nmea_id: nmea.nmea_id },
        update: nmea,
        create: nmea
      });
    }
    console.log(`✅ ${data.nmeaSentences.length} sentencias NMEA importadas`);
    
    // 13. Tags
    console.log('\n1️⃣3️⃣ Importando etiquetas...');
    for (const tag of data.tags) {
      await prisma.tag.upsert({
        where: { tag_id: tag.tag_id },
        update: tag,
        create: tag
      });
    }
    console.log(`✅ ${data.tags.length} etiquetas importadas`);
    
    // 14. Provenance
    console.log('\n1️⃣4️⃣ Importando trazabilidad...');
    for (const prov of data.provenance) {
      await prisma.provenance.upsert({
        where: { prov_id: prov.prov_id },
        update: prov,
        create: prov
      });
    }
    console.log(`✅ ${data.provenance.length} registros de trazabilidad importados`);
    
    console.log('\n🎉 Importación completada exitosamente!');
    
  } catch (error) {
    console.error('\n❌ Error durante la importación:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('❌ Por favor proporciona la ruta del archivo JSON a importar');
    console.log('Uso: npm run import -- <archivo.json>');
    process.exit(1);
  }
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ El archivo no existe: ${filePath}`);
    process.exit(1);
  }
  
  importData(filePath)
    .catch((e) => {
      console.error('Error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { importData };

