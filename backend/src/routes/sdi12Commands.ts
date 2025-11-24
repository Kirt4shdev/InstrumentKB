import { Router, Request, Response } from 'express';
import { query } from '../db';

export const sdi12CommandsRouter = Router();

// GET SDI-12 commands for article
sdi12CommandsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const article_id = req.query.article_id as string;
    
    if (article_id) {
      const result = await query(
        `SELECT * FROM sdi12_commands WHERE article_id = $1 ORDER BY command ASC`,
        [article_id]
      );
      res.json(result.rows);
    } else {
      const result = await query(`SELECT * FROM sdi12_commands ORDER BY article_id, command ASC`);
      res.json(result.rows);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching SDI-12 commands' });
  }
});

// POST create SDI-12 command
sdi12CommandsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { article_id, command, description, response_format, reference_document_id } = req.body;
    
    const result = await query(
      `INSERT INTO sdi12_commands (article_id, command, description, response_format, reference_document_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [article_id, command, description || null, response_format || null, reference_document_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Duplicate SDI-12 command (article_id, command)' });
    } else {
      res.status(500).json({ error: 'Error creating SDI-12 command' });
    }
  }
});

// DELETE SDI-12 command
sdi12CommandsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await query('DELETE FROM sdi12_commands WHERE sdi12_id = $1', [id]);
    res.json({ message: 'SDI-12 command deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting SDI-12 command' });
  }
});
