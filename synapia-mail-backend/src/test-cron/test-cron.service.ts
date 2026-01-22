import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email, EmailDocument } from '../schemas/email.schema';
import { Customer, CustomerDocument } from '../schemas/customer.schema';
import { EmailsService } from '../emails/emails.service';
import { ConfigService } from '../config/config.service';
import * as fs from 'fs';
import * as path from 'path';

interface FakeEmail {
  subject: string;
  body: string;
  from: string;
}

@Injectable()
export class TestCronService {
  private readonly logger = new Logger(TestCronService.name);
  private emailIndex = 0;
  private allEmails: FakeEmail[] = [];

  constructor(
    @InjectModel(Email.name) private emailModel: Model<EmailDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private emailsService: EmailsService,
    private configService: ConfigService,
  ) {
    this.loadEmails();
  }

  private loadEmails() {
    // For now, embed some test emails directly in the code to get the system working
    this.allEmails = [
      {
        subject: "Project Deadline Extension Request",
        body: "Dear Team, I need to request a 2-week extension on the Q4 project deadline due to unforeseen technical challenges. The database migration is taking longer than anticipated. Please let me know if this is feasible. Best regards, John Smith",
        from: "john.smith@techcorp.com"
      },
      {
        subject: "URGENT: Server Maintenance Tonight",
        body: "Attention: The main production server will undergo scheduled maintenance tonight from 11 PM to 2 AM. All services will be unavailable during this time. Please plan accordingly and save your work. Contact IT support if you have any questions.",
        from: "it.support@techcorp.com"
      },
      {
        subject: "Family Dinner This Weekend",
        body: "Hi Mom, Dad asked if we could have family dinner this Saturday at 6 PM. He wants to try that new Italian restaurant downtown. Let me know if you're free. Love, Sarah",
        from: "sarah.family@gmail.com"
      },
      {
        subject: "WIN A FREE IPHONE NOW!!!",
        body: "Congratulations! You have been selected as our lucky winner. Click here to claim your prize! Limited time offer!",
        from: "winner@lottery.com"
      },
      {
        subject: "EMERGENCY: Server Down",
        body: "CRITICAL ALERT: Our main production server has gone down. All services are affected. IT team is working on it urgently.",
        from: "alert@company.com"
      }
    ];

    this.logger.log(`Loaded ${this.allEmails.length} embedded test emails`);

    // TODO: In the future, load from files when path issues are resolved
    /*
    const dataDir = path.resolve(__dirname, 'data');
    // ... file loading logic
    */
  }

  @Cron(process.env.TEST_CRON_INTERVAL_SECONDS ?
    `*/${process.env.TEST_CRON_INTERVAL_SECONDS} * * * * *` :
    CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    try {
      if (this.allEmails.length === 0) {
        this.logger.warn('No fake emails loaded. Skipping cron job.');
        return;
      }

      // Get next email from pool
      const fakeEmail = this.allEmails[this.emailIndex % this.allEmails.length];
      this.emailIndex++;

      this.logger.log(`Processing fake email ${this.emailIndex}/${this.allEmails.length}: ${fakeEmail.subject}`);

      // Get ALL active customers
      const customers = await this.customerModel.find({ isActive: true });

      if (customers.length === 0) {
        this.logger.warn('No active customers found. Skipping cron job.');
        return;
      }

      // Process email for each customer
      for (const customer of customers) {
        try {
          this.logger.log(`Processing for customer: ${customer.name} (${customer.email})`);

          // Get customer's existing categories (can be empty)
          const categories = await this.emailsService['categoriesService'].findAll(customer._id.toString());
          const categoryNames = categories.map(c => c.name);

          // Get confidence threshold
          const confidenceThreshold = customer.categorizationConfidenceThreshold;

          // Always call IA backend - let it decide categories
          const categorizationResult = await this.emailsService['categorizeEmail']({
            subject: fakeEmail.subject,
            body: fakeEmail.body,
            from: fakeEmail.from,
          }, categoryNames, confidenceThreshold);

          // If new category suggested, create it
          if (categorizationResult.isNewCategory && categorizationResult.newCategoryName) {
            try {
              await this.emailsService['categoriesService'].create(customer._id.toString(), categorizationResult.newCategoryName);
              this.logger.log(`Created new category for ${customer.name}: ${categorizationResult.newCategoryName}`);
            } catch (error) {
              this.logger.error(`Error creating new category for ${customer.name}:`, error);
            }
          }

          // Deduct credit (if available)
          if (customer.creditsRemaining > 0) {
            await this.customerModel.findByIdAndUpdate(customer._id, {
              $inc: { creditsRemaining: -1 },
              updatedAt: new Date(),
            });
          }

          // Save email for this customer
          const newEmail = new this.emailModel({
            customerId: customer._id.toString(),
            providerMessageId: `test-${Date.now()}-${this.emailIndex}-${customer._id}`,
            provider: 'test',
            subject: fakeEmail.subject,
            from: fakeEmail.from,
            receivedAt: new Date(),
            category: categorizationResult.category,
            confidence: categorizationResult.confidence,
            isUrgent: categorizationResult.isUrgent,
            urgencyLevel: categorizationResult.urgencyLevel,
            urgencyReason: categorizationResult.reason,
            isProcessed: true,
            processedAt: new Date(),
          });

          await newEmail.save();

          this.logger.log(`✓ ${customer.name}: ${fakeEmail.subject} -> ${categorizationResult.category} (${categorizationResult.confidence})`);

        } catch (customerError) {
          this.logger.error(`Error processing email for customer ${customer.name}:`, customerError);
          // Continue with next customer
        }
      }

    } catch (error) {
      this.logger.error('Error in test cron job:', error);
    }
  }
}
