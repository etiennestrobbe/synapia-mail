import { Router, Request, Response } from 'express';
import { categorizeEmail } from '../services/categorizationService';
import { validateCategorization } from '../middleware/security';

const router = Router();

interface CategorizeRequest {
  emailContent: {
    subject: string;
    body: string;
    from: string;
  };
  categories: string[];
}

router.post('/', validateCategorization, async (req: Request, res: Response) => {
  try {
    const { emailContent, categories }: CategorizeRequest = req.body;

    if (!emailContent || !categories) {
      return res.status(400).json({ error: 'Missing emailContent or categories' });
    }

    const result = await categorizeEmail(emailContent, categories);

    res.json(result);
  } catch (error) {
    console.error('Categorization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as categorizationRouter };
