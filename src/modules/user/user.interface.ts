import { TUserRole } from '../../constents';

export type TUser = {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: TUserRole;
  isDeleted: boolean;
  isBlocked: boolean;
  profileImage?: string;
  isProfileUpdate?: boolean;
  lastLoggedin?: Date;
  isVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpires?: Date;
  forgetPasswordCode?: string;
  forgetPasswordExpires?: Date;
  isResettingPassword?: boolean;
  passwordChangeTime?: Date;
};
