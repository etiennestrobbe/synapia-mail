import { Router, Request, Response } from 'express';
import { configService, GlobalConfig } from '../services/configService';
import { validateConfigUpdate } from '../middleware/security';

const router = Router();

// GET /api/config - Get current global configuration
router.get('/', (req, res) => {
  try {
    const config = configService.getConfig();
    // Don't expose API keys in response
    const safeConfig = {
      ...config,
      apiKeys: Object.keys(config.apiKeys).reduce((acc, key) => {
        acc[key] = config.apiKeys[key as keyof typeof config.apiKeys] ? '***' : '';
        return acc;
      }, {} as any)
    };
    res.json(safeConfig);
  } catch (error) {
    console.error('Config get error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/config - Update global configuration
router.put('/', validateConfigUpdate, (req: Request, res: Response) => {
  try {
    const updates: Partial<GlobalConfig> = req.body;
    configService.updateConfig(updates);
    res.json({ message: 'Configuration updated successfully' });
  } catch (error) {
    console.error('Config update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as configRouter };
