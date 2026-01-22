import { agentService } from './agentService';

interface EmailContent {
  subject: string;
  body: string;
  from: string;
}

interface CategorizationResult {
  category: string;
  confidence: number;
}

// Legacy function for backward compatibility - now uses agent framework
export const categorizeEmail = async (
  emailContent: EmailContent,
  categories: string[]
): Promise<CategorizationResult> => {
  const result = await agentService.runAgent('categorization', {
    categories: categories.join(', '),
    subject: emailContent.subject,
    from: emailContent.from,
    body: emailContent.body
  });

  // Extract result from agent response
  const agentResult = result.result;
  if (typeof agentResult === 'object' && agentResult.category) {
    return {
      category: agentResult.category,
      confidence: agentResult.confidence || 0.5
    };
  }

  // Fallback parsing
  if (typeof agentResult === 'string') {
    try {
      const parsed = JSON.parse(agentResult);
      return {
        category: parsed.category || categories[0],
        confidence: parsed.confidence || 0.5
      };
    } catch {
      // Extract from text
      const categoryMatch = agentResult.match(/category["\s:]+([^"}\n]+)/i);
      return {
        category: categoryMatch ? categoryMatch[1].trim() : categories[0],
        confidence: 0.5
      };
    }
  }

  return { category: categories[0], confidence: 0.5 };
};
