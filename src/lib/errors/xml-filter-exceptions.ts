import { MpesaXmlException } from '@errors';
import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

@Catch(MpesaXmlException)
export class XmlExceptionFilter implements ExceptionFilter {
  catch(exception: MpesaXmlException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    let response = ctx.getResponse<Response>();
    response.setHeader('Content-Type', 'application/xml');
    response.statusCode = exception.getStatus();
    response.send(exception.getResponse());
  }
}
