import { Router, Request, Response } from 'express';
import { transaction } from '../db';
import * as XLSX from 'xlsx';
import multer from 'multer';
import path from 'path';
import extract from 'extract-zip';
import fs from 'fs';
import os from 'os';

export const importRouter = Router();

// Helper function to handle null values preserving 0
function toNullable(value: any): any {
  // Preserve 0, false, and empty strings but convert undefined/null to null
  return value === undefined || value === null ? null : value;
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max
  }
});

// Helper function to import a single article with all relations
async function importArticle(client: any, articleData: any) {
  // Extract relation data that should NOT be inserted into articles table
  const {
    article_variables,
    article_protocols,
    analog_outputs,
    digital_io,
    modbus_registers,
    sdi12_commands,
    nmea_sentences,
    documents,
    images,
    tags,
    accessories,
    manufacturer,
    provenance, // Separate table
    replaced_by, // Separate relationship
    replacement_for, // Separate relationship
    ...rawArticleFields
  } = articleData;

  // Filter to only include valid article table columns
  // Note: created_at and updated_at are handled separately in INSERT
  const validArticleColumns = [
    'article_id', 'sap_itemcode', 'sap_description', 'article_type', 'category', 
    'family', 'subfamily', 'manufacturer_id', 'model', 'variant',
    'power_supply_min_v', 'power_supply_max_v', 'power_consumption_typ_w',
    'current_max_a', 'voltage_rating_v', 'ip_rating', 'dimensions_mm', 'weight_g',
    'length_m', 'diameter_mm', 'material', 'color',
    'oper_temp_min_c', 'oper_temp_max_c', 'storage_temp_min_c', 'storage_temp_max_c',
    'oper_humidity_min_pct', 'oper_humidity_max_pct', 'altitude_max_m',
    'emc_compliance', 'certifications', 'first_release_year', 'last_revision_year',
    'discontinued', 'replacement_article_id', 'internal_notes', 'active',
    'stock_location', 'min_stock', 'current_stock',
    'has_heating', 'heating_consumption_w', 'heating_temp_min_c', 'heating_temp_max_c'
  ];

  // Filter article fields to only include valid columns
  const articleFields: any = {};
  for (const key of validArticleColumns) {
    if (key in rawArticleFields) {
      articleFields[key] = rawArticleFields[key];
    }
  }

  // Check if article already exists
  const existingResult = await client.query(
    'SELECT article_id FROM articles WHERE article_id = $1',
    [articleFields.article_id]
  );

  if (existingResult.rows.length > 0) {
    // Article exists, update it
    const fields = Object.keys(articleFields).filter(key => key !== 'article_id');
    if (fields.length > 0) {
      const setClause = fields.map((key, idx) => `${key} = $${idx + 2}`).join(', ');
      const values = fields.map(key => articleFields[key]);
      
      await client.query(
        `UPDATE articles SET ${setClause}, updated_at = NOW() WHERE article_id = $1`,
        [articleFields.article_id, ...values]
      );
    }
  } else {
    // Article doesn't exist, insert it
    const fields = Object.keys(articleFields);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const values = fields.map(key => articleFields[key]);
    
    await client.query(
      `INSERT INTO articles (${fields.join(', ')}, created_at, updated_at) 
       VALUES (${placeholders}, NOW(), NOW())`,
      values
    );
  }

  const article_id = articleFields.article_id;

  // Delete existing relations
  await Promise.all([
    client.query('DELETE FROM article_variables WHERE article_id = $1', [article_id]),
    client.query('DELETE FROM article_protocols WHERE article_id = $1', [article_id]),
    client.query('DELETE FROM analog_outputs WHERE article_id = $1', [article_id]),
    client.query('DELETE FROM digital_io WHERE article_id = $1', [article_id]),
    client.query('DELETE FROM modbus_registers WHERE article_id = $1', [article_id]),
    client.query('DELETE FROM sdi12_commands WHERE article_id = $1', [article_id]),
    client.query('DELETE FROM nmea_sentences WHERE article_id = $1', [article_id]),
    client.query('DELETE FROM documents WHERE article_id = $1', [article_id]),
    client.query('DELETE FROM images WHERE article_id = $1', [article_id]),
    client.query('DELETE FROM tags WHERE article_id = $1', [article_id]),
    client.query('DELETE FROM accessories WHERE article_id = $1', [article_id])
  ]);

  // Insert relations
  if (article_variables?.length > 0) {
    for (const v of article_variables) {
      await client.query(
        `INSERT INTO article_variables (article_id, variable_id, range_min, range_max, unit, accuracy_abs, accuracy_rel_pct, resolution, update_rate_hz, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [article_id, v.variable_id, toNullable(v.range_min), toNullable(v.range_max), toNullable(v.unit), 
         toNullable(v.accuracy_abs), toNullable(v.accuracy_rel_pct), toNullable(v.resolution), toNullable(v.update_rate_hz), toNullable(v.notes)]
      );
    }
  }

  if (article_protocols?.length > 0) {
    for (const p of article_protocols) {
      await client.query(
        `INSERT INTO article_protocols (article_id, type, physical_layer, port_label, default_address, 
         baudrate, databits, parity, stopbits, ip_address, ip_port, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [article_id, p.type, toNullable(p.physical_layer), toNullable(p.port_label), toNullable(p.default_address),
         toNullable(p.baudrate), toNullable(p.databits), toNullable(p.parity), toNullable(p.stopbits), 
         toNullable(p.ip_address), toNullable(p.ip_port), toNullable(p.notes)]
      );
    }
  }

  if (analog_outputs?.length > 0) {
    for (const ao of analog_outputs) {
      await client.query(
        `INSERT INTO analog_outputs (article_id, type, num_channels, range_min, range_max, unit, 
         load_min_ohm, load_max_ohm, accuracy, scaling_notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [article_id, ao.type, toNullable(ao.num_channels), toNullable(ao.range_min), toNullable(ao.range_max),
         toNullable(ao.unit), toNullable(ao.load_min_ohm), toNullable(ao.load_max_ohm), toNullable(ao.accuracy), 
         toNullable(ao.scaling_notes)]
      );
    }
  }

  if (digital_io?.length > 0) {
    for (const dio of digital_io) {
      await client.query(
        `INSERT INTO digital_io (article_id, direction, signal_type, voltage_level, current_max_ma, 
         frequency_max_hz, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [article_id, dio.direction, dio.signal_type, toNullable(dio.voltage_level), 
         toNullable(dio.current_max_ma), toNullable(dio.frequency_max_hz), toNullable(dio.notes)]
      );
    }
  }

  if (modbus_registers?.length > 0) {
    for (const m of modbus_registers) {
      await client.query(
        `INSERT INTO modbus_registers (article_id, function_code, address, name, description, datatype, 
         scale, unit, rw, min, max, default_value, notes, reference_document_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [article_id, m.function_code, m.address, m.name, toNullable(m.description), toNullable(m.datatype),
         toNullable(m.scale), toNullable(m.unit), m.rw, toNullable(m.min), toNullable(m.max), toNullable(m.default_value),
         toNullable(m.notes), toNullable(m.reference_document_id)]
      );
    }
  }

  if (sdi12_commands?.length > 0) {
    for (const s of sdi12_commands) {
      await client.query(
        `INSERT INTO sdi12_commands (article_id, command, description, response_format, reference_document_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [article_id, s.command, toNullable(s.description), toNullable(s.response_format), 
         toNullable(s.reference_document_id)]
      );
    }
  }

  if (nmea_sentences?.length > 0) {
    for (const n of nmea_sentences) {
      await client.query(
        `INSERT INTO nmea_sentences (article_id, sentence, description, fields, reference_document_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [article_id, n.sentence, toNullable(n.description), toNullable(n.fields), toNullable(n.reference_document_id)]
      );
    }
  }

  if (documents?.length > 0) {
    for (const d of documents) {
      await client.query(
        `INSERT INTO documents (article_id, type, title, language, revision, publish_date, url_or_path, 
         sha256, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [article_id, d.type, d.title, toNullable(d.language), toNullable(d.revision), toNullable(d.publish_date),
         d.url_or_path, toNullable(d.sha256), toNullable(d.notes)]
      );
    }
  }

  if (images?.length > 0) {
    for (const i of images) {
      await client.query(
        `INSERT INTO images (article_id, caption, url_or_path, credit, license, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [article_id, toNullable(i.caption), i.url_or_path, toNullable(i.credit), toNullable(i.license), toNullable(i.notes)]
      );
    }
  }

  if (tags?.length > 0) {
    for (const t of tags) {
      await client.query(
        `INSERT INTO tags (article_id, tag) VALUES ($1, $2)`,
        [article_id, typeof t === 'string' ? t : t.tag]
      );
    }
  }

  if (accessories?.length > 0) {
    for (const acc of accessories) {
      await client.query(
        `INSERT INTO accessories (article_id, name, part_number, description, quantity, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [article_id, acc.name, toNullable(acc.part_number), toNullable(acc.description),
         toNullable(acc.quantity), toNullable(acc.notes)]
      );
    }
  }
}

// POST import JSON
importRouter.post('/json', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const data = JSON.parse(fileContent);

    let articles = [];
    
    // Check if it's a complete export or just an array of articles
    if (Array.isArray(data)) {
      articles = data;
    } else if (data.articles && Array.isArray(data.articles)) {
      articles = data.articles;
    } else if (data.article_id) {
      // Single article
      articles = [data];
    } else {
      return res.status(400).json({ error: 'Invalid JSON format' });
    }

    let imported = 0;
    let updated = 0;
    let failed = 0;
    const errors: any[] = [];

    // First, import all manufacturers and variables that are referenced
    // Using individual transactions with ON CONFLICT to handle duplicates
    for (const article of articles) {
      if (article.manufacturer && article.manufacturer.manufacturer_id) {
        try {
          await transaction(async (client) => {
            await client.query(
              `INSERT INTO manufacturers (manufacturer_id, name, country, website, support_email, notes)
               VALUES ($1, $2, $3, $4, $5, $6)
               ON CONFLICT (manufacturer_id) DO UPDATE SET
               name = EXCLUDED.name,
               country = EXCLUDED.country,
               website = EXCLUDED.website,
               support_email = EXCLUDED.support_email,
               notes = EXCLUDED.notes`,
              [
                article.manufacturer.manufacturer_id,
                article.manufacturer.name,
                toNullable(article.manufacturer.country),
                toNullable(article.manufacturer.website),
                toNullable(article.manufacturer.support_email),
                toNullable(article.manufacturer.notes)
              ]
            );
          });
        } catch (error: any) {
          console.log('Manufacturer import warning:', error.message);
        }
      }

      // Import variables if they have full data
      if (article.article_variables) {
        for (const av of article.article_variables) {
          if (av.variable && av.variable.variable_id) {
            try {
              await transaction(async (client) => {
                await client.query(
                  `INSERT INTO variables_dict (variable_id, name, unit_default, description)
                   VALUES ($1, $2, $3, $4)
                   ON CONFLICT (variable_id) DO UPDATE SET
                   name = EXCLUDED.name,
                   unit_default = EXCLUDED.unit_default,
                   description = EXCLUDED.description`,
                  [
                    av.variable.variable_id,
                    av.variable.name,
                    toNullable(av.variable.unit_default),
                    toNullable(av.variable.description)
                  ]
                );
              });
            } catch (error: any) {
              console.log('Variable import warning:', error.message);
            }
          }
        }
      }
    }

    // Now import articles
    for (const article of articles) {
      try {
        let wasUpdate = false;
        await transaction(async (client) => {
          const existingResult = await client.query(
            'SELECT article_id FROM articles WHERE article_id = $1',
            [article.article_id]
          );
          
          wasUpdate = existingResult.rows.length > 0;
          
          await importArticle(client, article);
        });
        
        // Only count after successful import
        if (wasUpdate) {
          updated++;
        } else {
          imported++;
        }
      } catch (error: any) {
        failed++;
        console.error(`Error importing article ${article.article_id}:`, error);
        errors.push({
          article_id: article.article_id,
          error: error.message,
          stack: error.stack?.split('\n').slice(0, 3).join('\n') // First 3 lines of stack trace
        });
      }
    }

    res.json({
      success: true,
      total: articles.length,
      imported,
      updated,
      failed,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Import error:', error);
    res.status(500).json({ 
      error: 'Error importing JSON', 
      message: error.message 
    });
  }
});

// POST import Excel
importRouter.post('/excel', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });

    // Read sheets
    const sheets: any = {};
    workbook.SheetNames.forEach(sheetName => {
      sheets[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    });

    // Import data table by table
    let imported = 0;
    const errors: any[] = [];

    // Import manufacturers first (if exists in the Excel) - each in its own transaction
    if (sheets.Manufacturers && sheets.Manufacturers.length > 0) {
      for (const manufacturer of sheets.Manufacturers) {
        try {
          await transaction(async (client) => {
            const fields = Object.keys(manufacturer);
            const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
            const values = fields.map(k => manufacturer[k] === '' ? null : manufacturer[k]);
            
            // Use ON CONFLICT to update if exists
            await client.query(
              `INSERT INTO manufacturers (${fields.join(', ')})
               VALUES (${placeholders})
               ON CONFLICT (manufacturer_id) DO UPDATE SET
               name = EXCLUDED.name,
               country = EXCLUDED.country,
               website = EXCLUDED.website,
               support_email = EXCLUDED.support_email,
               notes = EXCLUDED.notes`,
              values
            );
          });
        } catch (error: any) {
          console.log('Manufacturer import warning:', error.message);
        }
      }
    }

    // Import variables dictionary (if exists) - each in its own transaction
    if (sheets.Variables && sheets.Variables.length > 0) {
      for (const variable of sheets.Variables) {
        try {
          await transaction(async (client) => {
            const fields = Object.keys(variable);
            const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
            const values = fields.map(k => variable[k] === '' ? null : variable[k]);
            
            await client.query(
              `INSERT INTO variables_dict (${fields.join(', ')})
               VALUES (${placeholders})
               ON CONFLICT (variable_id) DO UPDATE SET
               name = EXCLUDED.name,
               unit_default = EXCLUDED.unit_default,
               description = EXCLUDED.description`,
              values
            );
          });
        } catch (error: any) {
          console.log('Variable import warning:', error.message);
        }
      }
    }

    await transaction(async (client) => {

      // Import articles - skip on errors to continue with others
      if (sheets.Articles && sheets.Articles.length > 0) {
        for (const article of sheets.Articles) {
          // Convert string booleans back to actual booleans
          if (article.active === 'TRUE') article.active = true;
          if (article.active === 'FALSE') article.active = false;
          if (article.discontinued === 'TRUE') article.discontinued = true;
          if (article.discontinued === 'FALSE') article.discontinued = false;
          if (article.has_heating === 'TRUE') article.has_heating = true;
          if (article.has_heating === 'FALSE') article.has_heating = false;

          // Use INSERT ... ON CONFLICT for articles
          try {
            const fields = Object.keys(article);
            const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
            const values = fields.map(k => article[k] === '' ? null : article[k]);
            
            const updateFields = fields.filter(f => f !== 'article_id' && f !== 'created_at');
            const updateClause = updateFields.map(f => `${f} = EXCLUDED.${f}`).join(', ');
            
            await client.query(
              `INSERT INTO articles (${fields.join(', ')}, created_at, updated_at) 
               VALUES (${placeholders}, NOW(), NOW())
               ON CONFLICT (article_id) DO UPDATE SET ${updateClause}, updated_at = NOW()`,
              values
            );
            imported++;
          } catch (error: any) {
            errors.push({
              table: 'Articles',
              article_id: article.article_id,
              error: error.message
            });
          }
        }
      }

      // Import related tables - silently skip duplicates
      const relatedTables = [
        { name: 'AnalogOutputs', table: 'analog_outputs' },
        { name: 'DigitalIO', table: 'digital_io' },
        { name: 'Protocols', table: 'article_protocols' },
        { name: 'ArticleVariables', table: 'article_variables' },
        { name: 'ModbusRegisters', table: 'modbus_registers' },
        { name: 'SDI12Commands', table: 'sdi12_commands' },
        { name: 'NMEASentences', table: 'nmea_sentences' },
        { name: 'Documents', table: 'documents' },
        { name: 'Images', table: 'images' },
        { name: 'Tags', table: 'tags' },
        { name: 'Accessories', table: 'accessories' }
      ];

      for (const { name, table } of relatedTables) {
        if (sheets[name] && sheets[name].length > 0) {
          for (const row of sheets[name]) {
            const fields = Object.keys(row).filter(k => !k.includes('_id') || k === 'article_id');
            const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
            const values = fields.map(k => row[k] === '' ? null : row[k]);
            
            try {
              await client.query(
                `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})
                 ON CONFLICT DO NOTHING`,
                values
              );
            } catch (error: any) {
              // Silently ignore all errors for related tables
            }
          }
        }
      }
    });

    res.json({
      success: true,
      imported,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Import error:', error);
    res.status(500).json({ 
      error: 'Error importing Excel', 
      message: error.message 
    });
  }
});

// POST import SQL
importRouter.post('/sql', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const sqlContent = req.file.buffer.toString('utf-8');

    // Parse SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^(BEGIN|COMMIT|SET session_replication_role)$/i));

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Execute each INSERT statement in its own transaction to avoid abort issues
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim().length === 0) {
        continue;
      }

      // Skip DO blocks and SELECT setval (sequences)
      if (statement.match(/^(SELECT setval|DO \$\$)/i)) {
        try {
          await transaction(async (client) => {
            await client.query(statement);
          });
          successCount++;
        } catch (err: any) {
          // Silently ignore sequence errors
        }
        continue;
      }

      // Execute INSERT statements with individual error handling
      if (statement.match(/^INSERT INTO/i)) {
        try {
          await transaction(async (client) => {
            await client.query(`SET session_replication_role = replica;`);
            await client.query(statement);
            await client.query(`SET session_replication_role = DEFAULT;`);
          });
          successCount++;
        } catch (err: any) {
          errorCount++;
          // Only log non-duplicate errors
          if (err.code !== '23505') {
            errors.push(`Statement ${i}: ${err.message.substring(0, 100)}`);
          }
        }
      }
    }

    res.json({
      success: true,
      message: 'SQL imported successfully',
      imported: successCount,
      failed: errorCount,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined // Show first 10 errors only
    });
  } catch (error: any) {
    console.error('Import error:', error);
    res.status(500).json({ 
      error: 'Error importing SQL', 
      message: error.message 
    });
  }
});

