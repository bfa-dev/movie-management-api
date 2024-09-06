import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, Logger, NestInterceptor } from '@nestjs/common';

@Injectable()
class LoggingInterceptor implements NestInterceptor {
  private readonly ctxPrefix: string = LoggingInterceptor.name;
  private readonly logger: Logger = new Logger(this.ctxPrefix);
  public intercept(context: ExecutionContext, call$: CallHandler): Observable<unknown> {

    const req = context.switchToHttp().getRequest();
    const { method, url, body, headers } = req;

    const ctx: string = `${this.ctxPrefix} - ${method} - URL: '${url}'`;
    const message: string = `Incoming Request - ${method} - URL: '${url}'`;

    this.logger.debug(ctx, JSON.stringify({ message, body, headers }));

    return call$.handle().pipe(
      tap({
        next: (val: unknown): void => {
          this.logNext(val, context);
        },
        error: (err: Error): void => {
          this.logError(err, context);
        },
      }),
    );
  }

  private logNext(body: unknown, context: ExecutionContext): void {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const { method, url } = req;
    const { statusCode } = res;
    const ctx: string = `${this.ctxPrefix} - ${statusCode} - ${method} - URL: '${url}'`;
    const message: string = `Outgoing Response - ${statusCode} - ${method} - URL: '${url}'`;

    this.logger.debug(JSON.stringify({ message, body }), ctx);
  }

  private logError(error: Error, context: ExecutionContext): void {
    const req = context.switchToHttp().getRequest();
    const { method, url, body } = req;

    if (error instanceof HttpException) {
      const statusCode: number = error.getStatus();
      const ctx: string = `${this.ctxPrefix} - ${statusCode} - ${method} - URL: '${url}'`;
      const message: string = `Outgoing Response - ${statusCode} - ${method} - URL: '${url}'`;

      if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(JSON.stringify({ method, url, body, message, error }), error.stack, ctx);
      } else {
        this.logger.warn(JSON.stringify({ method, url, error, body, message }), ctx);
      }
    } else {
      this.logger.error(
        JSON.stringify({
          message: `Outgoing Response - ${method} - URL: '${url}'`,
        }),
        error.stack,
        `${this.ctxPrefix} - ${method} - ${url}`,
      );
    }
  }
}

export default LoggingInterceptor;
