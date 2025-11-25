import { Router, Request, Response } from 'express';
import { query, transaction } from '../db';
import fs from 'fs';
import path from 'path';

export const articlesRouter = Router();

// Helper function to handle null values preserving 0
function toNullable(value: any): any {
  // Preserve 0, false, and empty strings but convert undefined/null to null
  return value === undefined || value === null ? null : value;
}

// Helper function to generate article_id
function generateArticleId(article_type: string): string {
  const prefixes: { [key: string]: string } = {
    'INSTRUMENTO': 'INS',
    'CABLE': 'CAB',
    'SOPORTE': 'SOP',
    'APARAMENTA_AC': 'AAC',
    'APARAMENTA_DC': 'ADC',
    'SENSOR': 'SEN',
    'ACTUADOR': 'ACT',
    'DATALOGGER': 'LOG',
    'FUENTE_ALIMENTACION': 'PSU',
    'MODULO_IO': 'MIO',
    'GATEWAY': 'GTW',
    'CAJA_CONEXIONES': 'BOX',
    'RACK': 'RCK',
    'PANEL': 'PNL',
    'PROTECCION': 'PRT',
    'CONECTOR': 'CON',
    'HERRAMIENTA': 'TLS',
    'CONSUMIBLE': 'CSM',
    'REPUESTO': 'REP',
    'SOFTWARE': 'SFT',
    'LICENCIA': 'LIC',
    'OTROS': 'OTH'
  };
  
  const prefix = prefixes[article_type] || 'ART';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${prefix}-${timestamp}-${random}`;
}

// POST create article
articlesRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Generar article_id automáticamente si no se proporciona
    if (!req.body.article_id) {
      req.body.article_id = generateArticleId(req.body.article_type);
    }
    
    // Extraer relaciones anidadas
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
      ...articleData
    } = req.body;
    
    // Crear el artículo con transacción
    const article = await transaction(async (client) => {
      // Insert article
      const articleResult = await client.query(
        `INSERT INTO articles (
          article_id, sap_itemcode, sap_description, article_type, category, family, subfamily,
          manufacturer_id, model, variant, power_supply_min_v, power_supply_max_v, 
          power_consumption_typ_w, current_max_a, voltage_rating_v, ip_rating, dimensions_mm, 
          weight_g, length_m, diameter_mm, material, color, oper_temp_min_c, oper_temp_max_c, 
          storage_temp_min_c, storage_temp_max_c, oper_humidity_min_pct, oper_humidity_max_pct, 
          altitude_max_m, has_heating, heating_consumption_w, heating_temp_min_c, heating_temp_max_c,
          emc_compliance, certifications, first_release_year, last_revision_year, 
          discontinued, replacement_article_id, internal_notes, active, stock_location, min_stock, 
          current_stock, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, NOW(), NOW()
        ) RETURNING *`,
        [
          articleData.article_id, toNullable(articleData.sap_itemcode), articleData.sap_description,
          articleData.article_type, toNullable(articleData.category), toNullable(articleData.family), 
          toNullable(articleData.subfamily), toNullable(articleData.manufacturer_id), toNullable(articleData.model), 
          toNullable(articleData.variant), toNullable(articleData.power_supply_min_v), toNullable(articleData.power_supply_max_v),
          toNullable(articleData.power_consumption_typ_w), toNullable(articleData.current_max_a), 
          toNullable(articleData.voltage_rating_v), toNullable(articleData.ip_rating), toNullable(articleData.dimensions_mm),
          toNullable(articleData.weight_g), toNullable(articleData.length_m), toNullable(articleData.diameter_mm),
          toNullable(articleData.material), toNullable(articleData.color), toNullable(articleData.oper_temp_min_c),
          toNullable(articleData.oper_temp_max_c), toNullable(articleData.storage_temp_min_c), 
          toNullable(articleData.storage_temp_max_c), toNullable(articleData.oper_humidity_min_pct),
          toNullable(articleData.oper_humidity_max_pct), toNullable(articleData.altitude_max_m),
          articleData.has_heating || false, toNullable(articleData.heating_consumption_w),
          toNullable(articleData.heating_temp_min_c), toNullable(articleData.heating_temp_max_c),
          toNullable(articleData.emc_compliance), toNullable(articleData.certifications), 
          toNullable(articleData.first_release_year), toNullable(articleData.last_revision_year),
          articleData.discontinued || false, toNullable(articleData.replacement_article_id),
          toNullable(articleData.internal_notes), articleData.active !== false, toNullable(articleData.stock_location),
          toNullable(articleData.min_stock), toNullable(articleData.current_stock)
        ]
      );
      
      const article_id = articleResult.rows[0].article_id;
      
      // Insert article_variables
      if (article_variables?.length > 0) {
        for (const v of article_variables) {
          await client.query(
            `INSERT INTO article_variables (article_id, variable_id, range_min, range_max, unit, accuracy_abs, resolution, update_rate_hz, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [article_id, v.variable_id, toNullable(v.range_min), toNullable(v.range_max), toNullable(v.unit), 
             toNullable(v.accuracy_abs), toNullable(v.resolution), toNullable(v.update_rate_hz), toNullable(v.notes)]
          );
        }
      }
      
      // Insert article_protocols
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
      
      // Insert analog_outputs
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
      
      // Insert digital_io
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
      
      // Insert modbus_registers
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
      
      // Insert sdi12_commands
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
      
      // Insert nmea_sentences
      if (nmea_sentences?.length > 0) {
        for (const n of nmea_sentences) {
          await client.query(
            `INSERT INTO nmea_sentences (article_id, sentence, description, fields, reference_document_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [article_id, n.sentence, toNullable(n.description), toNullable(n.fields), toNullable(n.reference_document_id)]
          );
        }
      }
      
      // Insert documents
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
      
      // Insert images
      if (images?.length > 0) {
        for (const i of images) {
          await client.query(
            `INSERT INTO images (article_id, caption, url_or_path, credit, license, notes)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [article_id, toNullable(i.caption), i.url_or_path, toNullable(i.credit), toNullable(i.license), toNullable(i.notes)]
          );
        }
      }
      
      // Insert tags
      if (tags?.length > 0) {
        for (const t of tags) {
          await client.query(
            `INSERT INTO tags (article_id, tag) VALUES ($1, $2)`,
            [article_id, typeof t === 'string' ? t : t.tag]
          );
        }
      }
      
      // Insert accessories
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
      
      return articleResult.rows[0];
    });
    
    // Fetch full article with relations
    const fullArticle = await getArticleById(article.article_id);
    res.status(201).json(fullArticle);
  } catch (error: any) {
    console.error('Error creating article:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ 
        error: 'El código SAP o ID del artículo ya existe'
      });
    }
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({ 
        error: 'Referencia inválida: el fabricante o variable especificada no existe'
      });
    }
    res.status(500).json({ 
      error: 'Error al crear el artículo', 
      details: error.message
    });
  }
});

