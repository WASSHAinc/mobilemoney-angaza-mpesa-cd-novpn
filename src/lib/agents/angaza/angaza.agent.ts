import { Injectable } from "@nestjs/common";
import { WebApiServiceClient } from "../client/web-api.service";
import * as AngazaEndpoints from "./angaza.endpoints";
import * as AngazaConfig from "./angaza.config";
import { formatString } from "../../utils/strings.utils";
import { angazaPaymentRequest } from "app.types";

@Injectable()
export class AngazaServiceAgent {

    httpHeaders: any = {'Content-Type':'application/json'};

    constructor(private readonly webApiServiceClient: WebApiServiceClient) {
      if(AngazaConfig.ANGAZA_AUTHENTICATION_TYPE && AngazaConfig.ANGAZA_AUTHENTICATION_TYPE.toLowerCase() == 'basic'){
        const encodedCredentials = Buffer.from(`${AngazaConfig.USERNAME}:${AngazaConfig.PASSWORD}`).toString('base64');
        this.httpHeaders = { ... this.httpHeaders, 'Authorization' : `Basic ${encodedCredentials}` }
      }
        
      if(AngazaConfig.ANGAZA_AUTHENTICATION_TYPE && AngazaConfig.ANGAZA_AUTHENTICATION_TYPE.toLowerCase() == 'bearer'){
        const token = AngazaConfig.ACCESSTOKEN;
        this.httpHeaders = { ... this.httpHeaders, 'Authorization' : `Bearer ${token}` }
      }

      this.webApiServiceClient.setBaseUrl(AngazaConfig.BASEURL)
      this.webApiServiceClient.setHeaders(this.httpHeaders)
    }
   
    async validateUser(account: string, merchantCode: string) {
        return this.webApiServiceClient.get(formatString(AngazaEndpoints.CUSTOMER_VALIDATION_BY_MERCHANT_CODE, account, merchantCode));
    }

    async processPayment(data: angazaPaymentRequest) {
      return this.webApiServiceClient.post(AngazaEndpoints.PROCESS_PAYMENT, data);
    }


  }