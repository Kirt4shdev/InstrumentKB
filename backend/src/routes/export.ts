import { Router, Request, Response } from 'express';
import { query } from '../db';
import * as XLSX from 'xlsx';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';

export const exportRouter = Router();

// Simple test endpoint
exportRouter.get('/test', async (req: Request, res: Response) => {
  try {
    console.log('Test endpoint called');
    const result = await query('SELECT * FROM manufacturers');
    res.json({ message: 'Test successful', count: result.rows.length });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ error: 'Test failed', message: error instanceof Error ? error.message : 'Unknown' });
  }
});

// Helper function to get full article with all relations
async function getFullArticle(article_id: string) {
  const articleResult = await query(
    `SELECT a.*, row_to_json(m.*) as manufacturer
     FROM articles a
     LEFT JOIN manufacturers m ON a.manufacturer_id = m.manufacturer_id
     WHERE a.article_id = $1`,
    [article_id]
  );
  
  if (articleResult.rows.length === 0) return null;
  
  const article = articleResult.rows[0];
  
  // Get all relations
  const [variables, protocols, analogOutputs, digitalIO, modbusRegisters, sdi12Commands, 
         nmeaSentences, documents, images, tags, accessories, provenance, replacedBy] = await Promise.all([
    query(`SELECT av.*, row_to_json(v.*) as variable FROM article_variables av 
           LEFT JOIN variables_dict v ON av.variable_id = v.variable_id 
           WHERE av.article_id = $1`, [article_id]),
    query(`SELECT * FROM article_protocols WHERE article_id = $1`, [article_id]),
    query(`SELECT * FROM analog_outputs WHERE article_id = $1`, [article_id]),
    query(`SELECT * FROM digital_io WHERE article_id = $1`, [article_id]),
    query(`SELECT * FROM modbus_registers WHERE article_id = $1`, [article_id]),
    query(`SELECT * FROM sdi12_commands WHERE article_id = $1`, [article_id]),
    query(`SELECT * FROM nmea_sentences WHERE article_id = $1`, [article_id]),
    query(`SELECT * FROM documents WHERE article_id = $1`, [article_id]),
    query(`SELECT * FROM images WHERE article_id = $1`, [article_id]),
    query(`SELECT * FROM tags WHERE article_id = $1`, [article_id]),
    query(`SELECT * FROM accessories WHERE article_id = $1 ORDER BY name`, [article_id]),
    query(`SELECT * FROM provenance WHERE article_id = $1`, [article_id]),
    query(`SELECT * FROM articles WHERE replacement_article_id = $1`, [article_id])
  ]);
  
  article.article_variables = variables.rows;
  article.article_protocols = protocols.rows;
  article.analog_outputs = analogOutputs.rows;
  article.digital_io = digitalIO.rows;
  article.modbus_registers = modbusRegisters.rows;
  article.sdi12_commands = sdi12Commands.rows;
  article.nmea_sentences = nmeaSentences.rows;
  article.documents = documents.rows;
  article.images = images.rows;
  article.tags = tags.rows;
  article.accessories = accessories.rows;
  article.provenance = provenance.rows;
  article.replaced_by = replacedBy.rows;
  
  // Get replacement_for
  if (article.replacement_article_id) {
    const replacementResult = await query(
      `SELECT * FROM articles WHERE article_id = $1`,
      [article.replacement_article_id]
    );
    article.replacement_for = replacementResult.rows.length > 0 ? replacementResult.rows[0] : null;
  } else {
    article.replacement_for = null;
  }
  
  return article;
}

