import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import ormConfig from "./lib/database/config/ormconfig";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseModule } from "./lib/database/database.module";
import { ConfigModule } from "@nestjs/config";
import { HealthController } from "./health/health.controller";
import { TerminusModule } from "@nestjs/terminus";
import { HttpModule } from "@nestjs/axios";
import { SlackModule } from "./lib/agent/slack/slack.module";
import { SlackService } from "./lib/agent/slack/slack.service";
import { SentryService } from "./lib/agent/sentry/sentry.service";
import { SentryModule } from "./lib/agent/sentry/sentry.module";

@Module({
  imports: [TypeOrmModule.forRoot(ormConfig), DatabaseModule, TerminusModule, HttpModule, SlackModule, SentryModule, ConfigModule],
  controllers: [AppController, HealthController],
  providers: [AppService, SlackService, SentryService],
})
export class AppModule {}
