import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GdprConsentDocument = GdprConsent & Document;

@Schema({ timestamps: true })
export class GdprConsent {
  @Prop({ required: true, unique: true })
  customerId: string;

  @Prop({ default: false })
  marketingEmails: boolean;

  @Prop({ default: false })
  analytics: boolean;

  @Prop({ default: false })
  thirdPartySharing: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const GdprConsentSchema = SchemaFactory.createForClass(GdprConsent);
