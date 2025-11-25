import { Router, Request, Response } from 'express';
import { query } from '../db';

export const analogOutputsRouter = Router();

// Helper function to handle null values preserving 0
function toNullable(value: any): any {
  return value === undefined || value === null ? null : value;
}

// GET analog outputs for article
analogOutputsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const article_id = req.query.article_id as string;
    
    if (article_id) {
      const result = await query(
        `SELECT * FROM analog_outputs WHERE article_id = $1`,
        [article_id]
      );
      res.json(result.rows);
    } else {
      const result = await query(`SELECT * FROM analog_outputs`);
      res.json(result.rows);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching analog outputs' });
  }
});

// POST create analog output
analogOutputsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { article_id, type, num_channels, range_min, range_max, unit, 
            load_min_ohm, load_max_ohm, accuracy, scaling_notes } = req.body;
    
    const result = await query(
      `INSERT INTO analog_outputs (article_id, type, num_channels, range_min, range_max, unit, 
       load_min_ohm, load_max_ohm, accuracy, scaling_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [article_id, type, toNullable(num_channels), toNullable(range_min), toNullable(range_max),
       toNullable(unit), toNullable(load_min_ohm), toNullable(load_max_ohm), toNullable(accuracy), 
       toNullable(scaling_notes)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error creating analog output' });
  }
});

// DELETE analog output
analogOutputsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await query('DELETE FROM analog_outputs WHERE analog_out_id = $1', [id]);
    res.json({ message: 'Analog output deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting analog output' });
  }
});
