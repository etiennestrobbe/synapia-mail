import { Router, Request, Response } from 'express';
import { agentService } from '../services/agentService';
import { LLMConfig } from '../services/configService';
import { validateAgentRun, validatePromptUpdate } from '../middleware/security';

const router = Router();

// GET /api/agents - Get all agents
router.get('/', (req, res) => {
  try {
    const agents = agentService.getAgents();
    res.json(agents);
  } catch (error) {
    console.error('Agents get error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/agents/:name - Get specific agent
router.get('/:name', (req, res) => {
  try {
    const { name } = req.params;
    const agent = agentService.getAgent(name);

    if (!agent) {
      return res.status(404).json({ error: `Agent '${name}' not found` });
    }

    res.json(agent);
  } catch (error) {
    console.error('Agent get error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/agents/:name - Update agent prompts
router.put('/:name', validatePromptUpdate, (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const { systemPrompt, userPromptTemplate } = req.body;

    const success = agentService.updateAgentPrompts(name, systemPrompt, userPromptTemplate);

    if (!success) {
      return res.status(404).json({ error: `Agent '${name}' not found` });
    }

    res.json({ message: 'Agent prompts updated successfully' });
  } catch (error) {
    console.error('Agent update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/agents/:name/run - Run specific agent
router.post('/:name/run', validateAgentRun, async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const { data, modelConfig } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Missing data parameter' });
    }

    const result = await agentService.runAgent(name, data, modelConfig as LLMConfig);
    res.json(result);
  } catch (error) {
    console.error('Agent run error:', error);
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('API key')) {
        return res.status(400).json({ error: error.message });
      }
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as agentsRouter };