// Helper function to get article by ID with all relations
async function getArticleById(article_id: string) {
  const articleResult = await query(
    `SELECT a.*, 
      row_to_json(m.*) as manufacturer
     FROM articles a
     LEFT JOIN manufacturers m ON a.manufacturer_id = m.manufacturer_id
     WHERE a.article_id = $1`,
    [article_id]
  );
  
  if (articleResult.rows.length === 0) return null;
  
  const article = articleResult.rows[0];
  
  // Get article_variables with variable details
  const variablesResult = await query(
    `SELECT av.*, row_to_json(v.*) as variable
     FROM article_variables av
     LEFT JOIN variables_dict v ON av.variable_id = v.variable_id
     WHERE av.article_id = $1`,
    [article_id]
  );
  article.article_variables = variablesResult.rows;
  
  // Get article_protocols
  const protocolsResult = await query(
    `SELECT * FROM article_protocols WHERE article_id = $1`,
    [article_id]
  );
  article.article_protocols = protocolsResult.rows;
  
  // Get analog_outputs
  const analogOutputsResult = await query(
    `SELECT * FROM analog_outputs WHERE article_id = $1`,
    [article_id]
  );
  article.analog_outputs = analogOutputsResult.rows;
  
  // Get digital_io
  const digitalIOResult = await query(
    `SELECT * FROM digital_io WHERE article_id = $1`,
    [article_id]
  );
  article.digital_io = digitalIOResult.rows;
  
  // Get modbus_registers
  const modbusResult = await query(
    `SELECT * FROM modbus_registers WHERE article_id = $1`,
    [article_id]
  );
  article.modbus_registers = modbusResult.rows;
  
  // Get sdi12_commands
  const sdi12Result = await query(
    `SELECT * FROM sdi12_commands WHERE article_id = $1`,
    [article_id]
  );
  article.sdi12_commands = sdi12Result.rows;
  
  // Get nmea_sentences
  const nmeaResult = await query(
    `SELECT * FROM nmea_sentences WHERE article_id = $1`,
    [article_id]
  );
  article.nmea_sentences = nmeaResult.rows;
  
  // Get documents
  const documentsResult = await query(
    `SELECT * FROM documents WHERE article_id = $1`,
    [article_id]
  );
  article.documents = documentsResult.rows;
  
  // Get images
  const imagesResult = await query(
    `SELECT * FROM images WHERE article_id = $1`,
    [article_id]
  );
  article.images = imagesResult.rows;
  
  // Get tags
  const tagsResult = await query(
    `SELECT * FROM tags WHERE article_id = $1`,
    [article_id]
  );
  article.tags = tagsResult.rows;
  
  // Get accessories
  const accessoriesResult = await query(
    `SELECT * FROM accessories WHERE article_id = $1 ORDER BY name`,
    [article_id]
  );
  article.accessories = accessoriesResult.rows;
  
  // Get provenance
  const provenanceResult = await query(
    `SELECT * FROM provenance WHERE article_id = $1`,
    [article_id]
  );
  article.provenance = provenanceResult.rows;
  
  // Get replacement info
  const replacementResult = await query(
    `SELECT * FROM articles WHERE article_id = $1`,
    [article.replacement_article_id]
  );
  article.replacement_for = replacementResult.rows.length > 0 ? replacementResult.rows[0] : null;
  
  const replacedByResult = await query(
    `SELECT * FROM articles WHERE replacement_article_id = $1`,
    [article_id]
  );
  article.replaced_by = replacedByResult.rows;
  
  return article;
}

