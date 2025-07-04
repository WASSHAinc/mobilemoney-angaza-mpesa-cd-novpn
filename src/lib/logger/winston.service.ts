import { Injectable } from "@nestjs/common";
import { loggerConfig } from "./winston.config";
@Injectable()
export class LoggerService {
    CONTEXT = 'cd-mpesa-angaza-api';
    logInfo = (message: string): void => {
        loggerConfig.info(message, { context: this.CONTEXT });
    }
    logWarning = (message: string): void => {
        loggerConfig.warn(message, { context: this.CONTEXT });
    }
    logError = (message: string): void => {
        loggerConfig.error(message, { context: this.CONTEXT });
    }
    logDebug = (message: string): void => {
        loggerConfig.debug(message, { context: this.CONTEXT });
    }
}
