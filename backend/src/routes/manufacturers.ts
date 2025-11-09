import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';

export const manufacturersRouter = Router();

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
    const manufacturers = await prisma.manufacturer.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(manufacturers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching manufacturers' });
  }
});

// POST create manufacturer
manufacturersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const data = manufacturerSchema.parse(req.body);
    const manufacturer = await prisma.manufacturer.create({
      data: {
        ...data,
        support_email: data.support_email || null
      }
    });
    res.status(201).json(manufacturer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error creating manufacturer' });
    }
  }
});

