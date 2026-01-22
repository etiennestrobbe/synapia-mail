import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { categorizationRouter } from './routes/categorization';
import { configRouter } from './routes/config';
import { modelsRouter } from './routes/models';
import { agentsRouter } from './routes/agents';
import { authenticateApiKey } from './middleware/auth';
import { apiLimiter, agentRunLimiter } from './middleware/security';

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : false,
  credentials: true,
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'X-API-Key']
}));
app.use(express.json({ limit: '10mb' })); // Limit request body size

// Apply rate limiting to all routes
app.use('/api', apiLimiter);

// Health check (no auth required for basic monitoring)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'IA Backend' });
});

// Apply API key authentication to all /api routes
app.use('/api', authenticateApiKey);

// Legacy route for backward compatibility (with validation)
app.use('/api/categorize', categorizationRouter);

// New flexible routes
app.use('/api/config', configRouter);
app.use('/api/models', modelsRouter);

// Agent routes with stricter rate limiting
app.use('/api/agents', agentRunLimiter);
app.use('/api/agents', agentsRouter);

app.listen(PORT, () => {
  console.log(`IA Backend running on port ${PORT}`);
});
