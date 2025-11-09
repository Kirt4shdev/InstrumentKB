import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { articlesRouter } from './routes/articles';
import { manufacturersRouter } from './routes/manufacturers';
import { instrumentsRouter } from './routes/instruments';
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static(process.env.STORAGE_PATH || './uploads'));

// Routes
app.use('/api/articles', articlesRouter);
app.use('/api/manufacturers', manufacturersRouter);
app.use('/api/instruments', instrumentsRouter);
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

