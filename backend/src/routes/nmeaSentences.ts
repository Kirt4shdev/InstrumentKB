import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const nmeaSentencesRouter = Router();

// POST create NMEA sentence
nmeaSentencesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const nmeaSentence = await prisma.nMEASentence.create({
      data: req.body
    });
    res.status(201).json(nmeaSentence);
  } catch (error) {
    res.status(500).json({ error: 'Error creating NMEA sentence' });
  }
});

// DELETE NMEA sentence
nmeaSentencesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.nMEASentence.delete({
      where: { nmea_id: id }
    });
    res.json({ message: 'NMEA sentence deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting NMEA sentence' });
  }
});

