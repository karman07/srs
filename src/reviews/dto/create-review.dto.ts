import { IsString, IsNotEmpty, IsArray, ArrayMinSize, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class RatingDto {
  @IsString()
  questionId: string;

  @Min(0.5)
  @Max(5)
  rating: number;
}

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  teacherId: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RatingDto)
  @ArrayMinSize(1)
  ratings: RatingDto[];

  @IsString()
  @IsNotEmpty()
  overallFeedback: string;
}