// POST import ZIP with files (complete restore)
importRouter.post('/zip', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Starting ZIP import...');

    const storagePath = process.env.STORAGE_PATH || './uploads';
    
    // Create a temporary directory for extraction
    const tempDir = path.join(os.tmpdir(), `instrumentkb-import-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    try {
      // Save uploaded file to temp location
      const tempZipPath = path.join(tempDir, 'upload.zip');
      fs.writeFileSync(tempZipPath, req.file.buffer);

      console.log(`Extracting ZIP to ${tempDir}...`);

      // Extract ZIP
      await extract(tempZipPath, { dir: tempDir });

      console.log('ZIP extracted successfully');

      // Read data.json
      const dataJsonPath = path.join(tempDir, 'data.json');
      if (!fs.existsSync(dataJsonPath)) {
        throw new Error('data.json not found in ZIP file');
      }

      const fileContent = fs.readFileSync(dataJsonPath, 'utf-8');
      const data = JSON.parse(fileContent);

      let articles = [];
      
      // Check if it's a complete export or just an array of articles
      if (Array.isArray(data)) {
        articles = data;
      } else if (data.articles && Array.isArray(data.articles)) {
        articles = data.articles;
      } else if (data.article_id) {
        // Single article
        articles = [data];
      } else {
        throw new Error('Invalid JSON format in data.json');
      }

      console.log(`Found ${articles.length} articles to import`);

      // Copy files from uploads/ folder in ZIP to actual uploads folder
      const uploadsSourceDir = path.join(tempDir, 'uploads');
      let filesCopied = 0;
      let filesSkipped = 0;

      if (fs.existsSync(uploadsSourceDir)) {
        console.log('Copying files from ZIP to uploads folder...');
        
        // Recursive function to copy directory structure
        function copyDirectory(source: string, target: string) {
          // Create target directory if it doesn't exist
          if (!fs.existsSync(target)) {
            fs.mkdirSync(target, { recursive: true });
          }

          // Read source directory
          const entries = fs.readdirSync(source, { withFileTypes: true });

          for (const entry of entries) {
            const sourcePath = path.join(source, entry.name);
            const targetPath = path.join(target, entry.name);

            if (entry.isDirectory()) {
              // Recursively copy subdirectory
              copyDirectory(sourcePath, targetPath);
            } else if (entry.isFile()) {
              try {
                // Copy file
                fs.copyFileSync(sourcePath, targetPath);
                filesCopied++;
              } catch (error) {
                console.error(`Error copying file ${entry.name}:`, error);
                filesSkipped++;
              }
            }
          }
        }

        copyDirectory(uploadsSourceDir, storagePath);
        console.log(`Files copied: ${filesCopied}, skipped: ${filesSkipped}`);
      } else {
        console.log('No uploads folder found in ZIP');
      }

      // Now import articles (same logic as JSON import)
      let imported = 0;
      let updated = 0;
      let failed = 0;
      const errors: any[] = [];

      // First, import all manufacturers and variables that are referenced
      for (const article of articles) {
        if (article.manufacturer && article.manufacturer.manufacturer_id) {
          try {
            await transaction(async (client) => {
              await client.query(
                `INSERT INTO manufacturers (manufacturer_id, name, country, website, support_email, notes)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (manufacturer_id) DO UPDATE SET
                 name = EXCLUDED.name,
                 country = EXCLUDED.country,
                 website = EXCLUDED.website,
                 support_email = EXCLUDED.support_email,
                 notes = EXCLUDED.notes`,
                [
                  article.manufacturer.manufacturer_id,
                  article.manufacturer.name,
                  toNullable(article.manufacturer.country),
                  toNullable(article.manufacturer.website),
                  toNullable(article.manufacturer.support_email),
                  toNullable(article.manufacturer.notes)
                ]
              );
            });
          } catch (error: any) {
            console.log('Manufacturer import warning:', error.message);
          }
        }

        // Import variables if they have full data
        if (article.article_variables) {
          for (const av of article.article_variables) {
            if (av.variable && av.variable.variable_id) {
              try {
                await transaction(async (client) => {
                  await client.query(
                    `INSERT INTO variables_dict (variable_id, name, unit_default, description)
                     VALUES ($1, $2, $3, $4)
                     ON CONFLICT (variable_id) DO UPDATE SET
                     name = EXCLUDED.name,
                     unit_default = EXCLUDED.unit_default,
                     description = EXCLUDED.description`,
                    [
                      av.variable.variable_id,
                      av.variable.name,
                      toNullable(av.variable.unit_default),
                      toNullable(av.variable.description)
                    ]
                  );
                });
              } catch (error: any) {
                console.log('Variable import warning:', error.message);
              }
            }
          }
        }
      }

      // Now import articles
      for (const article of articles) {
        try {
          let wasUpdate = false;
          await transaction(async (client) => {
            const existingResult = await client.query(
              'SELECT article_id FROM articles WHERE article_id = $1',
              [article.article_id]
            );
            
            wasUpdate = existingResult.rows.length > 0;
            
            await importArticle(client, article);
          });
          
          // Only count after successful import
          if (wasUpdate) {
            updated++;
          } else {
            imported++;
          }
        } catch (error: any) {
          failed++;
          console.error(`Error importing article ${article.article_id}:`, error);
          errors.push({
            article_id: article.article_id,
            error: error.message,
            stack: error.stack?.split('\n').slice(0, 3).join('\n')
          });
        }
      }

      // Cleanup temp directory
      console.log('Cleaning up temporary files...');
      fs.rmSync(tempDir, { recursive: true, force: true });

      res.json({
        success: true,
        message: 'ZIP imported successfully',
        total: articles.length,
        imported,
        updated,
        failed,
        files_copied: filesCopied,
        files_skipped: filesSkipped,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      // Cleanup temp directory on error
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('ZIP import error:', error);
    res.status(500).json({ 
      error: 'Error importing ZIP', 
      message: error.message,
      stack: error.stack 
    });
  }
});

