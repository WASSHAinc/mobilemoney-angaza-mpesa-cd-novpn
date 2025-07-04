import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { XMLMiddleware } from "./lib/middleware/xml.middleware";
import { SlackModule } from "./lib/agents/slack/slack.module";
import { ConfigModule } from "@nestjs/config";
import { AngazaAgentModule } from "./lib/agents/angaza/angaza.module";
import { ClientModule } from "./lib/agents/client/client.module";
import { LoggerService } from "./lib/logger/winston.service";
import { SlackService } from "./lib/agents/slack/slack.service";
import { WebApiServiceClient } from "./lib/agents/client/web-api.service";
import { SentryService } from "./lib/agents/sentry/sentry.service";
import { SentryModule } from "./lib/agents/sentry/sentry.module";
import { XmlExceptionFilter } from "lib/errors/xml-filter-exceptions";

@Module({
  imports: [ConfigModule.forRoot(), AngazaAgentModule, ClientModule, SlackModule, SentryModule],
  controllers: [AppController],
  providers: [AppService, LoggerService, SlackService, WebApiServiceClient, SentryService, XmlExceptionFilter, XmlExceptionFilter],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(XMLMiddleware).forRoutes({
      path: "api/*",
      method: RequestMethod.POST,
    });
  }
}
