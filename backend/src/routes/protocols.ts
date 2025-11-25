import { Router, Request, Response } from 'express';
import { query } from '../db';

export const protocolsRouter = Router();

// Helper function to handle null values preserving 0
function toNullable(value: any): any {
  return value === undefined || value === null ? null : value;
}

// GET protocols for article
protocolsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const article_id = req.query.article_id as string;
    
    if (article_id) {
      const result = await query(
        `SELECT * FROM article_protocols WHERE article_id = $1`,
        [article_id]
      );
      res.json(result.rows);
    } else {
      const result = await query(`SELECT * FROM article_protocols`);
      res.json(result.rows);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching protocols' });
  }
});

// POST create protocol
protocolsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { article_id, type, physical_layer, port_label, default_address, baudrate, 
            databits, parity, stopbits, ip_address, ip_port, notes } = req.body;
    
    const result = await query(
      `INSERT INTO article_protocols (article_id, type, physical_layer, port_label, default_address, 
       baudrate, databits, parity, stopbits, ip_address, ip_port, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [article_id, type, toNullable(physical_layer), toNullable(port_label), toNullable(default_address),
       toNullable(baudrate), toNullable(databits), toNullable(parity), toNullable(stopbits), 
       toNullable(ip_address), toNullable(ip_port), toNullable(notes)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error creating protocol' });
  }
});

// DELETE protocol
protocolsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await query('DELETE FROM article_protocols WHERE art_proto_id = $1', [id]);
    res.json({ message: 'Protocol deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting protocol' });
  }
});
