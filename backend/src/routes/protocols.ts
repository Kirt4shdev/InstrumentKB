import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const protocolsRouter = Router();

// GET protocols for instrument
protocolsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const instrument_id = parseInt(req.query.instrument_id as string);
    const protocols = await prisma.instrumentProtocol.findMany({
      where: instrument_id ? { instrument_id } : undefined
    });
    res.json(protocols);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching protocols' });
  }
});

// POST create protocol
protocolsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const protocol = await prisma.instrumentProtocol.create({
      data: req.body
    });
    res.status(201).json(protocol);
  } catch (error) {
    res.status(500).json({ error: 'Error creating protocol' });
  }
});

// DELETE protocol
protocolsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.instrumentProtocol.delete({
      where: { inst_proto_id: id }
    });
    res.json({ message: 'Protocol deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting protocol' });
  }
});

