import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EdaDocument = Eda & Document;

@Schema({ timestamps: true })
export class Eda {
  @Prop({ required: true })
  teacherId: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  branch: string;

  @Prop({ required: true })
  totalReviews: number;

  @Prop({ required: true })
  averageRating: number;

  @Prop({ required: true })
  edaResult: 'positive' | 'moderate' | 'negative';

  @Prop({ required: true })
  theoryScore: number;

  @Prop({ required: true })
  practicalScore: number;

  @Prop({ required: true })
  examScore: number;

  @Prop({ required: true })
  positiveReviews: number;

  @Prop({ required: true })
  moderateReviews: number;

  @Prop({ required: true })
  negativeReviews: number;
}

export const EdaSchema = SchemaFactory.createForClass(Eda);
