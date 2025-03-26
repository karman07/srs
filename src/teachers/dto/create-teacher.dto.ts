import { IsString, IsArray, IsNotEmpty } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsNotEmpty()
  branches: string[];

  @IsArray()
  @IsNotEmpty()
  semesters: string[];

  @IsArray()
  @IsNotEmpty()
  subjects: string[];
}
