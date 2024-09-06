import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { BaseError } from './base/base.error';

@Catch(BaseError)
export class BaseExceptionFilter implements ExceptionFilter {
  catch(exception: BaseError, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status: HttpStatus = exception?.status || HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).send({
      name: exception.name,
      code: exception.code,
      message: exception.message,
      data: exception.data,
      timestamp: new Date().toISOString(),
    });
  }
}