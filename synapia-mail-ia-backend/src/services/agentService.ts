import { LLMService } from './llmService';
import { configService, LLMConfig } from './configService';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

export interface Agent {
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
}

export interface AgentResult {
  agent: string;
  result: any;
  confidence?: number;
}

class AgentService {
  private agents: Map<string, Agent> = new Map();

  constructor() {
    this.initializeDefaultAgents();
  }

  private initializeDefaultAgents() {
    // Category Creation Agent
    this.agents.set('category-creation', {
      name: 'category-creation',
      description: 'Creates new email categories based on existing categories and email content',
      systemPrompt: 'You are an expert at organizing emails into categories. Based on existing categories and the content of a new email, suggest appropriate new categories or use existing ones.',
      userPromptTemplate: 'Existing categories: {existingCategories}\n\nNew email subject: {subject}\nEmail body: {body}\n\nSuggest the most appropriate category for this email. If none fit well, suggest a new category name. Respond with JSON: {"category": "CategoryName", "isNew": true/false}'
    });

    // Email Categorization Agent (Enhanced with orchestration)
    this.agents.set('categorization', {
      name: 'categorization',
      description: 'Orchestrates full email processing: categorization, category creation, and urgency detection',
      systemPrompt: 'You are an expert email processing system. First try to categorize emails into existing categories. If confidence is below threshold, suggest a new category. Then determine urgency. Always provide comprehensive results.',
      userPromptTemplate: 'Existing categories: {categories}\nConfidence threshold: {confidenceThreshold}\n\nEmail subject: {subject}\nEmail from: {from}\nEmail body: {body}\n\nProcess this email step by step:\n1. Try to categorize with existing categories\n2. If confidence < threshold, suggest new category\n3. Determine if urgent and urgency level\n\nRespond with JSON: {"category": "CategoryName", "confidence": 0.95, "isUrgent": true/false, "urgencyLevel": "low/medium/high", "reason": "explanation", "isNewCategory": false, "newCategoryName": null}'
    });

    // Urgency Detection Agent
    this.agents.set('urgency-detection', {
      name: 'urgency-detection',
      description: 'Determines if an email is urgent and needs immediate attention',
      systemPrompt: 'You are an expert at detecting urgent emails. Consider factors like deadlines, emergency language, importance indicators, and sender relationships.',
      userPromptTemplate: 'Email subject: {subject}\nEmail from: {from}\nEmail body: {body}\n\nDetermine if this email is urgent. Consider deadlines, emergency language, and importance. Respond with JSON: {"isUrgent": true/false, "urgencyLevel": "low/medium/high", "reason": "brief explanation"}'
    });
  }

  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getAgent(name: string): Agent | undefined {
    return this.agents.get(name);
  }

  updateAgentPrompts(name: string, systemPrompt?: string, userPromptTemplate?: string): boolean {
    const agent = this.agents.get(name);
    if (!agent) return false;

    if (systemPrompt) agent.systemPrompt = systemPrompt;
    if (userPromptTemplate) agent.userPromptTemplate = userPromptTemplate;
    return true;
  }

  async runAgent(
    agentName: string,
    data: Record<string, any>,
    modelConfig?: LLMConfig
  ): Promise<AgentResult> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent not found: ${agentName}`);
    }

    // Use provided config or default
    const llmConfig = modelConfig || configService.getDefaultConfig();
    const llm = LLMService.createLLM(llmConfig);

    // Fill template
    let userPrompt = agent.userPromptTemplate;
    Object.keys(data).forEach(key => {
      userPrompt = userPrompt.replace(new RegExp(`{${key}}`, 'g'), data[key]);
    });

    const messages = [
      new SystemMessage(agent.systemPrompt),
      new HumanMessage(userPrompt)
    ];

    const response = await llm.invoke(messages);
    const content = response.content as string;

    try {
      const result = JSON.parse(content.trim());
      return {
        agent: agentName,
        result
      };
    } catch (error) {
      // Return raw response if not JSON
      return {
        agent: agentName,
        result: content
      };
    }
  }
}

export const agentService = new AgentService();
