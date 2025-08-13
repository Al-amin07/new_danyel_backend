export type TUserRole = 'admin' | 'company' | 'driver';

export const userRole = {
  admin: 'admin',
  company: 'company',
  driver: 'driver',
} as const;

export type TErrorSource = {
  path: string | number;
  message: string;
}[];