// GET all articles con paginación y filtros
articlesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { active, family, article_type, category, q, page = '1', limit = '50' } = req.query;
    
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (active !== undefined) {
      whereConditions.push(`a.active = $${paramIndex++}`);
      params.push(active === 'true');
    }
    if (family) {
      whereConditions.push(`a.family = $${paramIndex++}`);
      params.push(family);
    }
    if (article_type) {
      whereConditions.push(`a.article_type = $${paramIndex++}`);
      params.push(article_type);
    }
    if (category) {
      whereConditions.push(`a.category ILIKE $${paramIndex++}`);
      params.push(`%${category}%`);
    }
    if (q) {
      whereConditions.push(`(
        a.article_id ILIKE $${paramIndex} OR 
        a.sap_itemcode ILIKE $${paramIndex} OR 
        a.sap_description ILIKE $${paramIndex} OR 
        a.model ILIKE $${paramIndex} OR 
        a.category ILIKE $${paramIndex}
      )`);
      params.push(`%${q}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Get articles
    const articlesResult = await query(
      `SELECT a.*, 
        row_to_json(m.*) as manufacturer
       FROM articles a
       LEFT JOIN manufacturers m ON a.manufacturer_id = m.manufacturer_id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limitNum, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM articles a ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // For each article, get its relations
    for (const article of articlesResult.rows) {
      const variablesResult = await query(
        `SELECT av.*, row_to_json(v.*) as variable
         FROM article_variables av
         LEFT JOIN variables_dict v ON av.variable_id = v.variable_id
         WHERE av.article_id = $1`,
        [article.article_id]
      );
      article.article_variables = variablesResult.rows;
      
      const protocolsResult = await query(
        `SELECT * FROM article_protocols WHERE article_id = $1`,
        [article.article_id]
      );
      article.article_protocols = protocolsResult.rows;
      
      const tagsResult = await query(
        `SELECT * FROM tags WHERE article_id = $1`,
        [article.article_id]
      );
      article.tags = tagsResult.rows;
    }

    res.json({
      articles: articlesResult.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Error fetching articles' });
  }
});

// GET single article by ID
articlesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const article = await getArticleById(id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Error fetching article' });
  }
});

