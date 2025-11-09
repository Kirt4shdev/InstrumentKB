import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const articlesRouter = Router();

// Helper function to generate article_id
function generateArticleId(article_type: string): string {
  const prefixes: { [key: string]: string } = {
    'INSTRUMENTO': 'INS',
    'CABLE': 'CAB',
    'SOPORTE': 'SOP',
    'APARAMENTA_AC': 'AAC',
    'APARAMENTA_DC': 'ADC',
    'SENSOR': 'SEN',
    'ACTUADOR': 'ACT',
    'DATALOGGER': 'LOG',
    'FUENTE_ALIMENTACION': 'PSU',
    'MODULO_IO': 'MIO',
    'GATEWAY': 'GTW',
    'CAJA_CONEXIONES': 'BOX',
    'RACK': 'RCK',
    'PANEL': 'PNL',
    'PROTECCION': 'PRT',
    'CONECTOR': 'CON',
    'HERRAMIENTA': 'TLS',
    'CONSUMIBLE': 'CSM',
    'REPUESTO': 'REP',
    'SOFTWARE': 'SFT',
    'LICENCIA': 'LIC',
    'OTROS': 'OTH'
  };
  
  const prefix = prefixes[article_type] || 'ART';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${prefix}-${timestamp}-${random}`;
}

// POST create article
articlesRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Generar article_id automáticamente si no se proporciona
    if (!req.body.article_id) {
      req.body.article_id = generateArticleId(req.body.article_type);
    }
    
    const article = await prisma.article.create({
      data: req.body,
      include: {
        manufacturer: true,
      },
    });
    res.status(201).json(article);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Article ID or SAP ItemCode already exists' });
    }
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Error creating article', details: error.message });
  }
});

// GET all articles con paginación y filtros
articlesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { active, family, article_type, category, q, page = '1', limit = '50' } = req.query;
    const where: any = {};

    if (active !== undefined) {
      where.active = active === 'true';
    }
    if (family) {
      where.family = family as string;
    }
    if (article_type) {
      where.article_type = article_type as string;
    }
    if (category) {
      where.category = { contains: category as string, mode: 'insensitive' };
    }
    if (q) {
      where.OR = [
        { article_id: { contains: q as string, mode: 'insensitive' } },
        { sap_itemcode: { contains: q as string, mode: 'insensitive' } },
        { sap_description: { contains: q as string, mode: 'insensitive' } },
        { model: { contains: q as string, mode: 'insensitive' } },
        { category: { contains: q as string, mode: 'insensitive' } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          manufacturer: true,
          article_variables: {
            include: {
              variable: true,
            },
          },
          article_protocols: true,
          tags: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.article.count({ where }),
    ]);

    res.json({
      articles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Error fetching articles' });
  }
});

// GET single article by ID
articlesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const article = await prisma.article.findUnique({
      where: { article_id: id },
      include: {
        manufacturer: true,
        documents: true,
        images: true,
        article_variables: {
          include: {
            variable: true,
          },
        },
        analog_outputs: true,
        digital_io: true,
        article_protocols: true,
        modbus_registers: true,
        sdi12_commands: true,
        nmea_sentences: true,
        tags: true,
        provenance: true,
        replaced_by: true,
        replacement_for: true,
      },
    });
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Error fetching article' });
  }
});

// PUT update article
articlesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { article_variables, article_protocols, tags, ...articleData } = req.body;

    // Actualizar artículo
    const article = await prisma.article.update({
      where: { article_id: id },
      data: articleData,
    });

    // Actualizar variables si se proporcionan
    if (article_variables) {
      await prisma.articleVariable.deleteMany({
        where: { article_id: id },
      });
      
      if (article_variables.length > 0) {
        await prisma.articleVariable.createMany({
          data: article_variables.map((v: any) => ({
            article_id: id,
            ...v,
          })),
        });
      }
    }

    // Actualizar protocolos si se proporcionan
    if (article_protocols) {
      await prisma.articleProtocol.deleteMany({
        where: { article_id: id },
      });
      
      if (article_protocols.length > 0) {
        await prisma.articleProtocol.createMany({
          data: article_protocols.map((p: any) => ({
            article_id: id,
            ...p,
          })),
        });
      }
    }

    // Actualizar tags si se proporcionan
    if (tags) {
      await prisma.tag.deleteMany({
        where: { article_id: id },
      });
      
      if (tags.length > 0) {
        await prisma.tag.createMany({
          data: tags.map((t: any) => ({
            article_id: id,
            tag: typeof t === 'string' ? t : t.tag,
          })),
        });
      }
    }

    // Obtener artículo actualizado con relaciones
    const updatedArticle = await prisma.article.findUnique({
      where: { article_id: id },
      include: {
        manufacturer: true,
        article_variables: {
          include: {
            variable: true,
          },
        },
        article_protocols: true,
        tags: true,
      },
    });

    res.json(updatedArticle);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'SAP ItemCode already exists' });
    }
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Error updating article', details: error.message });
  }
});

// DELETE article
articlesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.article.delete({
      where: { article_id: id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Error deleting article' });
  }
});

// GET unique families
articlesRouter.get('/meta/families', async (req: Request, res: Response) => {
  try {
    const families = await prisma.article.findMany({
      distinct: ['family'],
      select: { family: true },
      where: { family: { not: null, not: '' } },
      orderBy: { family: 'asc' },
    });
    res.json(families.map(f => f.family));
  } catch (error) {
    console.error('Error fetching article families:', error);
    res.status(500).json({ error: 'Error fetching article families' });
  }
});

// GET unique subfamilies by family
articlesRouter.get('/meta/subfamilies', async (req: Request, res: Response) => {
  try {
    const { family } = req.query;
    const where: any = { subfamily: { not: null, not: '' } };
    if (family) {
      where.family = family as string;
    }
    const subfamilies = await prisma.article.findMany({
      distinct: ['subfamily'],
      select: { subfamily: true },
      where,
      orderBy: { subfamily: 'asc' },
    });
    res.json(subfamilies.map(s => s.subfamily));
  } catch (error) {
    console.error('Error fetching article subfamilies:', error);
    res.status(500).json({ error: 'Error fetching article subfamilies' });
  }
});

// GET article types disponibles
articlesRouter.get('/meta/types', async (req: Request, res: Response) => {
  try {
    const types = [
      { value: 'INSTRUMENTO', label: 'Instrumento' },
      { value: 'CABLE', label: 'Cable' },
      { value: 'SOPORTE', label: 'Soporte' },
      { value: 'APARAMENTA_AC', label: 'Aparamenta AC' },
      { value: 'APARAMENTA_DC', label: 'Aparamenta DC' },
      { value: 'SENSOR', label: 'Sensor' },
      { value: 'ACTUADOR', label: 'Actuador' },
      { value: 'DATALOGGER', label: 'Datalogger' },
      { value: 'FUENTE_ALIMENTACION', label: 'Fuente de Alimentación' },
      { value: 'MODULO_IO', label: 'Módulo I/O' },
      { value: 'GATEWAY', label: 'Gateway' },
      { value: 'CAJA_CONEXIONES', label: 'Caja de Conexiones' },
      { value: 'RACK', label: 'Rack' },
      { value: 'PANEL', label: 'Panel' },
      { value: 'PROTECCION', label: 'Protección' },
      { value: 'CONECTOR', label: 'Conector' },
      { value: 'HERRAMIENTA', label: 'Herramienta' },
      { value: 'CONSUMIBLE', label: 'Consumible' },
      { value: 'REPUESTO', label: 'Repuesto' },
      { value: 'SOFTWARE', label: 'Software' },
      { value: 'LICENCIA', label: 'Licencia' },
      { value: 'OTROS', label: 'Otros' },
    ];
    res.json(types);
  } catch (error) {
    console.error('Error fetching article types:', error);
    res.status(500).json({ error: 'Error fetching article types' });
  }
});

// GET unique categories (valores reales en la BD)
articlesRouter.get('/meta/categories', async (req: Request, res: Response) => {
  try {
    const { article_type } = req.query;
    const where: any = { category: { not: null, not: '' } };
    
    if (article_type) {
      where.article_type = article_type as string;
    }
    
    const categories = await prisma.article.findMany({
      distinct: ['category'],
      select: { category: true },
      where,
      orderBy: { category: 'asc' },
    });
    res.json(categories.map(c => c.category).filter(Boolean));
  } catch (error) {
    console.error('Error fetching article categories:', error);
    res.status(500).json({ error: 'Error fetching article categories' });
  }
});

// GET search articles (simplificado para autocomplete)
articlesRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, limit = '10' } = req.query;
    
    if (!q) {
      return res.json([]);
    }

    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { article_id: { contains: q as string, mode: 'insensitive' } },
          { sap_itemcode: { contains: q as string, mode: 'insensitive' } },
          { sap_description: { contains: q as string, mode: 'insensitive' } },
        ],
        active: true,
      },
      select: {
        article_id: true,
        sap_itemcode: true,
        sap_description: true,
        article_type: true,
        category: true,
      },
      take: parseInt(limit as string),
      orderBy: { article_id: 'asc' },
    });

    res.json(articles);
  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).json({ error: 'Error searching articles' });
  }
});
