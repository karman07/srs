import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true })
  studentId: string;

  @Prop({ required: true })
  teacherId: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true, type: [{ questionId: String, rating: Number }] })
  ratings: { questionId: string; rating: number }[];

  @Prop({ required: true })
  overallFeedback: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
