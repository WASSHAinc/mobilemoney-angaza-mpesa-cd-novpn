import { configDotenv } from 'dotenv';
import * as winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';
configDotenv();

const transports: any[] = [
    new WinstonCloudWatch({
        level: 'info',
        logGroupName: 'mpesa-angaza-api-logs',
        logStreamName: 'mpesa-angaza-api-logs',
        awsOptions: {
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            },
            region: 'af-south-1'
        }
    }),];

// Create and export the logger instance
export const loggerConfig = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports,
});
