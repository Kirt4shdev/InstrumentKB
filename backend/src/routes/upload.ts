import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { query } from '../db';

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

    const { article_id, type, title, language, revision, publish_date, notes } = req.body;

    const result = await query(
      `INSERT INTO documents (article_id, type, title, language, revision, publish_date, url_or_path, sha256, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [article_id, type, title, language || null, revision || null, 
       publish_date ? new Date(publish_date) : null, relativePath, sha256, notes || null]
    );

    res.status(201).json(result.rows[0]);
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
    const { article_id, caption, credit, license, notes } = req.body;

    const result = await query(
      `INSERT INTO images (article_id, caption, url_or_path, credit, license, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [article_id, caption || null, relativePath, credit || null, license || null, notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Error uploading image' });
  }
});

// DELETE document
uploadRouter.delete('/document/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await query(
      `SELECT * FROM documents WHERE document_id = $1`,
      [id]
    );

    if (result.rows.length > 0) {
      const document = result.rows[0];
      
      // Eliminar archivo físico
      const filePath = path.join(process.cwd(), document.url_or_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Eliminar registro
      await query('DELETE FROM documents WHERE document_id = $1', [id]);
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
    const result = await query(
      `SELECT * FROM images WHERE image_id = $1`,
      [id]
    );

    if (result.rows.length > 0) {
      const image = result.rows[0];
      
      // Eliminar archivo físico
      const filePath = path.join(process.cwd(), image.url_or_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Eliminar registro
      await query('DELETE FROM images WHERE image_id = $1', [id]);
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting image' });
  }
});
