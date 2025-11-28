import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db';
import { articlesRouter } from './routes/articles';
import { manufacturersRouter } from './routes/manufacturers';
import { variablesRouter } from './routes/variables';
import { protocolsRouter } from './routes/protocols';
import { analogOutputsRouter } from './routes/analogOutputs';
import { digitalIORouter } from './routes/digitalIO';
import { modbusRegistersRouter } from './routes/modbusRegisters';
import { sdi12CommandsRouter } from './routes/sdi12Commands';
import { nmeaSentencesRouter } from './routes/nmeaSentences';
import { uploadRouter } from './routes/upload';
import { searchRouter } from './routes/search';
import { exportRouter } from './routes/export';
import { importRouter } from './routes/import';
import { accessoriesRouter } from './routes/accessories';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static(process.env.STORAGE_PATH || './uploads'));

// Routes
app.use('/api/articles', articlesRouter);
app.use('/api/manufacturers', manufacturersRouter);
app.use('/api/variables', variablesRouter);
app.use('/api/protocols', protocolsRouter);
app.use('/api/analog-outputs', analogOutputsRouter);
app.use('/api/digital-io', digitalIORouter);
app.use('/api/modbus-registers', modbusRegistersRouter);
app.use('/api/sdi12-commands', sdi12CommandsRouter);
app.use('/api/nmea-sentences', nmeaSentencesRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/search', searchRouter);
app.use('/api/export', exportRouter);
app.use('/api/import', importRouter);
app.use('/api/accessories', accessoriesRouter);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 Database: PostgreSQL (SQL nativo - ¡Sin Prisma!)`);
});
