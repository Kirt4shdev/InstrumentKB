import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import * as XLSX from 'xlsx';

export const exportRouter = Router();

// Simple test endpoint
exportRouter.get('/test', async (req: Request, res: Response) => {
  try {
    console.log('Test endpoint called');
    const manufacturers = await prisma.manufacturer.findMany();
    res.json({ message: 'Test successful', count: manufacturers.length });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ error: 'Test failed', message: error instanceof Error ? error.message : 'Unknown' });
  }
});

// GET export all data as JSON
exportRouter.get('/json', async (req: Request, res: Response) => {
  try {
    console.log('Starting JSON export...');
    
    // Try each query one by one to find which one fails
    console.log('Fetching articles...');
    const articles = await prisma.article.findMany();
    console.log(`Articles: ${articles.length}`);
    
    console.log('Fetching manufacturers...');
    const manufacturers = await prisma.manufacturer.findMany();
    console.log(`Manufacturers: ${manufacturers.length}`);
    
    console.log('Fetching variables...');
    const variables = await prisma.variableDict.findMany();
    console.log(`Variables: ${variables.length}`);
    
    console.log('Fetching documents...');
    const documents = await prisma.document.findMany();
    console.log(`Documents: ${documents.length}`);
    
    console.log('Fetching images...');
    const images = await prisma.image.findMany();
    console.log(`Images: ${images.length}`);
    
    console.log('Fetching articleVariables...');
    const articleVariables = await prisma.articleVariable.findMany();
    console.log(`ArticleVariables: ${articleVariables.length}`);
    
    console.log('Fetching analogOutputs...');
    const analogOutputs = await prisma.analogOutput.findMany();
    console.log(`AnalogOutputs: ${analogOutputs.length}`);
    
    console.log('Fetching digitalIO...');
    const digitalIO = await prisma.digitalIO.findMany();
    console.log(`DigitalIO: ${digitalIO.length}`);
    
    console.log('Fetching protocols...');
    const protocols = await prisma.articleProtocol.findMany();
    console.log(`Protocols: ${protocols.length}`);
    
    console.log('Fetching modbusRegisters...');
    const modbusRegisters = await prisma.modbusRegister.findMany();
    console.log(`ModbusRegisters: ${modbusRegisters.length}`);
    
    console.log('Fetching sdi12Commands...');
    const sdi12Commands = await prisma.sDI12Command.findMany();
    console.log(`SDI12Commands: ${sdi12Commands.length}`);
    
    console.log('Fetching nmeaSentences...');
    const nmeaSentences = await prisma.nMEASentence.findMany();
    console.log(`NMEASentences: ${nmeaSentences.length}`);
    
    console.log('Fetching tags...');
    const tags = await prisma.tag.findMany();
    console.log(`Tags: ${tags.length}`);
    
    console.log('Fetching provenance...');
    const provenance = await prisma.provenance.findMany();
    console.log(`Provenance: ${provenance.length}`);

    console.log('Data fetched successfully');

    const exportData = {
      exported_at: new Date().toISOString(),
      version: '2.0',
      sap_integration: true,
      data: {
        articles,
        manufacturers,
        variables,
        documents,
        images,
        articleVariables,
        analogOutputs,
        digitalIO,
        protocols,
        modbusRegisters,
        sdi12Commands,
        nmeaSentences,
        tags,
        provenance
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="instrumentkb-export-${Date.now()}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Export error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      error: 'Error exporting data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET export single article as JSON
exportRouter.get('/json/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const article = await prisma.article.findUnique({
      where: { article_id: id },
      include: {
        manufacturer: true,
        documents: true,
        images: true,
        article_variables: {
          include: {
            variable: true
          }
        },
        analog_outputs: true,
        digital_io: true,
        article_protocols: true,
        modbus_registers: true,
        sdi12_commands: true,
        nmea_sentences: true,
        tags: true,
        provenance: true
      }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="article-${id}-${Date.now()}.json"`);
    res.json(article);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Error exporting article' });
  }
});

// GET export as Excel (one table per sheet)
exportRouter.get('/excel', async (req: Request, res: Response) => {
  try {
    // Obtener todos los datos
    const [
      articles,
      manufacturers,
      variables,
      documents,
      images,
      articleVariables,
      analogOutputs,
      digitalIO,
      protocols,
      modbusRegisters,
      sdi12Commands,
      nmeaSentences,
      tags,
      provenance
    ] = await Promise.all([
      prisma.article.findMany(),
      prisma.manufacturer.findMany(),
      prisma.variableDict.findMany(),
      prisma.document.findMany(),
      prisma.image.findMany(),
      prisma.articleVariable.findMany(),
      prisma.analogOutput.findMany(),
      prisma.digitalIO.findMany(),
      prisma.articleProtocol.findMany(),
      prisma.modbusRegister.findMany(),
      prisma.sDI12Command.findMany(),
      prisma.nMEASentence.findMany(),
      prisma.tag.findMany(),
      prisma.provenance.findMany()
    ]);

    // Crear nuevo workbook
    const workbook = XLSX.utils.book_new();

    // Helper para convertir datos a formato Excel-friendly
    const prepareForExcel = (data: any[]) => {
      return data.map(item => {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(item)) {
          if (value instanceof Date) {
            cleaned[key] = value.toISOString();
          } else if (value === null || value === undefined) {
            cleaned[key] = '';
          } else if (typeof value === 'boolean') {
            cleaned[key] = value ? 'TRUE' : 'FALSE';
          } else {
            cleaned[key] = value;
          }
        }
        return cleaned;
      });
    };

    // Agregar cada tabla como una hoja
    if (articles.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(articles));
      XLSX.utils.book_append_sheet(workbook, ws, 'Articles');
    }

    if (manufacturers.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(manufacturers));
      XLSX.utils.book_append_sheet(workbook, ws, 'Manufacturers');
    }

    if (variables.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(variables));
      XLSX.utils.book_append_sheet(workbook, ws, 'Variables');
    }

    if (documents.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(documents));
      XLSX.utils.book_append_sheet(workbook, ws, 'Documents');
    }

    if (images.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(images));
      XLSX.utils.book_append_sheet(workbook, ws, 'Images');
    }

    if (articleVariables.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(articleVariables));
      XLSX.utils.book_append_sheet(workbook, ws, 'ArticleVariables');
    }

    if (analogOutputs.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(analogOutputs));
      XLSX.utils.book_append_sheet(workbook, ws, 'AnalogOutputs');
    }

    if (digitalIO.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(digitalIO));
      XLSX.utils.book_append_sheet(workbook, ws, 'DigitalIO');
    }

    if (protocols.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(protocols));
      XLSX.utils.book_append_sheet(workbook, ws, 'Protocols');
    }

    if (modbusRegisters.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(modbusRegisters));
      XLSX.utils.book_append_sheet(workbook, ws, 'ModbusRegisters');
    }

    if (sdi12Commands.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(sdi12Commands));
      XLSX.utils.book_append_sheet(workbook, ws, 'SDI12Commands');
    }

    if (nmeaSentences.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(nmeaSentences));
      XLSX.utils.book_append_sheet(workbook, ws, 'NMEASentences');
    }

    if (tags.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(tags));
      XLSX.utils.book_append_sheet(workbook, ws, 'Tags');
    }

    if (provenance.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(provenance));
      XLSX.utils.book_append_sheet(workbook, ws, 'Provenance');
    }

    // Agregar una hoja de metadatos
    const metadata = [{
      exported_at: new Date().toISOString(),
      version: '2.0',
      sap_integration: 'true',
      total_articles: articles.length,
      total_manufacturers: manufacturers.length,
      total_variables: variables.length
    }];
    const metaWs = XLSX.utils.json_to_sheet(metadata);
    XLSX.utils.book_append_sheet(workbook, metaWs, 'Metadata');

    // Generar el buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="instrumentkb-export-${Date.now()}.xlsx"`);
    res.send(excelBuffer);
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Error exporting to Excel' });
  }
});

// GET export as SQL dump (PostgreSQL compatible)
exportRouter.get('/sql', async (req: Request, res: Response) => {
  try {
    // Obtener todos los datos
    const [
      articles,
      manufacturers,
      variables,
      documents,
      images,
      articleVariables,
      analogOutputs,
      digitalIO,
      protocols,
      modbusRegisters,
      sdi12Commands,
      nmeaSentences,
      tags,
      provenance
    ] = await Promise.all([
      prisma.article.findMany(),
      prisma.manufacturer.findMany(),
      prisma.variableDict.findMany(),
      prisma.document.findMany(),
      prisma.image.findMany(),
      prisma.articleVariable.findMany(),
      prisma.analogOutput.findMany(),
      prisma.digitalIO.findMany(),
      prisma.articleProtocol.findMany(),
      prisma.modbusRegister.findMany(),
      prisma.sDI12Command.findMany(),
      prisma.nMEASentence.findMany(),
      prisma.tag.findMany(),
      prisma.provenance.findMany()
    ]);

    // Generar SQL INSERT statements compatible con PostgreSQL
    let sql = `-- InstrumentKB SQL Export (PostgreSQL Compatible)
-- Generated at: ${new Date().toISOString()}
-- Version: 2.0
-- 
-- Instructions for importing:
-- 1. Create database: CREATE DATABASE instrumentkb;
-- 2. Run Prisma migrations: npx prisma migrate deploy
-- 3. Import this file: psql -U postgres -d instrumentkb -f instrumentkb-export-XXXXX.sql
--
-- Or if you want to overwrite existing data:
-- psql -U postgres -d instrumentkb -c "TRUNCATE articles, manufacturers, variables_dict, documents, images, article_variables, analog_outputs, digital_io, article_protocols, modbus_registers, sdi12_commands, nmea_sentences, tags, provenance CASCADE;"
-- psql -U postgres -d instrumentkb -f instrumentkb-export-XXXXX.sql
--

BEGIN;

-- Disable triggers to avoid constraint issues during import
SET session_replication_role = replica;

`;

    // Helper para escapar valores SQL
    const escapeSQLValue = (value: any): string => {
      if (value === null || value === undefined) return 'NULL';
      if (typeof value === 'number') {
        if (isNaN(value) || !isFinite(value)) return 'NULL';
        return value.toString();
      }
      if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
      if (value instanceof Date) return `'${value.toISOString()}'`;
      // Escapar comillas simples y caracteres especiales
      return `'${value.toString().replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
    };

    // Helper para generar INSERT con todos los campos
    const generateInsert = (tableName: string, items: any[]) => {
      if (items.length === 0) return '';
      
      let sql = `\n-- ${tableName}\n`;
      const fields = Object.keys(items[0]);
      
      items.forEach(item => {
        const values = fields.map(field => escapeSQLValue(item[field])).join(', ');
        sql += `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${values});\n`;
      });
      
      return sql;
    };

    // Orden de inserción respetando dependencias de foreign keys
    
    // 1. Manufacturers (no tiene dependencias)
    if (manufacturers.length > 0) {
      sql += generateInsert('manufacturers', manufacturers);
    }

    // 2. Variables (no tiene dependencias)
    if (variables.length > 0) {
      sql += generateInsert('variables_dict', variables);
    }

    // 3. Articles (depende de manufacturers)
    if (articles.length > 0) {
      sql += generateInsert('articles', articles);
    }

    // 4. Documents (depende de articles)
    if (documents.length > 0) {
      sql += generateInsert('documents', documents);
    }

    // 5. Images (depende de articles)
    if (images.length > 0) {
      sql += generateInsert('images', images);
    }

    // 6. Article Variables (depende de articles y variables)
    if (articleVariables.length > 0) {
      sql += generateInsert('article_variables', articleVariables);
    }

    // 7. Analog Outputs (depende de articles)
    if (analogOutputs.length > 0) {
      sql += generateInsert('analog_outputs', analogOutputs);
    }

    // 8. Digital I/O (depende de articles)
    if (digitalIO.length > 0) {
      sql += generateInsert('digital_io', digitalIO);
    }

    // 9. Protocols (depende de articles)
    if (protocols.length > 0) {
      sql += generateInsert('article_protocols', protocols);
    }

    // 10. Modbus Registers (depende de articles y documents)
    if (modbusRegisters.length > 0) {
      sql += generateInsert('modbus_registers', modbusRegisters);
    }

    // 11. SDI-12 Commands (depende de articles y documents)
    if (sdi12Commands.length > 0) {
      sql += generateInsert('sdi12_commands', sdi12Commands);
    }

    // 12. NMEA Sentences (depende de articles y documents)
    if (nmeaSentences.length > 0) {
      sql += generateInsert('nmea_sentences', nmeaSentences);
    }

    // 13. Tags (depende de articles)
    if (tags.length > 0) {
      sql += generateInsert('tags', tags);
    }

    // 14. Provenance (depende de articles y documents)
    if (provenance.length > 0) {
      sql += generateInsert('provenance', provenance);
    }

    // Actualizar secuencias de autoincremento
    sql += `
-- Update sequences to avoid conflicts with future inserts
`;
    
    if (manufacturers.length > 0) {
      sql += `SELECT setval('manufacturers_manufacturer_id_seq', (SELECT MAX(manufacturer_id) FROM manufacturers));\n`;
    }
    if (variables.length > 0) {
      sql += `SELECT setval('variables_dict_variable_id_seq', (SELECT MAX(variable_id) FROM variables_dict));\n`;
    }
    if (documents.length > 0) {
      sql += `SELECT setval('documents_document_id_seq', (SELECT MAX(document_id) FROM documents));\n`;
    }
    if (images.length > 0) {
      sql += `SELECT setval('images_image_id_seq', (SELECT MAX(image_id) FROM images));\n`;
    }
    if (articleVariables.length > 0) {
      sql += `SELECT setval('article_variables_art_var_id_seq', (SELECT MAX(art_var_id) FROM article_variables));\n`;
    }
    if (analogOutputs.length > 0) {
      sql += `SELECT setval('analog_outputs_analog_out_id_seq', (SELECT MAX(analog_out_id) FROM analog_outputs));\n`;
    }
    if (digitalIO.length > 0) {
      sql += `SELECT setval('digital_io_dio_id_seq', (SELECT MAX(dio_id) FROM digital_io));\n`;
    }
    if (protocols.length > 0) {
      sql += `SELECT setval('article_protocols_art_proto_id_seq', (SELECT MAX(art_proto_id) FROM article_protocols));\n`;
    }
    if (modbusRegisters.length > 0) {
      sql += `SELECT setval('modbus_registers_modbus_id_seq', (SELECT MAX(modbus_id) FROM modbus_registers));\n`;
    }
    if (sdi12Commands.length > 0) {
      sql += `SELECT setval('sdi12_commands_sdi12_id_seq', (SELECT MAX(sdi12_id) FROM sdi12_commands));\n`;
    }
    if (nmeaSentences.length > 0) {
      sql += `SELECT setval('nmea_sentences_nmea_id_seq', (SELECT MAX(nmea_id) FROM nmea_sentences));\n`;
    }
    if (tags.length > 0) {
      sql += `SELECT setval('tags_tag_id_seq', (SELECT MAX(tag_id) FROM tags));\n`;
    }
    if (provenance.length > 0) {
      sql += `SELECT setval('provenance_prov_id_seq', (SELECT MAX(prov_id) FROM provenance));\n`;
    }

    sql += `
-- Re-enable triggers
SET session_replication_role = DEFAULT;

COMMIT;

-- Export completed successfully
-- Total records:
--   Articles: ${articles.length}
--   Manufacturers: ${manufacturers.length}
--   Variables: ${variables.length}
--   Documents: ${documents.length}
--   Images: ${images.length}
--   Article Variables: ${articleVariables.length}
--   Analog Outputs: ${analogOutputs.length}
--   Digital I/O: ${digitalIO.length}
--   Protocols: ${protocols.length}
--   Modbus Registers: ${modbusRegisters.length}
--   SDI-12 Commands: ${sdi12Commands.length}
--   NMEA Sentences: ${nmeaSentences.length}
--   Tags: ${tags.length}
--   Provenance: ${provenance.length}
`;


    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="instrumentkb-export-${Date.now()}.sql"`);
    res.send(sql);
  } catch (error) {
    console.error('SQL export error:', error);
    res.status(500).json({ error: 'Error exporting SQL' });
  }
});

