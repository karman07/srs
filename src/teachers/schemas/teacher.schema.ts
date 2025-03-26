import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeacherDocument = Teacher & Document;

@Schema({ timestamps: true })
export class Teacher {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: [String] })
  branches: string[];

  @Prop({ required: true, type: [String] })
  semesters: string[];

  @Prop({ required: true, type: [String] })
  subjects: string[];
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
