import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';
import { Email, EmailSchema } from '../schemas/email.schema';
import { Customer, CustomerSchema } from '../schemas/customer.schema';
import { CategoriesModule } from '../categories/categories.module';
import { EmailConnectionsModule } from '../email-connections/email-connections.module';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Email.name, schema: EmailSchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: '24h' },
    }),
    CategoriesModule,
    EmailConnectionsModule,
  ],
  controllers: [EmailsController],
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailsModule {}
