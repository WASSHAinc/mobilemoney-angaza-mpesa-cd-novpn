import { Controller, Post, Request, Body, UseGuards } from "@nestjs/common";
import { AppService } from "./app.service";
import { ReceivePaymentNotificationDto } from "./lib/database/dtos/paymentNotification.dto";
import { AuthorizationGuard } from "./auth-guard";
;

@Controller("api")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthorizationGuard)
  @Post("receivePaymentNotification")
  receivePaymentNotification(@Request() req: any, @Body() receivePaymentNotificationInput: ReceivePaymentNotificationDto) {
    return this.appService.receivePaymentNotification(receivePaymentNotificationInput, req);
  }
}
