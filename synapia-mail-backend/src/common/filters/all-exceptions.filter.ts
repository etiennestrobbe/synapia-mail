import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        error = responseObj.error || error;
      }
    } else if (exception instanceof Error) {
      // Log the actual error for debugging but don't expose it to client
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
        {
          url: request.url,
          method: request.method,
          ip: request.ip,
          userAgent: request.get('User-Agent'),
        },
      );
    }

    // Always return generic error messages to prevent information leakage
    const clientResponse = {
      statusCode: status,
      message: this.getClientFriendlyMessage(status, message),
      error: this.getClientFriendlyError(status),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(clientResponse);
  }

  private getClientFriendlyMessage(status: number, originalMessage: string): string {
    // For validation errors, return the specific validation message
    if (status === HttpStatus.BAD_REQUEST && originalMessage.includes('validation')) {
      return originalMessage;
    }

    // For other errors, return generic messages
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad request. Please check your input.';
      case HttpStatus.UNAUTHORIZED:
        return 'Authentication required.';
      case HttpStatus.FORBIDDEN:
        return 'Access denied.';
      case HttpStatus.NOT_FOUND:
        return 'Resource not found.';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too many requests. Please try again later.';
      case HttpStatus.INTERNAL_SERVER_ERROR:
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  }

  private getClientFriendlyError(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too Many Requests';
      case HttpStatus.INTERNAL_SERVER_ERROR:
      default:
        return 'Internal Server Error';
    }
  }
}
