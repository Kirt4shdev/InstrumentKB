import { Router, Request, Response } from 'express';
import { query } from '../db';

export const modbusRegistersRouter = Router();

// Helper function to handle null values preserving 0
function toNullable(value: any): any {
  return value === undefined || value === null ? null : value;
}

// GET modbus registers for article
modbusRegistersRouter.get('/', async (req: Request, res: Response) => {
  try {
    const article_id = req.query.article_id as string;
    
    if (article_id) {
      const result = await query(
        `SELECT * FROM modbus_registers WHERE article_id = $1 ORDER BY address ASC`,
        [article_id]
      );
      res.json(result.rows);
    } else {
      const result = await query(`SELECT * FROM modbus_registers ORDER BY article_id, address ASC`);
      res.json(result.rows);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching modbus registers' });
  }
});

// POST create modbus register
modbusRegistersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { article_id, function_code, address, name, description, datatype, 
            scale, unit, rw, min, max, default_value, notes, reference_document_id } = req.body;
    
    const result = await query(
      `INSERT INTO modbus_registers (article_id, function_code, address, name, description, 
       datatype, scale, unit, rw, min, max, default_value, notes, reference_document_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [article_id, function_code, address, name, toNullable(description), toNullable(datatype),
       toNullable(scale), toNullable(unit), rw, toNullable(min), toNullable(max), toNullable(default_value),
       toNullable(notes), toNullable(reference_document_id)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Duplicate modbus register (article_id, function_code, address)' });
    } else {
      res.status(500).json({ error: 'Error creating modbus register' });
    }
  }
});

// DELETE modbus register
modbusRegistersRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await query('DELETE FROM modbus_registers WHERE modbus_id = $1', [id]);
    res.json({ message: 'Modbus register deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting modbus register' });
  }
});
