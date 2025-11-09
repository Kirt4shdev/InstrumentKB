import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';

export const searchRouter = Router();

// GET search instruments
searchRouter.get('/instruments', async (req: Request, res: Response) => {
  try {
    const {
      q,
      article_id,
      manufacturer_id,
      variable_name,
      accuracy_abs_lte,
      protocol_type,
      modbus_address,
      tags,
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros
    const where: Prisma.InstrumentWhereInput = {};

    if (q) {
      where.OR = [
        { model: { contains: q as string, mode: 'insensitive' } },
        { variant: { contains: q as string, mode: 'insensitive' } },
        { category: { contains: q as string, mode: 'insensitive' } },
        { article: { sap_description: { contains: q as string, mode: 'insensitive' } } }
      ];
    }

    if (article_id) {
      where.article_id = article_id as string;
    }

    if (manufacturer_id) {
      where.manufacturer_id = parseInt(manufacturer_id as string);
    }

    if (variable_name) {
      where.instrument_variables = {
        some: {
          variable: {
            name: { contains: variable_name as string, mode: 'insensitive' }
          }
        }
      };
    }

    if (accuracy_abs_lte) {
      where.instrument_variables = {
        some: {
          accuracy_abs: { lte: parseFloat(accuracy_abs_lte as string) }
        }
      };
    }

    if (protocol_type) {
      where.instrument_protocols = {
        some: {
          type: protocol_type as any
        }
      };
    }

    if (modbus_address) {
      where.modbus_registers = {
        some: {
          address: parseInt(modbus_address as string)
        }
      };
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      where.tags = {
        some: {
          tag: { in: tagArray as string[] }
        }
      };
    }

    // Ejecutar búsqueda
    const [instruments, total] = await Promise.all([
      prisma.instrument.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          article: true,
          manufacturer: true,
          instrument_variables: {
            include: {
              variable: true
            }
          },
          instrument_protocols: true,
          tags: true
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.instrument.count({ where })
    ]);

    res.json({
      instruments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Error searching instruments' });
  }
});

