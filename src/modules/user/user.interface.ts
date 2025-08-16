import { Types } from 'mongoose';
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
  company?: Types.ObjectId;
};

export type TProfile = {
  fullName: string;
  phone: string;
  email: string;

  img?: string;
  age?: number;
  gender?: 'male' | 'female';
  hight?: number;
  weight?: number;
  recidenceArea?: string;

  user_id: Types.ObjectId;

  isDeleted?: boolean;
};
