import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { LOG_ACTION_KEY, LogActionMetadata } from '../decorators/log-action.decorator';
import { AuditService } from '../audit.service';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const actionMeta = this.reflector.get<LogActionMetadata>(
      LOG_ACTION_KEY,
      context.getHandler(),
    );

    if (!actionMeta) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { user, ip, method, originalUrl, body, params, query, headers } = request;

    // Use x-forwarded-for or socket remoteAddress if 'ip' is missing or loopback in some proxies
    const ipAddress = ip || headers['x-forwarded-for'] || request.socket?.remoteAddress;
    const userAgent = headers['user-agent'];

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const logData: Partial<AuditLog> = {
            userId: user?.user_uuid || user?.user_id?.toString() || user?.id || null,
            action: actionMeta.action,
            entity: actionMeta.entity,
            metadata: {
              method,
              originalUrl,
              body,
              params,
              query,
              responseStatus: context.switchToHttp().getResponse().statusCode,
            },
            ip_address: ipAddress,
            user_agent: userAgent,
          };

          this.auditService.log(logData);
        },
        error: (error: any) => {
          const logData: Partial<AuditLog> = {
            userId: user?.user_uuid || user?.user_id?.toString() || user?.id || null,
            action: actionMeta.action,
            entity: actionMeta.entity,
            metadata: {
              method,
              originalUrl,
              body,
              params,
              query,
              error: error.message || 'Unknown error',
              responseStatus: error.status || 500,
            },
            ip_address: ipAddress,
            user_agent: userAgent,
          };

          this.auditService.log(logData);
        },
      }),
    );
  }
}
