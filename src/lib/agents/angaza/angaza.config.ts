import * as dotenv from 'dotenv';

dotenv.config();

export const ANGAZA_AUTHENTICATION_TYPE = process.env.ANGAZA_AUTHENTICATION_TYPE;
export const BASEURL = process.env.ANGAZA_API_URL;
export const USERNAME = process.env.ANGAZA_USERNAME;
export const PASSWORD = process.env.ANGAZA_PASSWORD;
export const ACCESSTOKEN = process.env.ANGAZA_ACCESS_TOKEN;