import { SetMetadata } from '@nestjs/common';
import {
  AdminRole,
  LawyerCustomerRole,
  LawyerOutsourceRole,
  LawyerRole,
} from './roles.enum';

export type AllRoles =
  | AdminRole
  | LawyerRole
  | LawyerCustomerRole
  | LawyerOutsourceRole;

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AllRoles[]) => SetMetadata(ROLES_KEY, roles);
