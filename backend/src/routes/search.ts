import { Router, Request, Response } from 'express';
import { query } from '../db';

export const searchRouter = Router();

// GET search instruments/articles
searchRouter.get('/instruments', async (req: Request, res: Response) => {
  try {
    const {
      q,
      article_id,
      manufacturer_id,
      variable_name,
      accuracy_abs_lte,
      protocol_type,
      modbus_address,
      tags,
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Construir filtros
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    // Text search
    if (q) {
      whereConditions.push(`(
        a.model ILIKE $${paramIndex} OR 
        a.variant ILIKE $${paramIndex} OR 
        a.category ILIKE $${paramIndex} OR 
        a.sap_description ILIKE $${paramIndex}
      )`);
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (article_id) {
      whereConditions.push(`a.article_id = $${paramIndex}`);
      params.push(article_id);
      paramIndex++;
    }

    if (manufacturer_id) {
      whereConditions.push(`a.manufacturer_id = $${paramIndex}`);
      params.push(parseInt(manufacturer_id as string));
      paramIndex++;
    }

    // Variable name search (requires subquery)
    if (variable_name) {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM article_variables av
        JOIN variables_dict v ON av.variable_id = v.variable_id
        WHERE av.article_id = a.article_id 
        AND v.name ILIKE $${paramIndex}
      )`);
      params.push(`%${variable_name}%`);
      paramIndex++;
    }

    // Accuracy filter
    if (accuracy_abs_lte) {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM article_variables av
        WHERE av.article_id = a.article_id 
        AND av.accuracy_abs <= $${paramIndex}
      )`);
      params.push(parseFloat(accuracy_abs_lte as string));
      paramIndex++;
    }

    // Protocol type filter
    if (protocol_type) {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM article_protocols ap
        WHERE ap.article_id = a.article_id 
        AND ap.type = $${paramIndex}
      )`);
      params.push(protocol_type);
      paramIndex++;
    }

    // Modbus address filter
    if (modbus_address) {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM modbus_registers mr
        WHERE mr.article_id = a.article_id 
        AND mr.address = $${paramIndex}
      )`);
      params.push(parseInt(modbus_address as string));
      paramIndex++;
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      whereConditions.push(`EXISTS (
        SELECT 1 FROM tags t
        WHERE t.article_id = a.article_id 
        AND t.tag = ANY($${paramIndex})
      )`);
      params.push(tagArray);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Execute search
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

    // Get relations for each article
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
      instruments: articlesResult.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Error searching instruments' });
  }
});
