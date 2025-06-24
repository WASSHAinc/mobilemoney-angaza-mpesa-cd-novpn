import {ArgumentsHost,Catch} from "@nestjs/common";
import {BaseExceptionFilter} from "@nestjs/core";
import * as Sentry from '@sentry/node';


@Catch()
export class SentryFilter extends BaseExceptionFilter {
    catch(execption: unknown,host: ArgumentsHost) {
        Sentry.captureException(execption);
        super.catch(execption,host);
    }
}
