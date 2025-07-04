import { Body, Controller, Post, Req, UseFilters } from '@nestjs/common';
import { AppService } from './app.service';
import { XmlExceptionFilter } from 'lib/errors/xml-filter-exceptions';
@Controller("api")
export class AppController {
  constructor(private readonly appService: AppService) { }

  @UseFilters(new XmlExceptionFilter())
  @Post("callback")
  receivePaymentNotification(@Req() req: any, @Body() receivePaymentNotificationXMLInput: any) {
    return this.appService.receivePaymentNotification(receivePaymentNotificationXMLInput);
  }

}