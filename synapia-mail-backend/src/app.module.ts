import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { EmailsModule } from './emails/emails.module';
import { GdprModule } from './gdpr/gdpr.module';
import { EmailConnectionsModule } from './email-connections/email-connections.module';
import { ConfigModule } from './config/config.module';
import { TestCronModule } from './test-cron/test-cron.module';
import { CustomersModule } from './customers/customers.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/synapia_mail_db'),
    ScheduleModule.forRoot(),
    AuthModule,
    CategoriesModule,
    EmailsModule,
    GdprModule,
    EmailConnectionsModule,
    ConfigModule,
    TestCronModule,
    CustomersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
