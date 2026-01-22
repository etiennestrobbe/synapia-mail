import { Request, Response, NextFunction } from 'express';

const API_KEY_HEADER = 'x-api-key';

export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers[API_KEY_HEADER] as string;
  const expectedApiKey = process.env.IA_BACKEND_API_KEY;

  if (!expectedApiKey) {
    console.error('IA_BACKEND_API_KEY not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  if (apiKey !== expectedApiKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
};
