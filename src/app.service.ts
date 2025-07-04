import { Injectable } from "@nestjs/common";
import * as Errors from "@errors";
import { Builder } from "xml2js";
import { angazaPaymentRequest, angazaStatusCodesEnum, MPESA_SUCCESS_CODE, MPESA_SUCCESS_DESCRIPTION, ReceivePaymentNotificationType, ReceivePaymentNotificationTypeCommand } from "./app.types";
import { SlackService } from "./lib/agents/slack/slack.service";
import { AngazaServiceAgent } from "./lib/agents/angaza/angaza.agent";
import { AxiosError } from "axios";
import { LoggerService } from "./lib/logger/winston.service";
import { XML } from "lib/utils/xml.utils";

const TRANSACTION_TYPE = "SYNC_BILLPAY_REQUEST";

@Injectable()
export class AppService {
  private xmlUtil = new XML();
  constructor(private slackService: SlackService, private angazaServiceAgent: AngazaServiceAgent, private logger: LoggerService) { }

  async receivePaymentNotification(receivePaymentNotificationXMLInput: any): Promise<string> {
    const receivePaymentNotificationInput: ReceivePaymentNotificationType = await this.xmlUtil.extractXmlSoapData(receivePaymentNotificationXMLInput);
    this.savePaymentNotificationToLogs(receivePaymentNotificationInput);
    this.verifyPaymentNotificationInput(receivePaymentNotificationInput);
    await this.validateAngazaAccount(receivePaymentNotificationInput);

    const payload: angazaPaymentRequest = {
      amount: parseInt(receivePaymentNotificationInput.Amount.toString()),
      merchant_code: process.env.ANGAZA_MERCHANT_CODE,
      transaction_id: receivePaymentNotificationInput.TransactionID,
      reference_number: receivePaymentNotificationInput.BankAccount,
      customer_msisdn: receivePaymentNotificationInput.MSISDN,
    };

    try {
      const response = await this.angazaServiceAgent.processPayment(payload);
      if (response.data.status === angazaStatusCodesEnum.SUCCESS) {
        const responseObj: ReceivePaymentNotificationTypeCommand = {
          ResponseCode: MPESA_SUCCESS_CODE,
          ResponseDescription: MPESA_SUCCESS_DESCRIPTION,
          BankReceipt: receivePaymentNotificationInput.TransactionID,
          AccountName: receivePaymentNotificationInput.BankAccount
        }
        return this.xmlUtil.generateMpesaXMLResponse(responseObj);
      } else {
        // Handle unsuccessful status
        throw new Errors.TransactionFailed(receivePaymentNotificationInput, response.data?.toString());
      }
    } catch (error: any) {
      this.processFailedPaymentError(error, receivePaymentNotificationInput);
      // The above method throws, but to satisfy TypeScript, add a return statement
      return ""; // This will never be reached, but is required for type safety
    }
  }

  processFailedPaymentError(error: AxiosError, receivePaymentNotificationInput: ReceivePaymentNotificationType) {
    if (error.response?.status === 404) {
      const message = ` \
        Error processing payment. Angaza server not available at the moment.\n
          Transaction ID: ${receivePaymentNotificationInput.TransactionID}  \n
          Amount: ${receivePaymentNotificationInput.Amount} \n
          Customer reference number: ${receivePaymentNotificationInput.BankAccount} \n
          customer MSIDN: ${receivePaymentNotificationInput.MSISDN} \n
      `;
      this.slackService.sendMessage(message);
      throw new Errors.AngazaServerNotFound(receivePaymentNotificationInput);
    }
    const message = ` \
      Error processing payment. \n
        Transaction ID: ${receivePaymentNotificationInput.TransactionID}  \n
        Amount: ${receivePaymentNotificationInput.Amount} \n
        Customer reference number: ${receivePaymentNotificationInput.BankAccount} \n
        customer MSIDN: ${receivePaymentNotificationInput.MSISDN} \n
    `;
    this.slackService.sendMessage(message);
    throw new Errors.TransactionFailed(receivePaymentNotificationInput, error.response?.data?.toString());
  }

  verifyPaymentNotificationInput(receivePaymentNotificationInput: ReceivePaymentNotificationType) {
    if (!receivePaymentNotificationInput.TransactionID || receivePaymentNotificationInput.TransactionID.length < 1) {
      throw new Errors.TransactionTypeNotSyncBillPayRequest(receivePaymentNotificationInput);

    }
    if (!receivePaymentNotificationInput.MSISDN || receivePaymentNotificationInput.MSISDN.length < 9) {
      throw new Errors.AccountDoesNotExist(receivePaymentNotificationInput);
    }

    if (receivePaymentNotificationInput.TransactionType !== TRANSACTION_TYPE) {
      throw new Errors.TransactionTypeNotSyncBillPayRequest(receivePaymentNotificationInput);
    }
    if (!receivePaymentNotificationInput.Amount || receivePaymentNotificationInput.Amount == 0) {
      throw new Errors.PaymentInsufficientError(receivePaymentNotificationInput);
    }
  }

  savePaymentNotificationToLogs(receivePaymentNotificationInput: ReceivePaymentNotificationType) {
    const message = JSON.stringify(receivePaymentNotificationInput);
    this.logger.logInfo(message);
  }

  async validateAngazaAccount(receivePaymentNotificationInput: ReceivePaymentNotificationType) {
    try {
      const response = await this.angazaServiceAgent.validateUser(receivePaymentNotificationInput.BankAccount, process.env.ANGAZA_MERCHANT_CODE);
    } catch (error: any) {
      if (error.response?.data?.status == angazaStatusCodesEnum.INVALID_ACCOUNT) {
        const message = ` \
            Error verifying customer. The customer reference id ${receivePaymentNotificationInput.BankAccount} \
            does not exist in Angaza Database. \n
              Transaction ID: ${receivePaymentNotificationInput.TransactionID}  \n
              Amount: ${receivePaymentNotificationInput.Amount} \n
              Customer reference number: ${receivePaymentNotificationInput.BankAccount} \n
              customer MSIDN: ${receivePaymentNotificationInput.MSISDN} \n
        `;
        this.slackService.sendMessage(message);
        throw new Errors.AccountDoesNotExist(receivePaymentNotificationInput);
      }
      this.handleAccountValidationError(error, receivePaymentNotificationInput);
    }
  }

  handleAccountValidationError(error: AxiosError, receivePaymentNotificationInput: ReceivePaymentNotificationType) {
    const message = ` \
            Account verification failed.
              Transaction ID: ${receivePaymentNotificationInput.TransactionID}  \n
              Amount: ${receivePaymentNotificationInput.Amount} \n
              Customer reference number: ${receivePaymentNotificationInput.BankAccount} \n
              customer MSIDN: ${receivePaymentNotificationInput.MSISDN} \n
        `;
    this.slackService.sendMessage(message);
    throw new Errors.AccountVerificationFailed(receivePaymentNotificationInput);
  }
}