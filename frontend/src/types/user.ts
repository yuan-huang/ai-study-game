export type Grade = 
  | '小学一年级' | '小学二年级' | '小学三年级' | '小学四年级' | '小学五年级' | '小学六年级'
  | '初一' | '初二' | '初三'
  | '高一' | '高二' | '高三';

export type Gender = '男孩' | '女孩';

export interface UserInfo {
  id?: string;
  school?: string;
  className?: string;
  name: string;
  gender: Gender;
  grade: Grade;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: UserInfo;
} 