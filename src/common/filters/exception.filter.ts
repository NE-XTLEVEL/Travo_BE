import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from "@nestjs/common";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger("HttpExceptionFilter");

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception.getStatus();
    const timestamp = new Date().toISOString();

    const errorResponse =
      typeof exception.getResponse() === "string"
        ? { message: exception.getResponse() }
        : (exception.getResponse() as object);

    this.logger.error(
      JSON.stringify({
        timestamp,
        method: request.method,
        url: request.url,
        status_code: status,
        ip: request.get("x-forwarded-for") || request.ip,
        ...errorResponse,
      }),
    );

    response.status(status).json({
      status_code: status,
      timestamp,
      ...errorResponse,
    });
  }
}
