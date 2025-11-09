import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { prisma } from '../prisma';

export const uploadRouter = Router();

// Configurar storage
const storagePath = process.env.STORAGE_PATH || './uploads';

// Crear directorios si no existen
['documents', 'images'].forEach(dir => {
  const fullPath = path.join(storagePath, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.path.includes('document') ? 'documents' : 'images';
    cb(null, path.join(storagePath, type));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Calcular SHA256
function calculateSHA256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

// POST upload document
uploadRouter.post('/document', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const sha256 = await calculateSHA256(req.file.path);
    const relativePath = `/uploads/documents/${req.file.filename}`;

    const { instrument_id, type, title, language, revision, publish_date, notes } = req.body;

    const document = await prisma.document.create({
      data: {
        instrument_id: parseInt(instrument_id),
        type,
        title,
        language,
        revision,
        publish_date: publish_date ? new Date(publish_date) : null,
        url_or_path: relativePath,
        sha256,
        notes
      }
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Error uploading document' });
  }
});

// POST upload image
uploadRouter.post('/image', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const relativePath = `/uploads/images/${req.file.filename}`;
    const { instrument_id, caption, credit, license, notes } = req.body;

    const image = await prisma.image.create({
      data: {
        instrument_id: parseInt(instrument_id),
        caption,
        url_or_path: relativePath,
        credit,
        license,
        notes
      }
    });

    res.status(201).json(image);
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Error uploading image' });
  }
});

// DELETE document
uploadRouter.delete('/document/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const document = await prisma.document.findUnique({
      where: { document_id: id }
    });

    if (document) {
      // Eliminar archivo físico
      const filePath = path.join(process.cwd(), document.url_or_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Eliminar registro
      await prisma.document.delete({
        where: { document_id: id }
      });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting document' });
  }
});

// DELETE image
uploadRouter.delete('/image/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const image = await prisma.image.findUnique({
      where: { image_id: id }
    });

    if (image) {
      // Eliminar archivo físico
      const filePath = path.join(process.cwd(), image.url_or_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Eliminar registro
      await prisma.image.delete({
        where: { image_id: id }
      });
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting image' });
  }
});

