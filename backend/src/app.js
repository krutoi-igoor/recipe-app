import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRouter from './routes/health.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/health', healthRouter);

// Basic root responder
app.get('/api/v1', (_req, res) => {
  res.json({ status: 'ok', service: 'recipe-app-backend' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

// Error handler
app.use((err, _req, res, _next) => {
  // Keep log concise for scaffold
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
