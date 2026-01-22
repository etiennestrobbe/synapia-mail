import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Email, EmailDocument } from '../schemas/email.schema';
import { Customer, CustomerDocument } from '../schemas/customer.schema';
import { CategoriesService } from '../categories/categories.service';
import { EmailConnectionsService } from '../email-connections/email-connections.service';

interface OutlookMessage {
  id: string;
  subject: string;
  from: { emailAddress: { address: string } };
  body: { content: string };
  receivedDateTime: string;
}

interface CategorizationResult {
  category: string;
  confidence: number;
  isUrgent: boolean;
  urgencyLevel: string;
  reason: string;
  isNewCategory: boolean;
  newCategoryName?: string;
}

@Injectable()
export class EmailsService {
  constructor(
    @InjectModel(Email.name) private emailModel: Model<EmailDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private httpService: HttpService,
    private categoriesService: CategoriesService,
    private emailConnectionsService: EmailConnectionsService,
  ) {}

  async fetchAndCategorizeEmails(customerId: string): Promise<EmailDocument[]> {
    // Check credits
    const customer = await this.customerModel.findById(customerId);
    if (!customer || customer.creditsRemaining <= 0) {
      throw new BadRequestException('Insufficient credits');
    }

    // Fetch real emails from Outlook using stored connection
    const emails = await this.fetchEmailsFromOutlook(customerId);

    const categorizedEmails: EmailDocument[] = [];

    for (const email of emails) {
      // Check if already processed
      const existing = await this.emailModel.findOne({
        customerId,
        providerMessageId: email.id,
      });
      if (existing) continue;

      // Get categories
      const categories = await this.categoriesService.findAll(customerId);
      const categoryNames = categories.map(c => c.name);

      if (categoryNames.length === 0) {
        throw new BadRequestException('No categories defined');
      }

      // Get customer's confidence threshold
      const confidenceThreshold = customer.categorizationConfidenceThreshold;

      // Call IA backend for categorization (only send content temporarily)
      const categorizationResult = await this.categorizeEmail({
        subject: email.subject,
        body: email.body.content,
        from: email.from.emailAddress.address,
      }, categoryNames, confidenceThreshold);

      // If new category suggested, create it
      if (categorizationResult.isNewCategory && categorizationResult.newCategoryName) {
        try {
          await this.categoriesService.create(customerId, categorizationResult.newCategoryName);
          console.log(`Created new category: ${categorizationResult.newCategoryName}`);
        } catch (error) {
          console.error('Error creating new category:', error);
          // Continue with existing category
        }
      }

      // Deduct credit
      await this.customerModel.findByIdAndUpdate(customerId, {
        $inc: { creditsRemaining: -1 },
        updatedAt: new Date(),
      });

      // Save email (privacy-compliant - only metadata, no content)
      const newEmail = new this.emailModel({
        customerId,
        providerMessageId: email.id,
        provider: 'outlook',
        subject: email.subject,
        from: email.from.emailAddress.address,
        receivedAt: new Date(email.receivedDateTime),
        category: categorizationResult.category,
        confidence: categorizationResult.confidence,
        isUrgent: categorizationResult.isUrgent,
        urgencyLevel: categorizationResult.urgencyLevel,
        urgencyReason: categorizationResult.reason,
        isProcessed: true,
        processedAt: new Date(),
      });

      await newEmail.save();
      categorizedEmails.push(newEmail);
    }

    return categorizedEmails;
  }

  private async categorizeEmail(
    emailContent: { subject: string; body: string; from: string },
    categories: string[],
    confidenceThreshold: number,
  ): Promise<CategorizationResult> {
    try {
      const iaBackendUrl = process.env.IA_BACKEND_URL || 'http://localhost:3002';
      const apiKey = process.env.IA_BACKEND_API_KEY;

      const response = await firstValueFrom(
        this.httpService.post(`${iaBackendUrl}/api/agents/categorization/run`, {
          data: {
            categories: categories.length > 0 ? categories.join(',') : '',
            subject: emailContent.subject,
            from: emailContent.from,
            body: emailContent.body,
            confidenceThreshold,
          },
        }, {
          headers: {
            'X-API-Key': apiKey,
          },
        }),
      );
      return response.data.result;
    } catch (error) {
      console.error('IA Backend error:', error);
      // Fallback: assign first category or 'Uncategorized'
      return {
        category: categories.length > 0 ? categories[0] : 'Uncategorized',
        confidence: 0.5,
        isUrgent: false,
        urgencyLevel: 'low',
        reason: 'Fallback due to IA backend error',
        isNewCategory: false
      };
    }
  }

  async getCategorizedEmails(customerId: string): Promise<EmailDocument[]> {
    return this.emailModel.find({ customerId, isProcessed: true }).sort({ receivedAt: -1 });
  }

  async getCustomerCredits(customerId: string): Promise<{ remaining: number; total: number; warningThreshold: number }> {
    const customer = await this.customerModel.findById(customerId);
    if (!customer) throw new BadRequestException('Customer not found');

    return {
      remaining: customer.creditsRemaining,
      total: customer.totalCredits,
      warningThreshold: customer.warningThreshold,
    };
  }

  /**
   * Fetch recent emails from Outlook using Microsoft Graph API
   */
  private async fetchEmailsFromOutlook(customerId: string): Promise<OutlookMessage[]> {
    try {
      // Get valid access token for Outlook
      const accessToken = await this.emailConnectionsService.getValidAccessToken(customerId, 'outlook');

      if (!accessToken) {
        throw new BadRequestException('No valid Outlook connection found. Please connect your Outlook account first.');
      }

      // Fetch recent emails from Microsoft Graph API
      // Get emails from the last 7 days to avoid too many results
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const filter = `receivedDateTime ge ${sevenDaysAgo.toISOString()}`;
      const select = 'id,subject,from,receivedDateTime,body';
      const top = 50; // Limit to 50 emails for MVP

      const graphApiUrl = `https://graph.microsoft.com/v1.0/me/messages?$filter=${encodeURIComponent(filter)}&$select=${select}&$top=${top}&$orderby=receivedDateTime desc`;

      const response = await firstValueFrom(
        this.httpService.get(graphApiUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
      );

      const messages: OutlookMessage[] = response.data.value || [];

      // Filter out emails that are sent by the user themselves (replies, etc.)
      // and ensure we have the required fields
      const filteredMessages = messages.filter(message =>
        message.subject &&
        message.from?.emailAddress?.address &&
        message.receivedDateTime &&
        message.body?.content
      );

      return filteredMessages;

    } catch (error) {
      console.error('Error fetching emails from Outlook:', error);

      if (error.response?.status === 401) {
        throw new BadRequestException('Outlook access token expired. Please reconnect your account.');
      } else if (error.response?.status === 403) {
        throw new BadRequestException('Insufficient permissions to access Outlook emails.');
      } else {
        throw new BadRequestException('Failed to fetch emails from Outlook. Please try again later.');
      }
    }
  }
}
