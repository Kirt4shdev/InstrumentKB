import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const sdi12CommandsRouter = Router();

// POST create SDI-12 command
sdi12CommandsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const sdi12Command = await prisma.sDI12Command.create({
      data: req.body
    });
    res.status(201).json(sdi12Command);
  } catch (error) {
    res.status(500).json({ error: 'Error creating SDI-12 command' });
  }
});

// DELETE SDI-12 command
sdi12CommandsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.sDI12Command.delete({
      where: { sdi12_id: id }
    });
    res.json({ message: 'SDI-12 command deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting SDI-12 command' });
  }
});

