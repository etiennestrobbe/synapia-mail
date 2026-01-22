import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'openrouter' | 'gemini' | 'mistral';
  model: string;
  apiKey?: string;
}

export interface GlobalConfig {
  defaultProvider: LLMConfig['provider'];
  defaultModel: string;
  apiKeys: {
    openai?: string;
    anthropic?: string;
    openrouter?: string;
    gemini?: string;
    mistral?: string;
  };
}

class ConfigService {
  private config: GlobalConfig = {
    defaultProvider: 'openai',
    defaultModel: 'gpt-3.5-turbo',
    apiKeys: {}
  };

  constructor() {
    this.loadFromEnv();
  }

  private loadFromEnv() {
    this.config.defaultProvider = (process.env.LLM_PROVIDER as LLMConfig['provider']) || 'openai';
    this.config.defaultModel = process.env.LLM_DEFAULT_MODEL || 'gpt-3.5-turbo';
    this.config.apiKeys = {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      openrouter: process.env.OPENROUTER_API_KEY,
      gemini: process.env.GEMINI_API_KEY,
      mistral: process.env.MISTRAL_API_KEY
    };
  }

  getConfig(): GlobalConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<GlobalConfig>) {
    if (updates.defaultProvider) this.config.defaultProvider = updates.defaultProvider;
    if (updates.defaultModel) this.config.defaultModel = updates.defaultModel;
    if (updates.apiKeys) {
      this.config.apiKeys = { ...this.config.apiKeys, ...updates.apiKeys };
    }
  }

  getApiKey(provider: LLMConfig['provider']): string | undefined {
    return this.config.apiKeys[provider];
  }

  getDefaultConfig(): LLMConfig {
    return {
      provider: this.config.defaultProvider,
      model: this.config.defaultModel,
      apiKey: this.getApiKey(this.config.defaultProvider)
    };
  }
}

export const configService = new ConfigService();
