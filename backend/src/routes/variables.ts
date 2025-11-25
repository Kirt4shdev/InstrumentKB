import { Router, Request, Response } from 'express';
import { query } from '../db';

export const variablesRouter = Router();

// Helper function to handle null values preserving 0
function toNullable(value: any): any {
  return value === undefined || value === null ? null : value;
}

// GET all variables
variablesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT * FROM variables_dict ORDER BY name ASC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching variables' });
  }
});

// POST create variable
variablesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, unit_default, description } = req.body;
    const result = await query(
      `INSERT INTO variables_dict (name, unit_default, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, toNullable(unit_default), toNullable(description)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error creating variable' });
  }
});

// POST link variable to article (deprecated - se maneja en articles)
variablesRouter.post('/instrument-variables', async (req: Request, res: Response) => {
  try {
    const { article_id, variable_id, range_min, range_max, unit, accuracy_abs, resolution, update_rate_hz, notes } = req.body;
    
    const result = await query(
      `INSERT INTO article_variables (article_id, variable_id, range_min, range_max, unit, accuracy_abs, resolution, update_rate_hz, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [article_id, variable_id, toNullable(range_min), toNullable(range_max), toNullable(unit), 
       toNullable(accuracy_abs), toNullable(resolution), toNullable(update_rate_hz), toNullable(notes)]
    );
    
    // Get full data with joins
    const fullResult = await query(
      `SELECT av.*, 
        row_to_json(v.*) as variable,
        row_to_json(a.*) as article
       FROM article_variables av
       LEFT JOIN variables_dict v ON av.variable_id = v.variable_id
       LEFT JOIN articles a ON av.article_id = a.article_id
       WHERE av.art_var_id = $1`,
      [result.rows[0].art_var_id]
    );
    
    res.status(201).json(fullResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error linking variable to article' });
  }
});

// DELETE article variable
variablesRouter.delete('/instrument-variables/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await query('DELETE FROM article_variables WHERE art_var_id = $1', [id]);
    res.json({ message: 'Variable unlinked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error unlinking variable' });
  }
});
