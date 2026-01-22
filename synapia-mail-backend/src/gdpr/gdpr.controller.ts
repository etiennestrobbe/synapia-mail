import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GdprService } from './gdpr.service';
import { AuditService } from '../common/services/audit.service';

@Controller('gdpr')
@UseGuards(JwtAuthGuard)
export class GdprController {
  constructor(
    private readonly gdprService: GdprService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * GDPR Right of Access (Art. 15)
   * User can request all personal data held about them
   */
  @Get('data-request')
  async getPersonalData(@Request() req) {
    const userId = req.user.customerId;
    const ip = req.ip;
    const userAgent = req.get('User-Agent');

    this.auditService.logSecurityEvent(
      'GDPR_DATA_ACCESS_REQUEST',
      { userId },
      ip,
      userId,
    );

    const data = await this.gdprService.getPersonalData(userId);
    return {
      message: 'Your personal data is ready for review',
      data,
      timestamp: new Date().toISOString(),
      rights: {
        access: 'You have the right to access your data',
        rectification: 'You can request data correction',
        erasure: 'You can request data deletion',
        portability: 'You can export your data',
        objection: 'You can object to processing',
      },
    };
  }

  /**
   * GDPR Right to Data Portability (Art. 20)
   * Export user data in machine-readable format
   */
  @Get('data-export')
  async exportPersonalData(@Request() req) {
    const userId = req.user.customerId;
    const ip = req.ip;

    this.auditService.logSecurityEvent(
      'GDPR_DATA_EXPORT_REQUEST',
      { userId },
      ip,
      userId,
    );

    const exportData = await this.gdprService.exportPersonalData(userId);

    // Set headers for file download
    return {
      message: 'Data export completed',
      exportData,
      format: 'JSON',
      timestamp: new Date().toISOString(),
      note: 'This export contains all personal data associated with your account.',
    };
  }

  /**
   * GDPR Right to Rectification (Art. 16)
   * Allow users to correct inaccurate personal data
   */
  @Put('rectify')
  async rectifyPersonalData(
    @Body() rectificationData: {
      field: 'name' | 'email';
      value: string;
    },
    @Request() req,
  ) {
    const userId = req.user.customerId;
    const ip = req.ip;

    // Validate rectification request
    if (!rectificationData.field || !rectificationData.value) {
      throw new BadRequestException('Field and value are required for rectification');
    }

    if (!['name', 'email'].includes(rectificationData.field)) {
      throw new BadRequestException('Only name and email fields can be rectified');
    }

    this.auditService.logSecurityEvent(
      'GDPR_DATA_RECTIFICATION',
      { userId, field: rectificationData.field },
      ip,
      userId,
    );

    const result = await this.gdprService.rectifyPersonalData(
      userId,
      rectificationData.field,
      rectificationData.value,
    );

    return {
      message: 'Data rectification request processed',
      field: rectificationData.field,
      success: result.success,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GDPR Right to Erasure ("Right to be Forgotten") (Art. 17)
   * Schedule account deletion (30-day grace period)
   */
  @Post('account-deletion')
  async requestAccountDeletion(
    @Body() deletionData: {
      reason?: string;
      confirmDeletion: boolean;
    },
    @Request() req,
  ) {
    const userId = req.user.customerId;
    const ip = req.ip;

    if (!deletionData.confirmDeletion) {
      throw new BadRequestException('Account deletion must be explicitly confirmed');
    }

    this.auditService.logSecurityEvent(
      'GDPR_ACCOUNT_DELETION_REQUEST',
      { userId, reason: deletionData.reason },
      ip,
      userId,
    );

    const deletionRequest = await this.gdprService.scheduleAccountDeletion(
      userId,
      deletionData.reason,
    );

    return {
      message: 'Account deletion request submitted',
      deletionScheduledFor: deletionRequest.scheduledDeletionDate,
      gracePeriodDays: 30,
      note: 'Your account will be deleted in 30 days. You can cancel this request during the grace period.',
      cancellationCode: deletionRequest.cancellationCode,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Cancel scheduled account deletion
   */
  @Post('cancel-deletion')
  async cancelAccountDeletion(
    @Body() cancelData: {
      cancellationCode: string;
    },
    @Request() req,
  ) {
    const userId = req.user.customerId;
    const ip = req.ip;

    if (!cancelData.cancellationCode) {
      throw new BadRequestException('Cancellation code is required');
    }

    this.auditService.logSecurityEvent(
      'GDPR_DELETION_CANCELLED',
      { userId },
      ip,
      userId,
    );

    const result = await this.gdprService.cancelAccountDeletion(
      userId,
      cancelData.cancellationCode,
    );

    return {
      message: 'Account deletion cancelled successfully',
      success: result.success,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GDPR Right to Object/Withdraw Consent (Art. 21/7)
   * Manage consent preferences
   */
  @Post('consent')
  async updateConsent(
    @Body() consentData: {
      marketingEmails?: boolean;
      analytics?: boolean;
      thirdPartySharing?: boolean;
    },
    @Request() req,
  ) {
    const userId = req.user.customerId;
    const ip = req.ip;

    this.auditService.logSecurityEvent(
      'GDPR_CONSENT_UPDATE',
      { userId, consentData },
      ip,
      userId,
    );

    const updatedConsent = await this.gdprService.updateConsent(
      userId,
      consentData,
    );

    return {
      message: 'Consent preferences updated',
      currentConsent: updatedConsent,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get current consent status
   */
  @Get('consent')
  async getConsentStatus(@Request() req) {
    const userId = req.user.customerId;
    const consent = await this.gdprService.getConsentStatus(userId);

    return {
      consent,
      timestamp: new Date().toISOString(),
      note: 'You can update your consent preferences using the POST /gdpr/consent endpoint',
    };
  }

  /**
   * Submit complaint or inquiry about data processing
   */
  @Post('complaint')
  async submitComplaint(
    @Body() complaintData: {
      subject: string;
      description: string;
      category: 'data_processing' | 'consent' | 'rights' | 'other';
    },
    @Request() req,
  ) {
    const userId = req.user.customerId;
    const ip = req.ip;

    if (!complaintData.subject || !complaintData.description) {
      throw new BadRequestException('Subject and description are required');
    }

    this.auditService.logSecurityEvent(
      'GDPR_COMPLAINT_SUBMITTED',
      { userId, category: complaintData.category },
      ip,
      userId,
    );

    const complaint = await this.gdprService.submitComplaint(
      userId,
      complaintData,
    );

    return {
      message: 'Your complaint has been submitted',
      complaintId: complaint.id,
      estimatedResponseTime: '30 days',
      timestamp: new Date().toISOString(),
      note: 'You will receive a response within 30 days as required by GDPR.',
    };
  }
}
