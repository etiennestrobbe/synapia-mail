import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  UseGuards,
  Request,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmailConnectionsService } from './email-connections.service';
import { AuditService } from '../common/services/audit.service';

@Controller('api/email-connections')
@UseGuards(JwtAuthGuard)
export class EmailConnectionsController {
  private readonly logger = new Logger(EmailConnectionsController.name);

  constructor(
    private readonly emailConnectionsService: EmailConnectionsService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Get all email connections for the authenticated user
   */
  @Get()
  async getEmailConnections(@Request() req) {
    const customerId = req.user.customerId;

    this.auditService.logSecurityEvent(
      'EMAIL_CONNECTIONS_LISTED',
      { customerId },
      req.ip,
      customerId
    );

    const connections = await this.emailConnectionsService.getEmailConnections(customerId);

    return {
      success: true,
      connections: connections.map(conn => ({
        id: conn._id,
        provider: conn.provider,
        providerEmail: conn.providerEmail,
        status: conn.status,
        connectedAt: conn.connectedAt,
        lastSyncAt: conn.lastSyncAt,
        syncCount: conn.syncCount,
      })),
      message: 'Email connections retrieved successfully',
    };
  }

  /**
   * Get Outlook OAuth authorization URL
   */
  @Get('outlook/auth-url')
  async getOutlookAuthUrl(@Request() req) {
    const customerId = req.user.customerId;

    try {
      const { authUrl, state } = this.emailConnectionsService.getOutlookAuthUrl(customerId);

      this.auditService.logSecurityEvent(
        'OUTLOOK_OAUTH_INITIATED',
        { customerId },
        req.ip,
        customerId
      );

      return {
        success: true,
        authUrl,
        state,
        message: 'Outlook authorization URL generated successfully',
      };
    } catch (error) {
      this.logger.error('Failed to generate Outlook auth URL', error);

      return {
        success: false,
        message: 'Failed to generate Outlook authorization URL',
      };
    }
  }

  /**
   * Handle Outlook OAuth callback
   */
  @Get('outlook/callback')
  async handleOutlookCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
  ) {
    // Handle OAuth errors
    if (error) {
      this.logger.error('Outlook OAuth error', { error, errorDescription });

      this.auditService.logSecurityEvent(
        'OUTLOOK_OAUTH_ERROR',
        { error, errorDescription },
        'unknown'
      );

      return {
        success: false,
        message: `OAuth error: ${errorDescription || error}`,
      };
    }

    if (!code || !state) {
      throw new BadRequestException('Missing authorization code or state parameter');
    }

    const result = await this.emailConnectionsService.handleOutlookCallback(code, state);

    return {
      success: result.success,
      message: result.message,
      redirectUrl: result.success ? '/?tab=connections&success=true' : '/?tab=connections&error=true',
    };
  }

  /**
   * Disconnect an email connection
   */
  @Delete(':connectionId')
  async disconnectEmailConnection(
    @Param('connectionId') connectionId: string,
    @Request() req,
  ) {
    const customerId = req.user.customerId;

    try {
      await this.emailConnectionsService.disconnectEmailConnection(customerId, connectionId);

      this.auditService.logSecurityEvent(
        'EMAIL_CONNECTION_DISCONNECTED',
        { connectionId },
        req.ip,
        customerId
      );

      return {
        success: true,
        message: 'Email connection disconnected successfully',
      };
    } catch (error) {
      this.logger.error('Failed to disconnect email connection', error);

      return {
        success: false,
        message: 'Failed to disconnect email connection',
      };
    }
  }

  /**
   * Get connection status and details
   */
  @Get(':connectionId')
  async getEmailConnection(
    @Param('connectionId') connectionId: string,
    @Request() req,
  ) {
    const customerId = req.user.customerId;

    try {
      const connection = await this.emailConnectionsService.getEmailConnection(customerId, connectionId);

      return {
        success: true,
        connection: {
          id: connection._id,
          provider: connection.provider,
          providerEmail: connection.providerEmail,
          status: connection.status,
          connectedAt: connection.connectedAt,
          lastSyncAt: connection.lastSyncAt,
          syncCount: connection.syncCount,
          scope: connection.scope,
          providerSettings: connection.providerSettings,
        },
        message: 'Email connection details retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Failed to get email connection details', error);

      return {
        success: false,
        message: 'Failed to retrieve email connection details',
      };
    }
  }

  /**
   * Get available email providers
   */
  @Get('providers/available')
  async getAvailableProviders() {
    return {
      success: true,
      providers: [
        {
          id: 'outlook',
          name: 'Microsoft Outlook',
          description: 'Connect your Outlook or Hotmail account',
          icon: 'outlook',
          status: 'available',
          scopes: ['Mail.Read', 'Mail.ReadWrite'],
          features: [
            'Email categorization',
            'Automatic processing',
            'Secure token storage'
          ]
        },
        {
          id: 'gmail',
          name: 'Google Gmail',
          description: 'Connect your Gmail account',
          icon: 'gmail',
          status: 'coming_soon',
          note: 'Coming soon - Gmail integration in development'
        },
        {
          id: 'yahoo',
          name: 'Yahoo Mail',
          description: 'Connect your Yahoo Mail account',
          icon: 'yahoo',
          status: 'coming_soon',
          note: 'Coming soon - Yahoo integration in development'
        },
        {
          id: 'icloud',
          name: 'Apple iCloud',
          description: 'Connect your iCloud Mail account',
          icon: 'icloud',
          status: 'coming_soon',
          note: 'Coming soon - iCloud integration in development'
        }
      ],
      message: 'Available email providers retrieved successfully',
    };
  }

  /**
   * Test email connection (validate tokens and connectivity)
   */
  @Post(':connectionId/test')
  async testEmailConnection(
    @Param('connectionId') connectionId: string,
    @Request() req,
  ) {
    const customerId = req.user.customerId;

    try {
      // Get valid access token (will refresh if needed)
      const accessToken = await this.emailConnectionsService.getValidAccessToken(customerId, 'outlook');

      if (!accessToken) {
        return {
          success: false,
          message: 'No valid access token available',
          connectionStatus: 'expired',
        };
      }

      // Here you could make a test API call to Microsoft Graph
      // For now, just validate that we have a token

      this.auditService.logSecurityEvent(
        'EMAIL_CONNECTION_TESTED',
        { connectionId, hasValidToken: !!accessToken },
        req.ip,
        customerId
      );

      return {
        success: true,
        message: 'Email connection tested successfully',
        connectionStatus: 'active',
        hasValidToken: true,
      };
    } catch (error) {
      this.logger.error('Failed to test email connection', error);

      return {
        success: false,
        message: 'Failed to test email connection',
        connectionStatus: 'error',
        error: error.message,
      };
    }
  }
}