// GET export all data as JSON (complete articles with all relations)
exportRouter.get('/json', async (req: Request, res: Response) => {
  try {
    console.log('Starting JSON export (complete articles)...');
    
    // Fetch all articles
    const articlesResult = await query('SELECT article_id FROM articles ORDER BY article_id');
    
    console.log(`Fetching ${articlesResult.rows.length} articles with all relations...`);
    
    // Get full data for each article
    const articles = [];
    for (const row of articlesResult.rows) {
      const fullArticle = await getFullArticle(row.article_id);
      if (fullArticle) {
        articles.push(fullArticle);
      }
    }

    console.log(`Successfully fetched ${articles.length} complete articles with all relations`);

    const exportData = {
      exported_at: new Date().toISOString(),
      version: '2.0',
      sap_integration: true,
      total_articles: articles.length,
      articles: articles
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="instrumentkb-complete-export-${Date.now()}.json"`);
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
    const article = await getFullArticle(id);

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
      accessories,
      provenance
    ] = await Promise.all([
      query('SELECT * FROM articles'),
      query('SELECT * FROM manufacturers'),
      query('SELECT * FROM variables_dict'),
      query('SELECT * FROM documents'),
      query('SELECT * FROM images'),
      query('SELECT * FROM article_variables'),
      query('SELECT * FROM analog_outputs'),
      query('SELECT * FROM digital_io'),
      query('SELECT * FROM article_protocols'),
      query('SELECT * FROM modbus_registers'),
      query('SELECT * FROM sdi12_commands'),
      query('SELECT * FROM nmea_sentences'),
      query('SELECT * FROM tags'),
      query('SELECT * FROM accessories'),
      query('SELECT * FROM provenance')
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
    if (articles.rows.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(articles.rows));
      XLSX.utils.book_append_sheet(workbook, ws, 'Articles');
    }

    if (manufacturers.rows.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(manufacturers.rows));
      XLSX.utils.book_append_sheet(workbook, ws, 'Manufacturers');
    }

    if (variables.rows.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(variables.rows));
      XLSX.utils.book_append_sheet(workbook, ws, 'Variables');
    }

    if (documents.rows.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(documents.rows));
      XLSX.utils.book_append_sheet(workbook, ws, 'Documents');
    }

    if (images.rows.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(images.rows));
      XLSX.utils.book_append_sheet(workbook, ws, 'Images');
    }

    if (articleVariables.rows.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(articleVariables.rows));
      XLSX.utils.book_append_sheet(workbook, ws, 'ArticleVariables');
    }

    if (analogOutputs.rows.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(analogOutputs.rows));
      XLSX.utils.book_append_sheet(workbook, ws, 'AnalogOutputs');
    }

    if (digitalIO.rows.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(digitalIO.rows));
      XLSX.utils.book_append_sheet(workbook, ws, 'DigitalIO');
    }

    if (protocols.rows.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(protocols.rows));
      XLSX.utils.book_append_sheet(workbook, ws, 'Protocols');
    }

    if (modbusRegisters.rows.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(modbusRegisters.rows));
      XLSX.utils.book_append_sheet(workbook, ws, 'ModbusRegisters');
    }

    if (sdi12Commands.rows.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(sdi12Commands.rows));
      XLSX.utils.book_append_sheet(workbook, ws, 'SDI12Commands');
    }

    if (nmeaSentences.rows.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(nmeaSentences.rows));
      XLSX.utils.book_append_sheet(workbook, ws, 'NMEASentences');
    }

    if (tags.rows.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(tags.rows));
      XLSX.utils.book_append_sheet(workbook, ws, 'Tags');
    }

    if (accessories.rows.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(accessories.rows));
      XLSX.utils.book_append_sheet(workbook, ws, 'Accessories');
    }

    if (provenance.rows.length > 0) {
      const ws = XLSX.utils.json_to_sheet(prepareForExcel(provenance.rows));
      XLSX.utils.book_append_sheet(workbook, ws, 'Provenance');
    }

    // Agregar una hoja de metadatos
    const metadata = [{
      exported_at: new Date().toISOString(),
      version: '2.0',
      sap_integration: 'true',
      total_articles: articles.rows.length,
      total_manufacturers: manufacturers.rows.length,
      total_variables: variables.rows.length
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
      accessories,
      provenance
    ] = await Promise.all([
      query('SELECT * FROM articles'),
      query('SELECT * FROM manufacturers'),
      query('SELECT * FROM variables_dict'),
      query('SELECT * FROM documents'),
      query('SELECT * FROM images'),
      query('SELECT * FROM article_variables'),
      query('SELECT * FROM analog_outputs'),
      query('SELECT * FROM digital_io'),
      query('SELECT * FROM article_protocols'),
      query('SELECT * FROM modbus_registers'),
      query('SELECT * FROM sdi12_commands'),
      query('SELECT * FROM nmea_sentences'),
      query('SELECT * FROM tags'),
      query('SELECT * FROM accessories'),
      query('SELECT * FROM provenance')
    ]);

    // Generar SQL INSERT statements compatible con PostgreSQL
    let sql = `-- InstrumentKB SQL Export (PostgreSQL Compatible)
-- Generated at: ${new Date().toISOString()}
-- Version: 2.0
-- 
-- Instructions for importing:
-- 1. Create database: CREATE DATABASE instrumentkb;
-- 2. Run database migrations to create tables
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
    const generateInsert = (tableName: string, items: any[], primaryKey?: string, updateFields?: string[]) => {
      if (items.length === 0) return '';
      
      let sql = `\n-- ${tableName}\n`;
      const fields = Object.keys(items[0]);
      
      items.forEach(item => {
        const values = fields.map(field => escapeSQLValue(item[field])).join(', ');
        let insertSql = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${values})`;
        
        // Add ON CONFLICT clause if primary key is provided
        if (primaryKey && updateFields) {
          const updateClauses = updateFields.map(f => `${f} = EXCLUDED.${f}`).join(', ');
          insertSql += `\n  ON CONFLICT (${primaryKey}) DO UPDATE SET ${updateClauses}`;
        } else if (primaryKey) {
          insertSql += `\n  ON CONFLICT (${primaryKey}) DO NOTHING`;
        }
        
        sql += insertSql + ';\n';
      });
      
      return sql;
    };

    // Orden de inserción respetando dependencias de foreign keys
    
    // 1. Manufacturers (no tiene dependencias) - with conflict resolution
    if (manufacturers.rows.length > 0) {
      sql += generateInsert('manufacturers', manufacturers.rows, 'manufacturer_id', 
        ['name', 'country', 'website', 'support_email', 'notes']);
    }

    // 2. Variables (no tiene dependencias) - with conflict resolution
    if (variables.rows.length > 0) {
      sql += generateInsert('variables_dict', variables.rows, 'variable_id',
        ['name', 'unit_default', 'description']);
    }

    // 3. Articles (depende de manufacturers) - with conflict resolution
    if (articles.rows.length > 0) {
      const articleFields = Object.keys(articles.rows[0]).filter(f => f !== 'article_id' && f !== 'created_at');
      sql += generateInsert('articles', articles.rows, 'article_id', articleFields);
    }

    // 4. Documents (depende de articles)
    if (documents.rows.length > 0) {
      sql += generateInsert('documents', documents.rows);
    }

    // 5. Images (depende de articles)
    if (images.rows.length > 0) {
      sql += generateInsert('images', images.rows);
    }

    // 6. Article Variables (depende de articles y variables)
    if (articleVariables.rows.length > 0) {
      sql += generateInsert('article_variables', articleVariables.rows);
    }

    // 7. Analog Outputs (depende de articles)
    if (analogOutputs.rows.length > 0) {
      sql += generateInsert('analog_outputs', analogOutputs.rows);
    }

    // 8. Digital I/O (depende de articles)
    if (digitalIO.rows.length > 0) {
      sql += generateInsert('digital_io', digitalIO.rows);
    }

    // 9. Protocols (depende de articles)
    if (protocols.rows.length > 0) {
      sql += generateInsert('article_protocols', protocols.rows);
    }

    // 10. Modbus Registers (depende de articles y documents)
    if (modbusRegisters.rows.length > 0) {
      sql += generateInsert('modbus_registers', modbusRegisters.rows);
    }

    // 11. SDI-12 Commands (depende de articles y documents)
    if (sdi12Commands.rows.length > 0) {
      sql += generateInsert('sdi12_commands', sdi12Commands.rows);
    }

    // 12. NMEA Sentences (depende de articles y documents)
    if (nmeaSentences.rows.length > 0) {
      sql += generateInsert('nmea_sentences', nmeaSentences.rows);
    }

    // 13. Tags (depende de articles)
    if (tags.rows.length > 0) {
      sql += generateInsert('tags', tags.rows);
    }

    // 14. Accessories (depende de articles)
    if (accessories.rows.length > 0) {
      sql += generateInsert('accessories', accessories.rows);
    }

    // 15. Provenance (depende de articles y documents)
    if (provenance.rows.length > 0) {
      sql += generateInsert('provenance', provenance.rows);
    }

    // Actualizar secuencias de autoincremento
    sql += `
-- Update sequences to avoid conflicts with future inserts
`;
    
    if (manufacturers.rows.length > 0) {
      sql += `SELECT setval('manufacturers_manufacturer_id_seq', (SELECT MAX(manufacturer_id) FROM manufacturers));\n`;
    }
    if (variables.rows.length > 0) {
      sql += `SELECT setval('variables_dict_variable_id_seq', (SELECT MAX(variable_id) FROM variables_dict));\n`;
    }
    if (documents.rows.length > 0) {
      sql += `SELECT setval('documents_document_id_seq', (SELECT MAX(document_id) FROM documents));\n`;
    }
    if (images.rows.length > 0) {
      sql += `SELECT setval('images_image_id_seq', (SELECT MAX(image_id) FROM images));\n`;
    }
    if (articleVariables.rows.length > 0) {
      sql += `SELECT setval('article_variables_art_var_id_seq', (SELECT MAX(art_var_id) FROM article_variables));\n`;
    }
    if (analogOutputs.rows.length > 0) {
      sql += `SELECT setval('analog_outputs_analog_out_id_seq', (SELECT MAX(analog_out_id) FROM analog_outputs));\n`;
    }
    if (digitalIO.rows.length > 0) {
      sql += `SELECT setval('digital_io_dio_id_seq', (SELECT MAX(dio_id) FROM digital_io));\n`;
    }
    if (protocols.rows.length > 0) {
      sql += `SELECT setval('article_protocols_art_proto_id_seq', (SELECT MAX(art_proto_id) FROM article_protocols));\n`;
    }
    if (modbusRegisters.rows.length > 0) {
      sql += `SELECT setval('modbus_registers_modbus_id_seq', (SELECT MAX(modbus_id) FROM modbus_registers));\n`;
    }
    if (sdi12Commands.rows.length > 0) {
      sql += `SELECT setval('sdi12_commands_sdi12_id_seq', (SELECT MAX(sdi12_id) FROM sdi12_commands));\n`;
    }
    if (nmeaSentences.rows.length > 0) {
      sql += `SELECT setval('nmea_sentences_nmea_id_seq', (SELECT MAX(nmea_id) FROM nmea_sentences));\n`;
    }
    if (tags.rows.length > 0) {
      sql += `SELECT setval('tags_tag_id_seq', (SELECT MAX(tag_id) FROM tags));\n`;
    }
    if (accessories.rows.length > 0) {
      sql += `SELECT setval('accessories_accessory_id_seq', (SELECT MAX(accessory_id) FROM accessories));\n`;
    }
    if (provenance.rows.length > 0) {
      sql += `SELECT setval('provenance_prov_id_seq', (SELECT MAX(prov_id) FROM provenance));\n`;
    }

    sql += `
-- Re-enable triggers
SET session_replication_role = DEFAULT;

COMMIT;

-- Export completed successfully
-- Total records:
--   Articles: ${articles.rows.length}
--   Manufacturers: ${manufacturers.rows.length}
--   Variables: ${variables.rows.length}
--   Documents: ${documents.rows.length}
--   Images: ${images.rows.length}
--   Article Variables: ${articleVariables.rows.length}
--   Analog Outputs: ${analogOutputs.rows.length}
--   Digital I/O: ${digitalIO.rows.length}
--   Protocols: ${protocols.rows.length}
--   Modbus Registers: ${modbusRegisters.rows.length}
--   SDI-12 Commands: ${sdi12Commands.rows.length}
--   NMEA Sentences: ${nmeaSentences.rows.length}
--   Tags: ${tags.rows.length}
--   Accessories: ${accessories.rows.length}
--   Provenance: ${provenance.rows.length}
`;

    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="instrumentkb-export-${Date.now()}.sql"`);
    res.send(sql);
  } catch (error) {
    console.error('SQL export error:', error);
    res.status(500).json({ error: 'Error exporting SQL' });
  }
});

// GET export as ZIP with files (complete backup)
exportRouter.get('/zip', async (req: Request, res: Response) => {
  try {
    console.log('Starting ZIP export with files...');
    
    const storagePath = process.env.STORAGE_PATH || './uploads';
    
    // Fetch all articles
    const articlesResult = await query('SELECT article_id FROM articles ORDER BY article_id');
    
    console.log(`Fetching ${articlesResult.rows.length} articles with all relations...`);
    
    // Get full data for each article
    const articles = [];
    for (const row of articlesResult.rows) {
      const fullArticle = await getFullArticle(row.article_id);
      if (fullArticle) {
        articles.push(fullArticle);
      }
    }

    console.log(`Successfully fetched ${articles.length} complete articles with all relations`);

    const exportData = {
      exported_at: new Date().toISOString(),
      version: '2.0',
      sap_integration: true,
      total_articles: articles.length,
      articles: articles
    };

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="instrumentkb-complete-backup-${Date.now()}.zip"`);

    // Pipe archive to response
    archive.pipe(res);

    // Add JSON data file
    archive.append(JSON.stringify(exportData, null, 2), { name: 'data.json' });

    // Collect all file paths from documents and images
    const filesToExport = new Set<string>();
    
    for (const article of articles) {
      // Add documents
      if (article.documents && Array.isArray(article.documents)) {
        for (const doc of article.documents) {
          if (doc.url_or_path) {
            filesToExport.add(doc.url_or_path);
          }
        }
      }
      
      // Add images
      if (article.images && Array.isArray(article.images)) {
        for (const img of article.images) {
          if (img.url_or_path) {
            filesToExport.add(img.url_or_path);
          }
        }
      }
    }

    console.log(`Found ${filesToExport.size} files to export`);

    // Add files to ZIP maintaining folder structure
    let filesAdded = 0;
    let filesMissing = 0;
    const missingFiles: string[] = [];

    for (const relativePath of filesToExport) {
      const fullPath = path.join(storagePath, relativePath);
      
      if (fs.existsSync(fullPath)) {
        try {
          // Add file to ZIP with the same relative path under 'uploads/' folder
          archive.file(fullPath, { name: `uploads/${relativePath.replace(/\\/g, '/')}` });
          filesAdded++;
        } catch (error) {
          console.error(`Error adding file ${relativePath}:`, error);
          missingFiles.push(relativePath);
          filesMissing++;
        }
      } else {
        console.warn(`File not found: ${fullPath}`);
        missingFiles.push(relativePath);
        filesMissing++;
      }
    }

    // Add a README file with import instructions
    const readme = `# InstrumentKB Complete Backup
    
Exported at: ${new Date().toISOString()}
Version: 2.0
Total articles: ${articles.length}
Files included: ${filesAdded}
Files missing: ${filesMissing}

## Contents:
- data.json: Complete database export with all articles and relations
- uploads/: All documents and images organized in their original folder structure

## How to import:

1. Upload this ZIP file through the import interface
2. The system will:
   - Extract all files
   - Import the database records from data.json
   - Place files in the uploads folder with the same structure
   - Maintain all references between articles and files

## Missing files:
${missingFiles.length > 0 ? missingFiles.join('\n') : 'None - all files were exported successfully!'}

## Notes:
- All file paths are preserved exactly as they were
- Simply upload this ZIP to restore the complete system
- The import will handle duplicates automatically (update existing records)
`;

    archive.append(readme, { name: 'README.txt' });

    // Finalize archive
    await archive.finalize();

    console.log(`Export completed: ${filesAdded} files added, ${filesMissing} files missing`);
  } catch (error) {
    console.error('ZIP export error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // If headers not sent, send error response
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Error exporting ZIP',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});
