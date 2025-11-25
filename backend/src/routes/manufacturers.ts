import { Router, Request, Response } from 'express';
import { query } from '../db';
import { z } from 'zod';

export const manufacturersRouter = Router();

// Helper function to handle null values preserving 0
function toNullable(value: any): any {
  return value === undefined || value === null ? null : value;
}

const manufacturerSchema = z.object({
  name: z.string().min(1),
  country: z.string().optional(),
  website: z.string().optional(),
  support_email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional()
});

// GET all manufacturers
manufacturersRouter.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT * FROM manufacturers ORDER BY name ASC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching manufacturers' });
  }
});

// POST create manufacturer
manufacturersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const data = manufacturerSchema.parse(req.body);
    const result = await query(
      `INSERT INTO manufacturers (name, country, website, support_email, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.name, toNullable(data.country), toNullable(data.website), toNullable(data.support_email), toNullable(data.notes)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error creating manufacturer' });
    }
  }
});
