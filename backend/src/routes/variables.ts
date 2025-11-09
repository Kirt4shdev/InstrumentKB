import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const variablesRouter = Router();

// GET all variables
variablesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const variables = await prisma.variableDict.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(variables);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching variables' });
  }
});

// POST create variable
variablesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, unit_default, description } = req.body;
    const variable = await prisma.variableDict.create({
      data: { name, unit_default, description }
    });
    res.status(201).json(variable);
  } catch (error) {
    res.status(500).json({ error: 'Error creating variable' });
  }
});

// POST link variable to instrument
variablesRouter.post('/instrument-variables', async (req: Request, res: Response) => {
  try {
    const instrumentVariable = await prisma.instrumentVariable.create({
      data: req.body,
      include: {
        variable: true,
        instrument: true
      }
    });
    res.status(201).json(instrumentVariable);
  } catch (error) {
    res.status(500).json({ error: 'Error linking variable to instrument' });
  }
});

// DELETE instrument variable
variablesRouter.delete('/instrument-variables/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.instrumentVariable.delete({
      where: { inst_var_id: id }
    });
    res.json({ message: 'Variable unlinked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error unlinking variable' });
  }
});

