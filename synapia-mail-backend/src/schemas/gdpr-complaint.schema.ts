import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GdprComplaintDocument = GdprComplaint & Document;

@Schema({ timestamps: true })
export class GdprComplaint {
  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    required: true,
    enum: ['data_processing', 'consent', 'rights', 'other']
  })
  category: 'data_processing' | 'consent' | 'rights' | 'other';

  @Prop({
    required: true,
    enum: ['submitted', 'under_review', 'resolved', 'rejected'],
    default: 'submitted'
  })
  status: 'submitted' | 'under_review' | 'resolved' | 'rejected';

  @Prop()
  adminResponse?: string;

  @Prop()
  resolvedAt?: Date;

  @Prop()
  resolvedBy?: string; // Admin user ID

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const GdprComplaintSchema = SchemaFactory.createForClass(GdprComplaint);
