import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema()
export class Customer {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  subscriptionPlan: string; // e.g., 'basic', 'premium'

  @Prop({ required: true, default: 0 })
  creditsRemaining: number;

  @Prop({ required: true })
  totalCredits: number;

  @Prop({ default: 80 })
  warningThreshold: number; // percentage for credit warnings

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0.7, min: 0, max: 1 })
  categorizationConfidenceThreshold: number;

  @Prop()
  outlookAccessToken?: string;

  @Prop()
  outlookRefreshToken?: string;

  @Prop()
  outlookTokenExpiry?: Date;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
