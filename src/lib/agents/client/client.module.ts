import { Module } from "@nestjs/common";
import { WebApiServiceClient } from "./web-api.service";

@Module({
  providers: [WebApiServiceClient],
  exports: [WebApiServiceClient],
})
export class ClientModule {}
