import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const modbusRegistersRouter = Router();

// POST create modbus register
modbusRegistersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const modbusRegister = await prisma.modbusRegister.create({
      data: req.body
    });
    res.status(201).json(modbusRegister);
  } catch (error) {
    console.error('Error creating modbus register:', error);
    res.status(500).json({ error: 'Error creating modbus register' });
  }
});

// POST bulk create modbus registers
modbusRegistersRouter.post('/bulk', async (req: Request, res: Response) => {
  try {
    const { registers } = req.body;
    const created = await prisma.modbusRegister.createMany({
      data: registers,
      skipDuplicates: true
    });
    res.status(201).json({ count: created.count });
  } catch (error) {
    console.error('Error bulk creating modbus registers:', error);
    res.status(500).json({ error: 'Error bulk creating modbus registers' });
  }
});

// DELETE modbus register
modbusRegistersRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.modbusRegister.delete({
      where: { modbus_id: id }
    });
    res.json({ message: 'Modbus register deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting modbus register' });
  }
});

