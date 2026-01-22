import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { EmailConnection, EmailConnectionDocument } from '../schemas/email-connection.schema';
import { VaultService } from '../common/services/vault.service';
import { AuditService } from '../common/services/audit.service';

interface OutlookTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface OutlookUserInfo {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
}

@Injectable()
export class EmailConnectionsService {
  private readonly logger = new Logger(EmailConnectionsService.name);

  // Microsoft OAuth configuration
  private clientId: string;
  private clientSecret: string;
  private tenantId: string;
  private redirectUri: string;
  private readonly microsoftGraphUrl = 'https://graph.microsoft.com/v1.0';
  private readonly microsoftOAuthUrl = 'https://login.microsoftonline.com';

  constructor(
    @InjectModel(EmailConnection.name) private emailConnectionModel: Model<EmailConnectionDocument>,
    private httpService: HttpService,
    private configService: ConfigService,
    private vaultService: VaultService,
    private auditService: AuditService,
  ) {
    // Load Microsoft OAuth configuration
    this.clientId = this.configService.get<string>('MICROSOFT_CLIENT_ID')!;
    this.clientSecret = this.configService.get<string>('MICROSOFT_CLIENT_SECRET')!;
    this.tenantId = this.configService.get<string>('MICROSOFT_TENANT_ID', 'common');
    this.redirectUri = this.configService.get<string>('MICROSOFT_REDIRECT_URI')!;

    // Validate required configuration
    if (!this.clientId) {
      throw new Error('MICROSOFT_CLIENT_ID environment variable is required');
    }
    if (!this.clientSecret) {
      throw new Error('MICROSOFT_CLIENT_SECRET environment variable is required');
    }
    if (!this.redirectUri) {
      throw new Error('MICROSOFT_REDIRECT_URI environment variable is required');
    }

    this.logger.log('EmailConnectionsService initialized', {
      clientId: this.clientId ? 'configured' : 'missing',
      tenantId: this.tenantId,
      redirectUri: this.redirectUri,
    });
  }

  /**
   * Get OAuth authorization URL for Microsoft Outlook
   */
  getOutlookAuthUrl(customerId: string): { authUrl: string; state: string } {
    const state = this.generateState(customerId);
    const scope = 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/User.Read offline_access';

    const authUrl = `${this.microsoftOAuthUrl}/${this.tenantId}/oauth2/v2.0/authorize?` +
      new URLSearchParams({
        client_id: this.clientId,
        response_type: 'code',
        redirect_uri: this.redirectUri,
        scope: scope,
        state: state,
        prompt: 'consent',
        response_mode: 'query',
      }).toString();

    return { authUrl, state };
  }

