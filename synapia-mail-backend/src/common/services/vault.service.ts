import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class VaultService {
  private readonly logger = new Logger(VaultService.name);
  private readonly vaultUrl: string;
  private readonly vaultToken: string;
  private readonly encryptionKey: string;

  constructor(private configService: ConfigService) {
    // For development, use environment variables
    // In production, these would come from secure config
    this.vaultUrl = this.configService.get<string>('VAULT_URL', 'http://localhost:8200');
    this.vaultToken = this.configService.get<string>('VAULT_TOKEN', 'dev-token');
    this.encryptionKey = this.configService.get<string>('ENCRYPTION_KEY', 'default-dev-key-change-in-production');

    this.logger.log('VaultService initialized', {
      vaultUrl: this.vaultUrl,
      hasToken: !!this.vaultToken,
    });
  }

  /**
   * Store encrypted data in vault
   */
  async storeSecret(key: string, data: any): Promise<string> {
    try {
      // Encrypt the data
      const encryptedData = this.encryptData(data);

      // Generate unique vault path
      const vaultPath = `secret/synapia-mail/${key}`;

      // In development, we'll use a simple in-memory store
      // In production, this would call the actual vault API
      const vaultKey = this.generateVaultKey(key);

      // Store in "vault" (for now, just log - in production would call vault API)
      this.logger.log(`Storing secret in vault: ${vaultKey}`, { path: vaultPath });

      // Simulate vault storage
      await this.simulateVaultStorage(vaultKey, encryptedData);

      return vaultKey;
    } catch (error) {
      this.logger.error(`Failed to store secret: ${key}`, error);
      throw new Error('Failed to store secret in vault');
    }
  }

  /**
   * Retrieve and decrypt data from vault
   */
  async retrieveSecret(vaultKey: string): Promise<any> {
    try {
      // In development, simulate vault retrieval
      // In production, this would call the actual vault API
      this.logger.log(`Retrieving secret from vault: ${vaultKey}`);

      const encryptedData = await this.simulateVaultRetrieval(vaultKey);

      if (!encryptedData) {
        throw new Error('Secret not found in vault');
      }

      // Decrypt the data
      return this.decryptData(encryptedData);
    } catch (error) {
      this.logger.error(`Failed to retrieve secret: ${vaultKey}`, error);
      throw new Error('Failed to retrieve secret from vault');
    }
  }

  /**
   * Delete secret from vault
   */
  async deleteSecret(vaultKey: string): Promise<void> {
    try {
      this.logger.log(`Deleting secret from vault: ${vaultKey}`);

      // In development, simulate vault deletion
      // In production, this would call the actual vault API
      await this.simulateVaultDeletion(vaultKey);
    } catch (error) {
      this.logger.error(`Failed to delete secret: ${vaultKey}`, error);
      throw new Error('Failed to delete secret from vault');
    }
  }

  /**
   * Update existing secret in vault
   */
  async updateSecret(vaultKey: string, newData: any): Promise<void> {
    try {
      const encryptedData = this.encryptData(newData);
      await this.simulateVaultStorage(vaultKey, encryptedData);
      this.logger.log(`Updated secret in vault: ${vaultKey}`);
    } catch (error) {
      this.logger.error(`Failed to update secret: ${vaultKey}`, error);
      throw new Error('Failed to update secret in vault');
    }
  }

  /**
   * Encrypt data using AES-256
   */
  private encryptData(data: any): string {
    try {
      const jsonData = JSON.stringify(data);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32)), iv);
      let encrypted = cipher.update(jsonData, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      this.logger.error('Encryption failed', error);
      throw new Error('Data encryption failed');
    }
  }

  /**
   * Decrypt data using AES-256
   */
  private decryptData(encryptedData: string): any {
    try {
      const parts = encryptedData.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32)), iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      this.logger.error('Decryption failed', error);
      throw new Error('Data decryption failed');
    }
  }

  /**
   * Generate unique vault key
   */
  private generateVaultKey(baseKey: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${baseKey}_${timestamp}_${random}`;
  }

  /**
   * Simulate vault storage (development only)
   * In production, this would make HTTP calls to the actual vault
   */
  private async simulateVaultStorage(key: string, data: string): Promise<void> {
    // In development, we'll use a simple in-memory store
    // In production, this would be replaced with actual vault API calls
    if (!global.vaultStore) {
      global.vaultStore = new Map();
    }

    global.vaultStore.set(key, {
      data,
      createdAt: new Date(),
      metadata: {
        customerId: 'development',
        purpose: 'email-oauth-tokens'
      }
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  /**
   * Simulate vault retrieval (development only)
   */
  private async simulateVaultRetrieval(key: string): Promise<string | null> {
    if (!global.vaultStore) {
      return null;
    }

    const entry = global.vaultStore.get(key);
    if (!entry) {
      return null;
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 5));

    return entry.data;
  }

  /**
   * Simulate vault deletion (development only)
   */
  private async simulateVaultDeletion(key: string): Promise<void> {
    if (global.vaultStore) {
      global.vaultStore.delete(key);
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 5));
  }

  /**
   * Health check for vault connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      // In development, always return true
      // In production, would check actual vault connectivity
      return true;
    } catch (error) {
      this.logger.error('Vault health check failed', error);
      return false;
    }
  }
}