// PUT update article
articlesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      article_variables, 
      article_protocols, 
      tags,
      documents,
      images,
      analog_outputs,
      digital_io,
      modbus_registers,
      sdi12_commands,
      nmea_sentences,
      accessories,
      ...articleData 
    } = req.body;

    await transaction(async (client) => {
      // Update article basic fields
      const fields = Object.keys(articleData).filter(key => key !== 'article_id');
      if (fields.length > 0) {
        const setClause = fields.map((key, idx) => `${key} = $${idx + 2}`).join(', ');
        const values = fields.map(key => articleData[key]);
        
        await client.query(
          `UPDATE articles SET ${setClause}, updated_at = NOW() WHERE article_id = $1`,
          [id, ...values]
        );
      }

      // Update article_variables
      if (article_variables !== undefined) {
        await client.query('DELETE FROM article_variables WHERE article_id = $1', [id]);
        if (article_variables.length > 0) {
          for (const v of article_variables) {
            await client.query(
              `INSERT INTO article_variables (article_id, variable_id, range_min, range_max, unit, 
               accuracy_abs, resolution, update_rate_hz, notes)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [id, v.variable_id, toNullable(v.range_min), toNullable(v.range_max), toNullable(v.unit),
               toNullable(v.accuracy_abs), toNullable(v.resolution), toNullable(v.update_rate_hz), toNullable(v.notes)]
            );
          }
        }
      }

      // Update article_protocols
      if (article_protocols !== undefined) {
        await client.query('DELETE FROM article_protocols WHERE article_id = $1', [id]);
        if (article_protocols.length > 0) {
          for (const p of article_protocols) {
            await client.query(
              `INSERT INTO article_protocols (article_id, type, physical_layer, port_label, 
               default_address, baudrate, databits, parity, stopbits, ip_address, ip_port, notes)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
              [id, p.type, toNullable(p.physical_layer), toNullable(p.port_label), toNullable(p.default_address),
               toNullable(p.baudrate), toNullable(p.databits), toNullable(p.parity), toNullable(p.stopbits),
               toNullable(p.ip_address), toNullable(p.ip_port), toNullable(p.notes)]
            );
          }
        }
      }

      // Update tags
      if (tags !== undefined) {
        await client.query('DELETE FROM tags WHERE article_id = $1', [id]);
        if (tags.length > 0) {
          for (const t of tags) {
            await client.query(
              `INSERT INTO tags (article_id, tag) VALUES ($1, $2)`,
              [id, typeof t === 'string' ? t : t.tag]
            );
          }
        }
      }

      // Update documents
      if (documents !== undefined) {
        // Obtener los documentos existentes antes de borrarlos
        const existingDocs = await client.query('SELECT * FROM documents WHERE article_id = $1', [id]);
        
        // Borrar de la BD
        await client.query('DELETE FROM documents WHERE article_id = $1', [id]);
        
        // Borrar archivos físicos de los documentos que ya no están en la lista nueva
        const newPaths = documents.map(d => d.url_or_path);
        for (const oldDoc of existingDocs.rows) {
          if (!newPaths.includes(oldDoc.url_or_path) && !oldDoc.url_or_path.startsWith('http')) {
            const filePath = path.join(process.env.STORAGE_PATH || './uploads', oldDoc.url_or_path);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`Deleted orphaned document file: ${filePath}`);
            }
          }
        }
        
        if (documents.length > 0) {
          for (const d of documents) {
            await client.query(
              `INSERT INTO documents (article_id, type, title, language, revision, publish_date, 
               url_or_path, sha256, notes)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [id, d.type, d.title, toNullable(d.language), toNullable(d.revision), toNullable(d.publish_date),
               d.url_or_path, toNullable(d.sha256), toNullable(d.notes)]
            );
          }
        }
      }

      // Update images
      if (images !== undefined) {
        // Obtener las imágenes existentes antes de borrarlas
        const existingImgs = await client.query('SELECT * FROM images WHERE article_id = $1', [id]);
        
        // Borrar de la BD
        await client.query('DELETE FROM images WHERE article_id = $1', [id]);
        
        // Borrar archivos físicos de las imágenes que ya no están en la lista nueva
        const newPaths = images.map(i => i.url_or_path);
        for (const oldImg of existingImgs.rows) {
          if (!newPaths.includes(oldImg.url_or_path) && !oldImg.url_or_path.startsWith('http')) {
            const filePath = path.join(process.env.STORAGE_PATH || './uploads', oldImg.url_or_path);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`Deleted orphaned image file: ${filePath}`);
            }
          }
        }
        
        if (images.length > 0) {
          for (const i of images) {
            await client.query(
              `INSERT INTO images (article_id, caption, url_or_path, credit, license, notes)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [id, toNullable(i.caption), i.url_or_path, toNullable(i.credit), toNullable(i.license), toNullable(i.notes)]
            );
          }
        }
      }

      // Update analog_outputs
      if (analog_outputs !== undefined) {
        await client.query('DELETE FROM analog_outputs WHERE article_id = $1', [id]);
        if (analog_outputs.length > 0) {
          for (const ao of analog_outputs) {
            await client.query(
              `INSERT INTO analog_outputs (article_id, type, num_channels, range_min, range_max, 
               unit, load_min_ohm, load_max_ohm, accuracy, scaling_notes)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
              [id, ao.type, toNullable(ao.num_channels), toNullable(ao.range_min), toNullable(ao.range_max),
               toNullable(ao.unit), toNullable(ao.load_min_ohm), toNullable(ao.load_max_ohm), toNullable(ao.accuracy),
               toNullable(ao.scaling_notes)]
            );
          }
        }
      }

      // Update digital_io
      if (digital_io !== undefined) {
        await client.query('DELETE FROM digital_io WHERE article_id = $1', [id]);
        if (digital_io.length > 0) {
          for (const dio of digital_io) {
            await client.query(
              `INSERT INTO digital_io (article_id, direction, signal_type, voltage_level, 
               current_max_ma, frequency_max_hz, notes)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [id, dio.direction, dio.signal_type, toNullable(dio.voltage_level),
               toNullable(dio.current_max_ma), toNullable(dio.frequency_max_hz), toNullable(dio.notes)]
            );
          }
        }
      }

      // Update modbus_registers
      if (modbus_registers !== undefined) {
        await client.query('DELETE FROM modbus_registers WHERE article_id = $1', [id]);
        if (modbus_registers.length > 0) {
          for (const m of modbus_registers) {
            await client.query(
              `INSERT INTO modbus_registers (article_id, function_code, address, name, description, 
               datatype, scale, unit, rw, min, max, default_value, notes, reference_document_id)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
              [id, m.function_code, m.address, m.name, toNullable(m.description), toNullable(m.datatype),
               toNullable(m.scale), toNullable(m.unit), m.rw, toNullable(m.min), toNullable(m.max),
               toNullable(m.default_value), toNullable(m.notes), toNullable(m.reference_document_id)]
            );
          }
        }
      }

      // Update sdi12_commands
      if (sdi12_commands !== undefined) {
        await client.query('DELETE FROM sdi12_commands WHERE article_id = $1', [id]);
        if (sdi12_commands.length > 0) {
          for (const s of sdi12_commands) {
            await client.query(
              `INSERT INTO sdi12_commands (article_id, command, description, response_format, 
               reference_document_id)
               VALUES ($1, $2, $3, $4, $5)`,
              [id, s.command, toNullable(s.description), toNullable(s.response_format),
               toNullable(s.reference_document_id)]
            );
          }
        }
      }

      // Update nmea_sentences
      if (nmea_sentences !== undefined) {
        await client.query('DELETE FROM nmea_sentences WHERE article_id = $1', [id]);
        if (nmea_sentences.length > 0) {
          for (const n of nmea_sentences) {
            await client.query(
              `INSERT INTO nmea_sentences (article_id, sentence, description, fields, 
               reference_document_id)
               VALUES ($1, $2, $3, $4, $5)`,
              [id, n.sentence, toNullable(n.description), toNullable(n.fields), toNullable(n.reference_document_id)]
            );
          }
        }
      }

      // Update accessories
      if (accessories !== undefined) {
        await client.query('DELETE FROM accessories WHERE article_id = $1', [id]);
        if (accessories.length > 0) {
          for (const acc of accessories) {
            await client.query(
              `INSERT INTO accessories (article_id, name, part_number, description, quantity, notes)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [id, acc.name, toNullable(acc.part_number), toNullable(acc.description),
               toNullable(acc.quantity), toNullable(acc.notes)]
            );
          }
        }
      }
    });

    // Get updated article with all relations
    const updatedArticle = await getArticleById(id);
    res.json(updatedArticle);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'SAP ItemCode already exists' });
    }
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Error updating article', details: error.message });
  }
});

