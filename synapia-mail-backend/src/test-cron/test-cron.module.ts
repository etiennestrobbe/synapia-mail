import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestCronService } from './test-cron.service';
import { Email, EmailSchema } from '../schemas/email.schema';
import { Customer, CustomerSchema } from '../schemas/customer.schema';
import { EmailsModule } from '../emails/emails.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Email.name, schema: EmailSchema },
      { name: Customer.name, schema: CustomerSchema }
    ]),
    EmailsModule,
    ConfigModule,
  ],
  providers: [TestCronService],
})
export class TestCronModule {}
