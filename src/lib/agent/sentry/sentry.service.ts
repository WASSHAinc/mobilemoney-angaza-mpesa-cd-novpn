import { SentryFilter } from "./sentry.filter";
import * as Sentry from '@sentry/node';
import { Injectable } from "@nestjs/common";
import { AbstractHttpAdapter } from '@nestjs/core/adapters/http-adapter';

@Injectable()
export class SentryService {
    initializeSentry(httpAdapterHost: AbstractHttpAdapter<any, any, any>): SentryFilter {
        Sentry.init({
            dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV,
        });
        return new SentryFilter(httpAdapterHost);
    }
}