  /**
   * Handle Outlook OAuth callback
   */
  async handleOutlookCallback(code: string, state: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validate state parameter
      const customerId = this.validateState(state);
      if (!customerId) {
        throw new BadRequestException('Invalid state parameter');
      }

      // Exchange authorization code for tokens
      const tokenResponse = await this.exchangeCodeForTokens(code);

      // Get user information
      const userInfo = await this.getOutlookUserInfo(tokenResponse.access_token);

      // Store tokens securely in vault
      const accessTokenVaultKey = await this.vaultService.storeSecret(
        `outlook_access_${customerId}`,
        { token: tokenResponse.access_token, type: 'access' }
      );

      const refreshTokenVaultKey = await this.vaultService.storeSecret(
        `outlook_refresh_${customerId}`,
        { token: tokenResponse.refresh_token, type: 'refresh' }
      );

      // Calculate token expiration
      const accessTokenExpiresAt = new Date();
      accessTokenExpiresAt.setSeconds(accessTokenExpiresAt.getSeconds() + tokenResponse.expires_in);

      // Create or update email connection
      await this.emailConnectionModel.findOneAndUpdate(
        { customerId, provider: 'outlook' },
        {
          providerUserId: userInfo.id,
          providerEmail: userInfo.mail,
          accessTokenVaultKey,
          refreshTokenVaultKey,
          accessTokenExpiresAt,
          scope: tokenResponse.scope,
          status: 'active',
          connectedAt: new Date(),
          lastSyncAt: new Date(),
          oauthState: null, // Clear state after successful connection
        },
        { upsert: true, new: true }
      );

      // Audit the successful connection
      this.auditService.logSecurityEvent(
        'EMAIL_CONNECTION_ESTABLISHED',
        {
          provider: 'outlook',
          userId: userInfo.id,
          email: userInfo.mail
        },
        'system',
        customerId
      );

      return {
        success: true,
        message: `Successfully connected to Outlook account: ${userInfo.mail}`
      };

    } catch (error) {
      this.logger.error('Outlook OAuth callback failed', error);

      // Audit the failed connection attempt
      this.auditService.logSecurityEvent(
        'EMAIL_CONNECTION_FAILED',
        { provider: 'outlook', error: error.message },
        'system'
      );

      return {
        success: false,
        message: 'Failed to connect Outlook account. Please try again.'
      };
    }
  }

  /**
   * Get all email connections for a customer
   */
  async getEmailConnections(customerId: string): Promise<EmailConnectionDocument[]> {
    return this.emailConnectionModel.find({ customerId }).select('-oauthState -accessTokenVaultKey -refreshTokenVaultKey');
  }

  /**
   * Get specific email connection
   */
  async getEmailConnection(customerId: string, connectionId: string): Promise<EmailConnectionDocument> {
    const connection = await this.emailConnectionModel.findOne({
      _id: connectionId,
      customerId
    });

    if (!connection) {
      throw new NotFoundException('Email connection not found');
    }

    return connection;
  }

  /**
   * Disconnect email connection
   */
  async disconnectEmailConnection(customerId: string, connectionId: string): Promise<void> {
    const connection = await this.emailConnectionModel.findOne({
      _id: connectionId,
      customerId
    });

    if (!connection) {
      throw new NotFoundException('Email connection not found');
    }

    // Revoke tokens if possible (Microsoft doesn't support token revocation via API)
    // Delete tokens from vault
    if (connection.accessTokenVaultKey) {
      await this.vaultService.deleteSecret(connection.accessTokenVaultKey);
    }
    if (connection.refreshTokenVaultKey) {
      await this.vaultService.deleteSecret(connection.refreshTokenVaultKey);
    }

    // Update connection status
    await this.emailConnectionModel.findByIdAndUpdate(connectionId, {
      status: 'revoked',
      disconnectedAt: new Date(),
      disconnectReason: 'User initiated disconnection',
    });

    // Audit the disconnection
    this.auditService.logSecurityEvent(
      'EMAIL_CONNECTION_REVOKED',
      {
        provider: connection.provider,
        connectionId: connectionId
      },
      'system',
      customerId
    );
  }

  /**
   * Refresh expired access token using refresh token
   */
  async refreshAccessToken(connection: EmailConnectionDocument): Promise<boolean> {
    try {
      if (!connection.refreshTokenVaultKey) {
        throw new Error('No refresh token available');
      }

      // Get refresh token from vault
      const refreshTokenData = await this.vaultService.retrieveSecret(connection.refreshTokenVaultKey);
      const refreshToken = refreshTokenData.token;

      // Exchange refresh token for new access token
      const tokenResponse = await this.refreshOutlookTokens(refreshToken);

      // Store new tokens
      const newAccessTokenVaultKey = await this.vaultService.storeSecret(
        `outlook_access_${connection.customerId}`,
        { token: tokenResponse.access_token, type: 'access' }
      );

      const newRefreshTokenVaultKey = await this.vaultService.storeSecret(
        `outlook_refresh_${connection.customerId}`,
        { token: tokenResponse.refresh_token, type: 'refresh' }
      );

      // Update connection with new tokens
      const accessTokenExpiresAt = new Date();
      accessTokenExpiresAt.setSeconds(accessTokenExpiresAt.getSeconds() + tokenResponse.expires_in);

      await this.emailConnectionModel.findByIdAndUpdate(connection._id, {
        accessTokenVaultKey: newAccessTokenVaultKey,
        refreshTokenVaultKey: newRefreshTokenVaultKey,
        accessTokenExpiresAt,
        tokenRefreshCount: (connection.tokenRefreshCount || 0) + 1,
        lastSyncAt: new Date(),
      });

      // Delete old tokens
      await this.vaultService.deleteSecret(connection.accessTokenVaultKey);
      await this.vaultService.deleteSecret(connection.refreshTokenVaultKey);

      this.logger.log(`Refreshed tokens for connection ${connection._id}`);
      return true;

    } catch (error) {
      this.logger.error(`Token refresh failed for connection ${connection._id}`, error);

      // Mark connection as expired if refresh fails
      await this.emailConnectionModel.findByIdAndUpdate(connection._id, {
        status: 'expired',
        lastSyncError: `Token refresh failed: ${error.message}`,
      });

      return false;
    }
  }

  /**
   * Get valid access token for a connection (refresh if needed)
   */
  async getValidAccessToken(customerId: string, provider: string): Promise<string | null> {
    const connection = await this.emailConnectionModel.findOne({
      customerId,
      provider,
      status: 'active'
    });

    if (!connection) {
      return null;
    }

    // Check if access token is expired or will expire soon (within 5 minutes)
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (connection.accessTokenExpiresAt && connection.accessTokenExpiresAt <= fiveMinutesFromNow) {
      // Token expired or expiring soon, refresh it
      const refreshed = await this.refreshAccessToken(connection);
      if (!refreshed) {
        return null;
      }

      // Re-fetch the updated connection
      const updatedConnection = await this.emailConnectionModel.findById(connection._id);
      if (!updatedConnection?.accessTokenVaultKey) {
        return null;
      }

      const tokenData = await this.vaultService.retrieveSecret(updatedConnection.accessTokenVaultKey);
      return tokenData.token;
    }

    // Token is still valid
    if (!connection.accessTokenVaultKey) {
      return null;
    }

    const tokenData = await this.vaultService.retrieveSecret(connection.accessTokenVaultKey);
    return tokenData.token;
  }

  // Private helper methods

  private generateState(customerId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${customerId}_${timestamp}_${random}`;
  }

  private validateState(state: string): string | null {
    try {
      const parts = state.split('_');
      if (parts.length !== 3) return null;

      const customerId = parts[0];
      const timestamp = parseInt(parts[1]);

      // Check if state is not too old (30 minutes max)
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000;

      if (now - timestamp > thirtyMinutes) {
        return null;
      }

      return customerId;
    } catch {
      return null;
    }
  }

  private async exchangeCodeForTokens(code: string): Promise<OutlookTokenResponse> {
    const tokenUrl = `${this.microsoftOAuthUrl}/${this.tenantId}/oauth2/v2.0/token`;

    const response = await firstValueFrom(
      this.httpService.post(tokenUrl, new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
    );

    return response.data;
  }

  private async refreshOutlookTokens(refreshToken: string): Promise<OutlookTokenResponse> {
    const tokenUrl = `${this.microsoftOAuthUrl}/${this.tenantId}/oauth2/v2.0/token`;

    const response = await firstValueFrom(
      this.httpService.post(tokenUrl, new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
    );

    return response.data;
  }

  private async getOutlookUserInfo(accessToken: string): Promise<OutlookUserInfo> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.microsoftGraphUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
    );

    return response.data;
  }
}
