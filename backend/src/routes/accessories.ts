import { Router, Request, Response } from 'express';
import { query } from '../db';

export const accessoriesRouter = Router();

// Helper function to handle null values preserving 0
function toNullable(value: any): any {
  return value === undefined || value === null ? null : value;
}

// GET accessories for article
accessoriesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const article_id = req.query.article_id as string;
    
    if (article_id) {
      const result = await query(
        `SELECT * FROM accessories WHERE article_id = $1 ORDER BY name`,
        [article_id]
      );
      res.json(result.rows);
    } else {
      const result = await query(`SELECT * FROM accessories ORDER BY article_id, name`);
      res.json(result.rows);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching accessories' });
  }
});

// POST create accessory
accessoriesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { article_id, name, part_number, description, quantity, notes } = req.body;
    
    const result = await query(
      `INSERT INTO accessories (article_id, name, part_number, description, quantity, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [article_id, name, toNullable(part_number), toNullable(description), 
       toNullable(quantity), toNullable(notes)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error creating accessory' });
  }
});

// PUT update accessory
accessoriesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, part_number, description, quantity, notes } = req.body;
    
    const result = await query(
      `UPDATE accessories 
       SET name = $1, part_number = $2, description = $3, quantity = $4, notes = $5
       WHERE accessory_id = $6
       RETURNING *`,
      [name, toNullable(part_number), toNullable(description), toNullable(quantity), toNullable(notes), id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Accessory not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating accessory' });
  }
});

// DELETE accessory
accessoriesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await query('DELETE FROM accessories WHERE accessory_id = $1', [id]);
    res.json({ message: 'Accessory deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting accessory' });
  }
});


