import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

export interface StandardResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

@Injectable()
export class StandardResponseInterceptor<T>
    implements NestInterceptor<T, StandardResponse<T>> {
    constructor(private reflector: Reflector) { }

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<StandardResponse<T>> {
        return next.handle().pipe(
            map((data) => {
                const response = context.switchToHttp().getResponse();
                const statusCode = response.statusCode;
                const message =
                    this.reflector.get<string>('response_message', context.getHandler()) ||
                    'Success';

                return {
                    statusCode,
                    message,
                    data: data || null,
                };
            }),
        );
    }
}
