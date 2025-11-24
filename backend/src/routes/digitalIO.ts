import { Router, Request, Response } from 'express';
import { query } from '../db';

export const digitalIORouter = Router();

// GET digital I/O for article
digitalIORouter.get('/', async (req: Request, res: Response) => {
  try {
    const article_id = req.query.article_id as string;
    
    if (article_id) {
      const result = await query(
        `SELECT * FROM digital_io WHERE article_id = $1`,
        [article_id]
      );
      res.json(result.rows);
    } else {
      const result = await query(`SELECT * FROM digital_io`);
      res.json(result.rows);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching digital I/O' });
  }
});

// POST create digital I/O
digitalIORouter.post('/', async (req: Request, res: Response) => {
  try {
    const { article_id, direction, signal_type, voltage_level, current_max_ma, 
            frequency_max_hz, notes } = req.body;
    
    const result = await query(
      `INSERT INTO digital_io (article_id, direction, signal_type, voltage_level, 
       current_max_ma, frequency_max_hz, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [article_id, direction, signal_type, voltage_level || null, 
       current_max_ma || null, frequency_max_hz || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error creating digital I/O' });
  }
});

// DELETE digital I/O
digitalIORouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await query('DELETE FROM digital_io WHERE dio_id = $1', [id]);
    res.json({ message: 'Digital I/O deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting digital I/O' });
  }
});
