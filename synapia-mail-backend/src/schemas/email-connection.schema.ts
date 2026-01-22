import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailConnectionDocument = EmailConnection & Document;

@Schema({ timestamps: true })
export class EmailConnection {
  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true, enum: ['outlook', 'gmail', 'yahoo', 'icloud'] })
  provider: string;

  @Prop({
    required: true,
    enum: ['active', 'inactive', 'error', 'expired', 'revoked'],
    default: 'active'
  })
  status: 'active' | 'inactive' | 'error' | 'expired' | 'revoked';

  // Provider-specific identifiers
  @Prop({ required: true })
  providerUserId: string; // Outlook user ID, Gmail user ID, etc.

  @Prop()
  providerEmail?: string; // Primary email address from provider

  // Secure token references (encrypted vault keys)
  @Prop({ required: true })
  accessTokenVaultKey: string; // Reference to encrypted access token in vault

  @Prop()
  refreshTokenVaultKey?: string; // Reference to encrypted refresh token in vault

  @Prop({ type: Date })
  accessTokenExpiresAt?: Date;

  @Prop({ type: Date })
  refreshTokenExpiresAt?: Date;

  // OAuth metadata
  @Prop()
  scope?: string; // Granted OAuth scopes

  @Prop()
  oauthState?: string; // For CSRF protection during OAuth flow

  // Connection metadata
  @Prop({ type: Date, default: Date.now })
  connectedAt: Date;

  @Prop({ type: Date })
  lastSyncAt?: Date;

  @Prop({ type: Number, default: 0 })
  syncCount?: number;

  @Prop()
  lastSyncError?: string;

  @Prop({ type: Number, default: 0 })
  tokenRefreshCount?: number;

  // Provider-specific settings
  @Prop({ type: Object })
  providerSettings?: {
    // Outlook-specific
    outlook?: {
      mailboxType?: 'primary' | 'archive';
      includeDrafts?: boolean;
      includeSent?: boolean;
    };
    // Gmail-specific
    gmail?: {
      includeSpam?: boolean;
      includeTrash?: boolean;
    };
    // Common settings
    maxEmailsPerSync?: number;
    syncFrequency?: 'realtime' | 'hourly' | 'daily';
  };

  // Audit and compliance
  @Prop({ type: Date })
  disconnectedAt?: Date;

  @Prop()
  disconnectReason?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  // Note: Actual tokens are NEVER stored in this schema
  // They are encrypted and stored in the secure vault with these reference keys
}

export const EmailConnectionSchema = SchemaFactory.createForClass(EmailConnection);

// Indexes for performance
EmailConnectionSchema.index({ customerId: 1, provider: 1 }, { unique: true });
EmailConnectionSchema.index({ status: 1 });
EmailConnectionSchema.index({ accessTokenExpiresAt: 1 });
EmailConnectionSchema.index({ lastSyncAt: 1 });
