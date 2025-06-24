import { Type } from "class-transformer";
import { IsNumberString, IsDate, IsString, IsNotEmpty, IsOptional } from "class-validator";

/**
 * TODO: Add the notification datastructure here to only allow the correct data
 * to be passed to the service
 */
export class ReceivePaymentNotificationDto {
  phoneNo: string;
}
