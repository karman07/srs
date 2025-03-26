import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../auth/enum/roles.enum';

export type UserDocument = User & Document;  // ✅ Export UserDocument type

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  dob: Date;

  @Prop({ required: true })
  branch: string;

  @Prop({ required: true })
  semester: string;

  @Prop({ enum: UserRole , default:UserRole.STUDENT})
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
