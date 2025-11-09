import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const analogOutputsRouter = Router();

// POST create analog output
analogOutputsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const analogOutput = await prisma.analogOutput.create({
      data: req.body
    });
    res.status(201).json(analogOutput);
  } catch (error) {
    res.status(500).json({ error: 'Error creating analog output' });
  }
});

// DELETE analog output
analogOutputsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.analogOutput.delete({
      where: { analog_out_id: id }
    });
    res.json({ message: 'Analog output deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting analog output' });
  }
});

