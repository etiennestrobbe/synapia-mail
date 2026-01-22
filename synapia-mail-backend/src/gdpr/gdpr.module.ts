import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { GdprController } from './gdpr.controller';
import { GdprService } from './gdpr.service';
import { AuditService } from '../common/services/audit.service';
import { GdprConsent, GdprConsentSchema } from '../schemas/gdpr-consent.schema';
import { GdprDeletionRequest, GdprDeletionRequestSchema } from '../schemas/gdpr-deletion-request.schema';
import { GdprComplaint, GdprComplaintSchema } from '../schemas/gdpr-complaint.schema';
import { Customer, CustomerSchema } from '../schemas/customer.schema';
import { Category, CategorySchema } from '../schemas/category.schema';
import { Email, EmailSchema } from '../schemas/email.schema';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: '24h' },
    }),
    MongooseModule.forFeature([
      { name: GdprConsent.name, schema: GdprConsentSchema },
      { name: GdprDeletionRequest.name, schema: GdprDeletionRequestSchema },
      { name: GdprComplaint.name, schema: GdprComplaintSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Email.name, schema: EmailSchema },
    ]),
  ],
  controllers: [GdprController],
  providers: [GdprService, AuditService],
  exports: [GdprService],
})
export class GdprModule {}
