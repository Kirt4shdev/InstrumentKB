import { Router, Request, Response } from 'express';
import { query } from '../db';

export const nmeaSentencesRouter = Router();

// Helper function to handle null values preserving 0
function toNullable(value: any): any {
  return value === undefined || value === null ? null : value;
}

// GET NMEA sentences for article
nmeaSentencesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const article_id = req.query.article_id as string;
    
    if (article_id) {
      const result = await query(
        `SELECT * FROM nmea_sentences WHERE article_id = $1 ORDER BY sentence ASC`,
        [article_id]
      );
      res.json(result.rows);
    } else {
      const result = await query(`SELECT * FROM nmea_sentences ORDER BY article_id, sentence ASC`);
      res.json(result.rows);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching NMEA sentences' });
  }
});

// POST create NMEA sentence
nmeaSentencesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { article_id, sentence, description, fields, reference_document_id } = req.body;
    
    const result = await query(
      `INSERT INTO nmea_sentences (article_id, sentence, description, fields, reference_document_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [article_id, sentence, toNullable(description), toNullable(fields), toNullable(reference_document_id)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Duplicate NMEA sentence (article_id, sentence)' });
    } else {
      res.status(500).json({ error: 'Error creating NMEA sentence' });
    }
  }
});

// DELETE NMEA sentence
nmeaSentencesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await query('DELETE FROM nmea_sentences WHERE nmea_id = $1', [id]);
    res.json({ message: 'NMEA sentence deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting NMEA sentence' });
  }
});