// DELETE article
articlesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Obtener documentos e imágenes antes de borrar el artículo
    const docsResult = await query('SELECT * FROM documents WHERE article_id = $1', [id]);
    const imgsResult = await query('SELECT * FROM images WHERE article_id = $1', [id]);
    
    // Borrar el artículo (cascade eliminará las relaciones en BD)
    await query('DELETE FROM articles WHERE article_id = $1', [id]);
    
    // Borrar archivos físicos de documentos
    const storagePath = process.env.STORAGE_PATH || './uploads';
    for (const doc of docsResult.rows) {
      if (!doc.url_or_path.startsWith('http')) {
        const filePath = path.join(storagePath, doc.url_or_path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted document file: ${filePath}`);
        }
      }
    }
    
    // Borrar archivos físicos de imágenes
    for (const img of imgsResult.rows) {
      if (!img.url_or_path.startsWith('http')) {
        const filePath = path.join(storagePath, img.url_or_path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted image file: ${filePath}`);
        }
      }
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Error deleting article' });
  }
});

// GET unique families
articlesRouter.get('/meta/families', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT DISTINCT family FROM articles 
       WHERE family IS NOT NULL AND family != '' 
       ORDER BY family ASC`
    );
    res.json(result.rows.map(r => r.family));
  } catch (error) {
    console.error('Error fetching article families:', error);
    res.status(500).json({ error: 'Error fetching article families' });
  }
});

// GET unique subfamilies by family
articlesRouter.get('/meta/subfamilies', async (req: Request, res: Response) => {
  try {
    const { family } = req.query;
    let sql = `SELECT DISTINCT subfamily FROM articles 
               WHERE subfamily IS NOT NULL AND subfamily != ''`;
    const params: any[] = [];
    
    if (family) {
      sql += ` AND family = $1`;
      params.push(family);
    }
    
    sql += ` ORDER BY subfamily ASC`;
    
    const result = await query(sql, params);
    res.json(result.rows.map(r => r.subfamily));
  } catch (error) {
    console.error('Error fetching article subfamilies:', error);
    res.status(500).json({ error: 'Error fetching article subfamilies' });
  }
});

// GET article types disponibles
articlesRouter.get('/meta/types', async (req: Request, res: Response) => {
  try {
    const types = [
      { value: 'INSTRUMENTO', label: 'Instrumento' },
      { value: 'CABLE', label: 'Cable' },
      { value: 'SOPORTE', label: 'Soporte' },
      { value: 'APARAMENTA_AC', label: 'Aparamenta AC' },
      { value: 'APARAMENTA_DC', label: 'Aparamenta DC' },
      { value: 'SENSOR', label: 'Sensor' },
      { value: 'ACTUADOR', label: 'Actuador' },
      { value: 'DATALOGGER', label: 'Datalogger' },
      { value: 'FUENTE_ALIMENTACION', label: 'Fuente de Alimentación' },
      { value: 'MODULO_IO', label: 'Módulo I/O' },
      { value: 'GATEWAY', label: 'Gateway' },
      { value: 'CAJA_CONEXIONES', label: 'Caja de Conexiones' },
      { value: 'RACK', label: 'Rack' },
      { value: 'PANEL', label: 'Panel' },
      { value: 'PROTECCION', label: 'Protección' },
      { value: 'CONECTOR', label: 'Conector' },
      { value: 'HERRAMIENTA', label: 'Herramienta' },
      { value: 'CONSUMIBLE', label: 'Consumible' },
      { value: 'REPUESTO', label: 'Repuesto' },
      { value: 'SOFTWARE', label: 'Software' },
      { value: 'LICENCIA', label: 'Licencia' },
      { value: 'OTROS', label: 'Otros' },
    ];
    res.json(types);
  } catch (error) {
    console.error('Error fetching article types:', error);
    res.status(500).json({ error: 'Error fetching article types' });
  }
});

// GET unique categories (valores reales en la BD)
articlesRouter.get('/meta/categories', async (req: Request, res: Response) => {
  try {
    const { article_type } = req.query;
    let sql = `SELECT DISTINCT category FROM articles 
               WHERE category IS NOT NULL AND category != ''`;
    const params: any[] = [];
    
    if (article_type) {
      sql += ` AND article_type = $1`;
      params.push(article_type);
    }
    
    sql += ` ORDER BY category ASC`;
    
    const result = await query(sql, params);
    res.json(result.rows.map(r => r.category));
  } catch (error) {
    console.error('Error fetching article categories:', error);
    res.status(500).json({ error: 'Error fetching article categories' });
  }
});

// GET search articles (simplificado para autocomplete)
articlesRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, limit = '10' } = req.query;
    
    if (!q) {
      return res.json([]);
    }

    const result = await query(
      `SELECT article_id, sap_itemcode, sap_description, article_type, category
       FROM articles
       WHERE (
         article_id ILIKE $1 OR 
         sap_itemcode ILIKE $1 OR 
         sap_description ILIKE $1
       ) AND active = true
       ORDER BY article_id ASC
       LIMIT $2`,
      [`%${q}%`, parseInt(limit as string)]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).json({ error: 'Error searching articles' });
  }
});
