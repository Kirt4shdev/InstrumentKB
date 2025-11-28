import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { query } from '../db';

export const uploadRouter = Router();

// Helper function to handle null values preserving 0
function toNullable(value: any): any {
  return value === undefined || value === null ? null : value;
}

// Configurar storage
const storagePath = process.env.STORAGE_PATH || './uploads';

// Crear directorio base si no existe
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

// Función para sanitizar rutas y prevenir path traversal
function sanitizePath(userPath: string): string {
  if (!userPath) return '';
  
  // Remover caracteres peligrosos
  let sanitized = userPath.replace(/[<>:"|?*]/g, '');
  
  // Normalizar separadores (convertir / a \\ en Windows, o viceversa)
  sanitized = sanitized.replace(/[\/\\]+/g, path.sep);
  
  // Remover .. para prevenir path traversal
  sanitized = sanitized.split(path.sep)
    .filter(part => part !== '..' && part !== '.' && part !== '')
    .join(path.sep);
  
  return sanitized;
}

// Función para crear estructura de carpetas
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Función para manejar nombres de archivo duplicados
function getUniqueFilename(dirPath: string, filename: string): string {
  const ext = path.extname(filename);
  const baseName = path.basename(filename, ext);
  let finalName = filename;
  let counter = 1;
  
  while (fs.existsSync(path.join(dirPath, finalName))) {
    finalName = `${baseName}_${counter}${ext}`;
    counter++;
  }
  
  return finalName;
}

// Multer configuration con memoria temporal
const upload = multer({ 
  storage: multer.memoryStorage(), // Usamos memoria temporal
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB para documentos grandes (manuales técnicos, etc.)
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

    const { article_id, type, title, language, revision, publish_date, notes, folder_path } = req.body;

    // Sanitizar y construir la ruta de carpeta
    const sanitizedFolder = sanitizePath(folder_path || 'Documents');
    const fullDirPath = path.join(storagePath, sanitizedFolder);
    
    // Crear estructura de carpetas si no existe
    ensureDirectoryExists(fullDirPath);
    
    // Obtener nombre de archivo único si ya existe
    const originalFilename = req.file.originalname;
    const finalFilename = getUniqueFilename(fullDirPath, originalFilename);
    const finalFilePath = path.join(fullDirPath, finalFilename);
    
    // Guardar el archivo desde memoria al disco
    fs.writeFileSync(finalFilePath, req.file.buffer);
    
    // Calcular SHA256
    const sha256 = await calculateSHA256(finalFilePath);
    
    // Ruta relativa para la BD (desde la raíz de uploads)
    const relativePath = path.join(sanitizedFolder, finalFilename).replace(/\\/g, '/');

    // Si hay article_id, guardar en BD, si no, solo devolver la info del archivo
    let result;
    if (article_id && article_id !== 'null' && article_id !== 'undefined') {
      result = await query(
        `INSERT INTO documents (article_id, type, title, language, revision, publish_date, url_or_path, sha256, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [article_id, type, title, toNullable(language), toNullable(revision), 
         publish_date ? new Date(publish_date) : null, relativePath, sha256, toNullable(notes)]
      );

      res.status(201).json({
        ...result.rows[0],
        full_path: finalFilePath,
        folder_structure: sanitizedFolder
      });
    } else {
      // Archivo guardado pero sin registro en BD (se guardará cuando se cree el artículo)
      res.status(201).json({
        uploaded: true,
        url_or_path: relativePath,
        sha256,
        full_path: finalFilePath,
        folder_structure: sanitizedFolder,
        filename: finalFilename,
        message: 'Archivo guardado. Se asociará al artículo al guardar.'
      });
    }
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Error uploading document', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// POST upload image
uploadRouter.post('/image', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { article_id, caption, credit, license, notes, folder_path } = req.body;

    // Sanitizar y construir la ruta de carpeta
    const sanitizedFolder = sanitizePath(folder_path || 'Images');
    const fullDirPath = path.join(storagePath, sanitizedFolder);
    
    // Crear estructura de carpetas si no existe
    ensureDirectoryExists(fullDirPath);
    
    // Obtener nombre de archivo único si ya existe
    const originalFilename = req.file.originalname;
    const finalFilename = getUniqueFilename(fullDirPath, originalFilename);
    const finalFilePath = path.join(fullDirPath, finalFilename);
    
    // Guardar el archivo desde memoria al disco
    fs.writeFileSync(finalFilePath, req.file.buffer);
    
    // Ruta relativa para la BD
    const relativePath = path.join(sanitizedFolder, finalFilename).replace(/\\/g, '/');

    // Si hay article_id, guardar en BD, si no, solo devolver la info del archivo
    let result;
    if (article_id && article_id !== 'null' && article_id !== 'undefined') {
      result = await query(
        `INSERT INTO images (article_id, caption, url_or_path, credit, license, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [article_id, toNullable(caption), relativePath, toNullable(credit), toNullable(license), toNullable(notes)]
      );

      res.status(201).json({
        ...result.rows[0],
        full_path: finalFilePath,
        folder_structure: sanitizedFolder
      });
    } else {
      // Archivo guardado pero sin registro en BD (se guardará cuando se cree el artículo)
      res.status(201).json({
        uploaded: true,
        url_or_path: relativePath,
        full_path: finalFilePath,
        folder_structure: sanitizedFolder,
        filename: finalFilename,
        message: 'Imagen guardada. Se asociará al artículo al guardar.'
      });
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Error uploading image', details: error instanceof Error ? error.message : 'Unknown error' });
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
      const filePath = path.join(storagePath, document.url_or_path);
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
      const filePath = path.join(storagePath, image.url_or_path);
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

// GET lista de carpetas existentes (para autocompletado)
uploadRouter.get('/folders', async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string || 'document'; // 'document' o 'image'
    
    // Obtener rutas únicas de la base de datos
    const table = type === 'document' ? 'documents' : 'images';
    const result = await query(
      `SELECT DISTINCT url_or_path FROM ${table} ORDER BY url_or_path`
    );
    
    // Extraer carpetas únicas
    const folders = new Set<string>();
    result.rows.forEach((row: any) => {
      const filePath = row.url_or_path;
      const folderPath = path.dirname(filePath);
      if (folderPath && folderPath !== '.') {
        folders.add(folderPath);
        
        // También agregar carpetas padre
        const parts = folderPath.split(path.sep);
        for (let i = 1; i < parts.length; i++) {
          folders.add(parts.slice(0, i + 1).join(path.sep));
        }
      }
    });
    
    res.json({
      folders: Array.from(folders).sort(),
      storage_path: storagePath
    });
  } catch (error) {
    console.error('Error listing folders:', error);
    res.status(500).json({ error: 'Error listing folders' });
  }
});

// GET estructura de carpetas físicas
uploadRouter.get('/folders/physical', async (req: Request, res: Response) => {
  try {
    function getFolderStructure(dirPath: string, relativePath: string = ''): any[] {
      const items: any[] = [];
      
      if (!fs.existsSync(dirPath)) {
        return items;
      }
      
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const fullPath = path.join(dirPath, entry.name);
          const relPath = path.join(relativePath, entry.name);
          
          items.push({
            name: entry.name,
            path: relPath,
            type: 'folder',
            children: getFolderStructure(fullPath, relPath)
          });
        }
      }
      
      return items.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    const structure = getFolderStructure(storagePath);
    
    res.json({
      root: storagePath,
      structure
    });
  } catch (error) {
    console.error('Error reading folder structure:', error);
    res.status(500).json({ error: 'Error reading folder structure' });
  }
});

// GET preview de ruta final
uploadRouter.post('/preview-path', async (req: Request, res: Response) => {
  try {
    const { folder_path, filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }
    
    const sanitizedFolder = sanitizePath(folder_path || 'Documents');
    const fullDirPath = path.join(storagePath, sanitizedFolder);
    const finalFilename = fs.existsSync(fullDirPath) 
      ? getUniqueFilename(fullDirPath, filename)
      : filename;
    const finalPath = path.join(fullDirPath, finalFilename);
    
    res.json({
      folder_path: sanitizedFolder,
      filename: finalFilename,
      full_path: finalPath,
      relative_path: path.join(sanitizedFolder, finalFilename).replace(/\\/g, '/'),
      folder_exists: fs.existsSync(fullDirPath),
      file_exists: fs.existsSync(finalPath),
      will_rename: finalFilename !== filename
    });
  } catch (error) {
    console.error('Error previewing path:', error);
    res.status(500).json({ error: 'Error previewing path' });
  }
});
