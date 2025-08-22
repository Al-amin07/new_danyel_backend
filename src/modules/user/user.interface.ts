import { TUserRole } from '../../constents';

export type TUser = {
  name: string;
  phone: string;
  email: string;
  password: string;
  role?: TUserRole;
  isDeleted?: string;
  isBlocked?: boolean;
  isProfileUpdate?: boolean;
};
