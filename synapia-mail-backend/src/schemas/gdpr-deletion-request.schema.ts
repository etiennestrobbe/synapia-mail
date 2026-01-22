import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GdprDeletionRequestDocument = GdprDeletionRequest & Document;

@Schema({ timestamps: true })
export class GdprDeletionRequest {
  @Prop({ required: true })
  customerId: string;

  @Prop()
  reason?: string;

  @Prop({ required: true })
  scheduledDeletionDate: Date;

  @Prop({ required: true })
  cancellationCode: string;

  @Prop({
    required: true,
    enum: ['pending', 'cancelled', 'completed'],
    default: 'pending'
  })
  status: 'pending' | 'cancelled' | 'completed';

  @Prop()
  cancelledAt?: Date;

  @Prop()
  executedAt?: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const GdprDeletionRequestSchema = SchemaFactory.createForClass(GdprDeletionRequest);
