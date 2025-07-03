import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AllRoles, ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AllRoles[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // no roles required
    }

    // TODO: Add logic that extract user permission and validate them

    // const { user } = context.switchToHttp().getRequest();

    // if (!user || !requiredRoles.includes(user.role)) {
    //   throw new ForbiddenException('Access denied for your role');
    // }

    return true;
  }
}
