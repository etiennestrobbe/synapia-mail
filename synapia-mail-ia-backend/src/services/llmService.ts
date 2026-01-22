import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatMistralAI } from '@langchain/mistralai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { LLMConfig } from './configService';

interface ModelInfo {
  id: string;
  name?: string;
  description?: string;
}

interface ProviderModels {
  [provider: string]: ModelInfo[];
}

interface CachedModels {
  data: ProviderModels;
  timestamp: number;
  ttl: number; // Time to live in milliseconds (30 minutes)
}

export class LLMService {
  private static cache: CachedModels | null = null;
  private static readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  static createLLM(config: LLMConfig): BaseChatModel {
    const { provider, model, apiKey } = config;

    if (!apiKey) {
      throw new Error(`API key not configured for provider: ${provider}`);
    }

    switch (provider) {
      case 'openai':
        return new ChatOpenAI({
          openAIApiKey: apiKey,
          modelName: model,
        });

      case 'anthropic':
        return new ChatAnthropic({
          anthropicApiKey: apiKey,
          modelName: model,
        });

      case 'openrouter':
        return new ChatOpenAI({
          openAIApiKey: apiKey,
          modelName: model,
          configuration: {
            baseURL: 'https://openrouter.ai/api/v1',
          },
        });

      case 'gemini':
        return new ChatGoogleGenerativeAI({
          apiKey: apiKey,
          modelName: model,
        });

      case 'mistral':
        return new ChatMistralAI({
          apiKey: apiKey,
          modelName: model,
        });

      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  static async getAvailableModels(): Promise<Record<string, string[]>> {
    try {
      const models = await this.fetchAllModels();
      const result: Record<string, string[]> = {};

      for (const [provider, modelList] of Object.entries(models)) {
        result[provider] = modelList.map(model => model.id);
      }

      return result;
    } catch (error) {
      console.error('Failed to fetch models from APIs, falling back to static list:', error);
      return this.getFallbackModels();
    }
  }

  private static async fetchAllModels(): Promise<ProviderModels> {
    // Check cache first
    if (this.cache && (Date.now() - this.cache.timestamp) < this.cache.ttl) {
      return this.cache.data;
    }

    const providers: (keyof ProviderModels)[] = ['openai', 'anthropic', 'openrouter', 'gemini', 'mistral'];
    const results: ProviderModels = {};

    // Fetch models for each provider concurrently
    const promises = providers.map(async (provider) => {
      try {
        const models = await this.fetchProviderModels(provider);
        results[provider] = models;
      } catch (error) {
        console.warn(`Failed to fetch models for ${provider}:`, error);
        // Use fallback for this provider
        results[provider] = this.getProviderFallback(provider);
      }
    });

    await Promise.all(promises);

    // Cache the results
    this.cache = {
      data: results,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL
    };

    return results;
  }

  private static async fetchProviderModels(provider: keyof ProviderModels): Promise<ModelInfo[]> {
    const apiKey = this.getApiKeyForProvider(provider);
    if (!apiKey) {
      throw new Error(`API key not configured for ${provider}`);
    }

    switch (provider) {
      case 'openai':
        return await this.fetchOpenAIModels(apiKey);
      case 'anthropic':
        return await this.fetchAnthropicModels(apiKey);
      case 'openrouter':
        return await this.fetchOpenRouterModels(apiKey);
      case 'gemini':
        return await this.fetchGeminiModels(apiKey);
      case 'mistral':
        return await this.fetchMistralModels(apiKey);
      default:
        return this.getProviderFallback(provider);
    }
  }

  private static async fetchOpenAIModels(apiKey: string): Promise<ModelInfo[]> {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json() as { data: Array<{ id: string; [key: string]: any }> };
    return data.data
      .filter((model) => model.id.includes('gpt'))
      .map((model) => ({ id: model.id, name: model.id }));
  }

  private static async fetchAnthropicModels(apiKey: string): Promise<ModelInfo[]> {
    // Anthropic doesn't have a public models endpoint, so we'll use known models
    // In a real implementation, you'd check their API documentation for any available endpoints
    return this.getProviderFallback('anthropic');
  }

  private static async fetchOpenRouterModels(apiKey: string): Promise<ModelInfo[]> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json() as { data: Array<{ id: string; name?: string; description?: string; [key: string]: any }> };
      return data.data.map((model) => ({
        id: model.id,
        name: model.name,
        description: model.description
      }));
    } catch (error) {
      // OpenRouter might not be accessible, use fallback
      return this.getProviderFallback('openrouter');
    }
  }

  private static async fetchGeminiModels(apiKey: string): Promise<ModelInfo[]> {
    // Gemini doesn't have a public models list endpoint, use known models
    return this.getProviderFallback('gemini');
  }

  private static async fetchMistralModels(apiKey: string): Promise<ModelInfo[]> {
    try {
      const response = await fetch('https://api.mistral.ai/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data = await response.json() as { data: Array<{ id: string; [key: string]: any }> };
      return data.data.map((model) => ({
        id: model.id,
        name: model.id
      }));
    } catch (error) {
      return this.getProviderFallback('mistral');
    }
  }

  private static getApiKeyForProvider(provider: keyof ProviderModels): string | undefined {
    // Import configService to get API keys
    const { configService } = require('./configService');
    return configService.getApiKey(provider);
  }

  private static getProviderFallback(provider: keyof ProviderModels): ModelInfo[] {
    const fallbackModels = this.getFallbackModels();
    return (fallbackModels[provider] || []).map(id => ({ id, name: id }));
  }

  private static getFallbackModels(): Record<string, string[]> {
    return {
      openai: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'],
      anthropic: ['claude-3-sonnet-20240229', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'],
      openrouter: ['anthropic/claude-3-sonnet', 'openai/gpt-4o', 'meta-llama/llama-3-70b-instruct', 'mistralai/mistral-7b-instruct'],
      gemini: ['gemini-pro', 'gemini-pro-vision'],
      mistral: ['mistral-small', 'mistral-medium', 'mistral-large-latest']
    };
  }
}
