import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY, IS_PUBLIC_PERMISSION } from 'src/decorators/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    // You can throw an exception based on either "info" or "err" arguments
    const request: Request = context.switchToHttp().getRequest();

    const isPublicPermission = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_PERMISSION,
      [context.getHandler(), context.getClass()],
    );

    if (err || !user) {
      throw err || new UnauthorizedException('Token không hợp lệ');
    }

    const targetMethod = request.method;
    const targetEndpoint = request.route?.path as string;

    const permissions = user?.permissions ?? [];
    let isExist = permissions.find(
      (permission) =>
        permission.method === targetMethod &&
        permission.apiPath === targetEndpoint,
    );

    if (targetEndpoint.startsWith('/api/v1/auth')) isExist = true;
    if (!isExist && !isPublicPermission) {
      throw new ForbiddenException('You cannot access to this endpoint');
    }
    return user;
  }
}
