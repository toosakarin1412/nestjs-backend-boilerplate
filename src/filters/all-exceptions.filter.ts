import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;

        const ctx = host.switchToHttp();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        let message: string | object = exception instanceof Error ? exception.message : 'Internal Server Error';
        let error = 'Internal Server Error';

        if (exception instanceof HttpException) {
            const res = exception.getResponse();
            if (typeof res === 'object' && res !== null) {
                message = (res as any).message || message;
                error = (res as any).error || exception.message;
            } else {
                message = res as string;
                error = exception.message;
            }
        }

        const responseBody = {
            statusCode: httpStatus,
            message,
            error,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
        };

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
