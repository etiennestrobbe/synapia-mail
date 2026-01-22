import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from '../schemas/customer.schema';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { Email, EmailDocument } from '../schemas/email.schema';
import { GdprConsent, GdprConsentDocument } from '../schemas/gdpr-consent.schema';
import { GdprDeletionRequest, GdprDeletionRequestDocument } from '../schemas/gdpr-deletion-request.schema';
import { GdprComplaint, GdprComplaintDocument } from '../schemas/gdpr-complaint.schema';

@Injectable()
export class GdprService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Email.name) private emailModel: Model<EmailDocument>,
    @InjectModel(GdprConsent.name) private gdprConsentModel: Model<GdprConsentDocument>,
    @InjectModel(GdprDeletionRequest.name) private gdprDeletionRequestModel: Model<GdprDeletionRequestDocument>,
    @InjectModel(GdprComplaint.name) private gdprComplaintModel: Model<GdprComplaintDocument>,
  ) {}

  /**
   * GDPR Right of Access - Get all personal data
   */
  async getPersonalData(customerId: string) {
    const customer = await this.customerModel.findById(customerId).select('-password');
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const categories = await this.categoryModel.find({ customerId, isActive: true });
    const emailsCount = await this.emailModel.countDocuments({ customerId });
    const consent = await this.getConsentStatus(customerId);
    const deletionRequests = await this.gdprDeletionRequestModel.find({
      customerId,
      status: 'pending'
    });

    return {
      account: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        subscriptionPlan: customer.subscriptionPlan,
        creditsRemaining: customer.creditsRemaining,
        totalCredits: customer.totalCredits,
        isActive: customer.isActive,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
      categories: categories.map(cat => ({
        id: cat._id,
        name: cat.name,
        description: cat.description,
        createdAt: cat.createdAt,
      })),
      emails: {
        count: emailsCount,
        note: 'Email content is not included in data access requests for privacy reasons',
      },
      consent,
      deletionRequests: deletionRequests.map(req => ({
        id: req._id,
        reason: req.reason,
        scheduledDeletionDate: req.scheduledDeletionDate,
        status: req.status,
        createdAt: req.createdAt,
      })),
    };
  }

  /**
   * GDPR Right to Data Portability - Export data
   */
  async exportPersonalData(customerId: string) {
    const data = await this.getPersonalData(customerId);

    // Create exportable format
    return {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      customerId,
      data,
      metadata: {
        exporter: 'SynapIA Mail',
        format: 'GDPR Data Export',
        retention: 'Data retained for 1 year after export',
      },
    };
  }

  /**
   * GDPR Right to Rectification - Update personal data
   */
  async rectifyPersonalData(customerId: string, field: 'name' | 'email', value: string) {
    const updateData = { [field]: value, updatedAt: new Date() };

    const result = await this.customerModel.findByIdAndUpdate(
      customerId,
      updateData,
      { new: true }
    );

    if (!result) {
      throw new NotFoundException('Customer not found');
    }

    return { success: true, updatedField: field, newValue: value };
  }

  /**
   * GDPR Right to Erasure - Schedule account deletion
   */
  async scheduleAccountDeletion(customerId: string, reason?: string) {
    // Check if deletion is already scheduled
    const existingRequest = await this.gdprDeletionRequestModel.findOne({
      customerId,
      status: 'pending'
    });

    if (existingRequest) {
      throw new Error('Account deletion is already scheduled');
    }

    // Generate cancellation code
    const cancellationCode = this.generateCancellationCode();

    // Schedule deletion for 30 days from now
    const scheduledDeletionDate = new Date();
    scheduledDeletionDate.setDate(scheduledDeletionDate.getDate() + 30);

    const deletionRequest = new this.gdprDeletionRequestModel({
      customerId,
      reason,
      scheduledDeletionDate,
      cancellationCode,
      status: 'pending',
    });

    await deletionRequest.save();

    return {
      id: deletionRequest._id,
      scheduledDeletionDate,
      cancellationCode,
    };
  }

  /**
   * Cancel scheduled account deletion
   */
  async cancelAccountDeletion(customerId: string, cancellationCode: string) {
    const deletionRequest = await this.gdprDeletionRequestModel.findOne({
      customerId,
      cancellationCode,
      status: 'pending'
    });

    if (!deletionRequest) {
      throw new NotFoundException('Invalid cancellation code or no pending deletion');
    }

    await this.gdprDeletionRequestModel.findByIdAndUpdate(
      deletionRequest._id,
      { status: 'cancelled', cancelledAt: new Date() }
    );

    return { success: true };
  }

  /**
   * GDPR Consent Management
   */
  async updateConsent(customerId: string, consentData: {
    marketingEmails?: boolean;
    analytics?: boolean;
    thirdPartySharing?: boolean;
  }) {
    const consent = await this.gdprConsentModel.findOneAndUpdate(
      { customerId },
      {
        ...consentData,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return {
      marketingEmails: consent.marketingEmails ?? false,
      analytics: consent.analytics ?? false,
      thirdPartySharing: consent.thirdPartySharing ?? false,
      updatedAt: consent.updatedAt,
    };
  }

  async getConsentStatus(customerId: string) {
    const consent = await this.gdprConsentModel.findOne({ customerId });

    return {
      marketingEmails: consent?.marketingEmails ?? false,
      analytics: consent?.analytics ?? false,
      thirdPartySharing: consent?.thirdPartySharing ?? false,
      lastUpdated: consent?.updatedAt,
    };
  }

  /**
   * Submit GDPR complaint
   */
  async submitComplaint(customerId: string, complaintData: {
    subject: string;
    description: string;
    category: string;
  }) {
    const complaint = new this.gdprComplaintModel({
      customerId,
      subject: complaintData.subject,
      description: complaintData.description,
      category: complaintData.category,
      status: 'submitted',
    });

    await complaint.save();

    return {
      id: complaint._id,
      submittedAt: complaint.createdAt,
      status: complaint.status,
    };
  }

  /**
   * Execute account deletion (called by scheduled job)
   */
  async executeAccountDeletion(customerId: string) {
    // Anonymize customer data
    await this.customerModel.findByIdAndUpdate(customerId, {
      name: '[DELETED]',
      email: `[DELETED-${customerId}]@deleted.synapia.local`,
      password: '[DELETED]',
      outlookAccessToken: '[DELETED]',
      outlookRefreshToken: '[DELETED]',
      isActive: false,
      deletedAt: new Date(),
    });

    // Delete categories
    await this.categoryModel.updateMany(
      { customerId },
      { isActive: false, deletedAt: new Date() }
    );

    // Delete emails (or anonymize)
    await this.emailModel.updateMany(
      { customerId },
      { isActive: false, deletedAt: new Date() }
    );

    // Mark deletion as completed
    await this.gdprDeletionRequestModel.updateMany(
      { customerId, status: 'pending' },
      { status: 'completed', executedAt: new Date() }
    );

    return { success: true };
  }

  private generateCancellationCode(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}
