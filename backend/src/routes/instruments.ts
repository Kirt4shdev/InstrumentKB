import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const instrumentsRouter = Router();

// GET instrument by ID (with all relations)
instrumentsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const instrument = await prisma.instrument.findUnique({
      where: { instrument_id: id },
      include: {
        article: true,
        manufacturer: true,
        documents: true,
        images: true,
        instrument_variables: {
          include: {
            variable: true
          }
        },
        analog_outputs: true,
        digital_io: true,
        instrument_protocols: true,
        modbus_registers: {
          include: {
            reference_document: true
          }
        },
        sdi12_commands: {
          include: {
            reference_document: true
          }
        },
        nmea_sentences: {
          include: {
            reference_document: true
          }
        },
        tags: true,
        provenance: {
          include: {
            source_document: true
          }
        }
      }
    });

    if (!instrument) {
      return res.status(404).json({ error: 'Instrument not found' });
    }

    res.json(instrument);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching instrument' });
  }
});

// POST create instrument (with nested relations)
instrumentsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      article_id,
      manufacturer_id,
      model,
      variant,
      category,
      power_supply_min_v,
      power_supply_max_v,
      power_consumption_typ_w,
      ip_rating,
      dimensions_mm,
      weight_g,
      oper_temp_min_c,
      oper_temp_max_c,
      storage_temp_min_c,
      storage_temp_max_c,
      oper_humidity_min_pct,
      oper_humidity_max_pct,
      altitude_max_m,
      emc_compliance,
      first_release_year,
      last_revision_year,
      documents,
      images,
      variables,
      analog_outputs,
      digital_io,
      protocols,
      modbus_registers,
      sdi12_commands,
      nmea_sentences,
      tags,
      provenance
    } = req.body;

    const instrument = await prisma.instrument.create({
      data: {
        article_id: article_id || null,
        manufacturer_id,
        model,
        variant,
        category,
        power_supply_min_v,
        power_supply_max_v,
        power_consumption_typ_w,
        ip_rating,
        dimensions_mm,
        weight_g,
        oper_temp_min_c,
        oper_temp_max_c,
        storage_temp_min_c,
        storage_temp_max_c,
        oper_humidity_min_pct,
        oper_humidity_max_pct,
        altitude_max_m,
        emc_compliance,
        first_release_year,
        last_revision_year,
        documents: documents ? {
          create: documents
        } : undefined,
        images: images ? {
          create: images
        } : undefined,
        instrument_variables: variables ? {
          create: variables
        } : undefined,
        analog_outputs: analog_outputs ? {
          create: analog_outputs
        } : undefined,
        digital_io: digital_io ? {
          create: digital_io
        } : undefined,
        instrument_protocols: protocols ? {
          create: protocols
        } : undefined,
        modbus_registers: modbus_registers ? {
          create: modbus_registers
        } : undefined,
        sdi12_commands: sdi12_commands ? {
          create: sdi12_commands
        } : undefined,
        nmea_sentences: nmea_sentences ? {
          create: nmea_sentences
        } : undefined,
        tags: tags ? {
          create: tags.map((tag: string) => ({ tag }))
        } : undefined,
        provenance: provenance ? {
          create: provenance
        } : undefined
      },
      include: {
        article: true,
        manufacturer: true,
        documents: true,
        images: true,
        instrument_variables: {
          include: {
            variable: true
          }
        },
        analog_outputs: true,
        digital_io: true,
        instrument_protocols: true,
        modbus_registers: true,
        sdi12_commands: true,
        nmea_sentences: true,
        tags: true,
        provenance: true
      }
    });

    res.status(201).json(instrument);
  } catch (error) {
    console.error('Error creating instrument:', error);
    res.status(500).json({ error: 'Error creating instrument', details: error });
  }
});

// PUT update instrument
instrumentsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { manufacturer_id, model, ...rest } = req.body;

    const instrument = await prisma.instrument.update({
      where: { instrument_id: id },
      data: {
        manufacturer_id,
        model,
        ...rest
      },
      include: {
        article: true,
        manufacturer: true,
        documents: true,
        images: true,
        instrument_variables: {
          include: {
            variable: true
          }
        },
        analog_outputs: true,
        digital_io: true,
        instrument_protocols: true,
        modbus_registers: true,
        sdi12_commands: true,
        nmea_sentences: true,
        tags: true,
        provenance: true
      }
    });

    res.json(instrument);
  } catch (error) {
    res.status(500).json({ error: 'Error updating instrument' });
  }
});

// DELETE instrument
instrumentsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.instrument.delete({
      where: { instrument_id: id }
    });
    res.json({ message: 'Instrument deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting instrument' });
  }
});

// GET all instruments (simple list)
instrumentsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [instruments, total] = await Promise.all([
      prisma.instrument.findMany({
        skip,
        take: limit,
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
      prisma.instrument.count()
    ]);

    res.json({
      instruments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching instruments' });
  }
});

