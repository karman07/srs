import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../auth/enum/roles.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  dob: string;

  @IsString()
  branch: string;

  @IsString()
  semester: string;

  @IsEnum(UserRole)
  role: UserRole;
}
