
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredPermissions) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();

        if (!user || !user.role || !user.role.permissions) {
            return false;
        }

        const userPermissions = user.role.permissions.map((p) => p.name);
        const hasPermission = requiredPermissions.every((permission) => userPermissions.includes(permission));

        if (!hasPermission) {
            throw new ForbiddenException('You do not have the required permissions');
        }

        return true;
    }
}
