import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { EmailConnectionsController } from './email-connections.controller';
import { EmailConnectionsService } from './email-connections.service';
import { AuditService } from '../common/services/audit.service';
import { VaultService } from '../common/services/vault.service';
import { EmailConnection, EmailConnectionSchema } from '../schemas/email-connection.schema';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: '24h' },
    }),
    HttpModule.register({
      timeout: 30000, // 30 seconds for OAuth requests
      maxRedirects: 5,
    }),
    MongooseModule.forFeature([
      { name: EmailConnection.name, schema: EmailConnectionSchema },
    ]),
  ],
  controllers: [EmailConnectionsController],
  providers: [EmailConnectionsService, AuditService, VaultService],
  exports: [EmailConnectionsService],
})
export class EmailConnectionsModule {}
