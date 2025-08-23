import { TUserRole } from '../../constents';

export type TUser = {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: TUserRole;
  isDeleted: boolean;
  isBlocked: boolean;
  isProfileUpdate?: boolean;
  lastLoggedin?: Date;
  isVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpires?: Date;
};
