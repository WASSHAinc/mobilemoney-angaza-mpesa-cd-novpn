import { Module } from "@nestjs/common";
import { SentryFilter } from "./sentry.filter";
import { SentryService } from "./sentry.service";

@Module({
    imports: [], controllers: [], providers: [SentryFilter, SentryService]
})
export class SentryModule { }
