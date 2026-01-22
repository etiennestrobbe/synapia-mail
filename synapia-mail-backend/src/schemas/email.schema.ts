import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailDocument = Email & Document;

@Schema()
export class Email {
  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  providerMessageId: string; // Outlook message ID, Gmail thread ID, etc.

  @Prop({ required: true, enum: ['outlook', 'gmail', 'yahoo', 'icloud', 'test'] })
  provider: string;

  // Metadata only - NO EMAIL CONTENT STORED (privacy compliance)
  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  from: string;

  @Prop({ type: [String] })
  to?: string[];

  @Prop({ type: [String] })
  cc?: string[];

  @Prop({ type: Date, required: true })
  receivedAt: Date;

  @Prop({ default: false })
  hasAttachments?: boolean;

  @Prop({ type: Number })
  attachmentCount?: number;

  // Categorization results (stored after processing)
  @Prop()
  category?: string;

  @Prop({ type: Number, min: 0, max: 1 })
  confidence?: number;

  // Urgency detection results
  @Prop()
  isUrgent?: boolean;

  @Prop({ enum: ['low', 'medium', 'high'] })
  urgencyLevel?: string;

  @Prop()
  urgencyReason?: string;

  @Prop({ default: false })
  isProcessed: boolean;

  @Prop({ type: Date })
  processedAt?: Date;

  // Processing metadata
  @Prop({ default: 0 })
  processingAttempts?: number;

  @Prop()
  lastProcessingError?: string;

  // Audit fields
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  // Note: Email content/body is NEVER stored for privacy compliance
  // Content is fetched temporarily from provider for categorization only
}

export const EmailSchema = SchemaFactory.createForClass(Email);
