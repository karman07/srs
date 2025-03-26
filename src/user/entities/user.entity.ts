import { UserRole } from '../../auth/enum/roles.enum';

export class UserEntity {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  dob: string;
  branch: string;
  semester: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
