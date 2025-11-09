import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const digitalIORouter = Router();

// POST create digital I/O
digitalIORouter.post('/', async (req: Request, res: Response) => {
  try {
    const digitalIO = await prisma.digitalIO.create({
      data: req.body
    });
    res.status(201).json(digitalIO);
  } catch (error) {
    res.status(500).json({ error: 'Error creating digital I/O' });
  }
});

// DELETE digital I/O
digitalIORouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.digitalIO.delete({
      where: { dio_id: id }
    });
    res.json({ message: 'Digital I/O deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting digital I/O' });
  }
});

