// auth/company-type.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { COMPANY_TYPE_KEY } from '../decorators/company-type.decorator';
import { CompanyType } from '../decorators/company-type.enum';

@Injectable()
export class CompanyTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTypes = this.reflector.getAllAndOverride<CompanyType[]>(
      COMPANY_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredTypes || requiredTypes.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();

    const companyDetails = user.company.companyAccounts.find(
      (acc: any) => acc.id === user.company.id,
    );

    if (!user || !requiredTypes.includes(companyDetails.companyType)) {
      throw new ForbiddenException('Invalid company type');
    }

    return true;
  }
}
