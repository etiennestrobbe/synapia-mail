import { Router } from 'express';
import { LLMService } from '../services/llmService';

const router = Router();

// GET /api/models - Get available models for all providers
router.get('/', async (req, res) => {
  try {
    const models = await LLMService.getAvailableModels();
    res.json(models);
  } catch (error) {
    console.error('Models get error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/models/:provider - Get available models for specific provider
router.get('/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const models = await LLMService.getAvailableModels();
    const providerModels = models[provider as keyof typeof models];

    if (!providerModels) {
      return res.status(404).json({ error: `Provider '${provider}' not found` });
    }

    res.json({ [provider]: providerModels });
  } catch (error) {
    console.error('Provider models get error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as modelsRouter };
