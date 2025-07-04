import { SentryFilter } from "./sentry.filter";
import * as Sentry from '@sentry/node';
import { Injectable } from "@nestjs/common";
import { AbstractHttpAdapter } from '@nestjs/core/adapters/http-adapter';

@Injectable()
export class SentryService {

    initializeSentry(httpAdapterHost: AbstractHttpAdapter<any, any, any>): SentryFilter {

        function isFilteredRequestError(event: Sentry.Event): boolean {
            const mainAndMaybeCauseErrors = event.exception?.values ?? [];
            for (const error of mainAndMaybeCauseErrors) {
                const type = error.type;
                const value = error.value || '';
                //error type can be returned as Exception or Error and the values can come with or without the error code
                const is404 = (type === 'NotFoundException' || type === 'NotFoundError') && !!value.match('(GET|POST|PUT|DELETE|HEAD)');
                const is429 = (type === 'TooManyRequestsError' || type === 'TooManyRequestsException') && !!value.match('(GET|POST|PUT|DELETE|HEAD)');
                if (is404 || is429) {
                    return true;
                }
            }

            return false;
        }
        Sentry.init({
            beforeSend(event, _hint) {
                if (isFilteredRequestError(event)) {
                    // Return null to stop the error from being sent to Sentry
                    return null;
                }
                return event;
            },
            dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV,
        });
        return new SentryFilter(httpAdapterHost);
    }
}
