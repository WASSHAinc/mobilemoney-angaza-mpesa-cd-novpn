import { HttpException, HttpStatus } from "@nestjs/common";
import { ReceivePaymentNotificationType } from "app.types";
import { XML } from "lib/utils/xml.utils";

export const AUTHENTICATION_FAILURE = 'AUTHENTICATION_FAILURE';
export const PAYMENT_AMOUNT_NOT_SUFFICIENT = 'PAYMENT_AMOUNT_NOT_SUFFICIENT'
export const MPESA_TRANSACTION_FAILED = 'MPESA_TRANSACTION_FAILED'
export const ERROR_PARSING_XML_DATA = 'ERROR_PARSING_XML_DATA'

export const INCORRECT_TRANSACTION_ID = 'ERROR_INVALID_TRANSACTION_ID';
export const INVALID_PHONE_NUMBER = 'ERROR_INVALID_PHONE_NUMBER';
export const INVALID_PAYMENT_AMOUNT = 'ERROR_INVALID_PAYMENT_AMOUNT'

export const TRANSACTION_FAILED = "TRANSACTION_FAILED";
export const ERROR_PARSING_ENCRYPTED_DATA = "ERROR_PARSING_ENCRYPTED_DATA";
export const DUPLICATE_TRANSACTION = "DUPLICATE_TRANSACTION";
export const BAD_XML_FORMAT = "BAD_XML_FORMAT";
export const BAD_XML_STRUCTURE = "BAD_XML_STRUCTURE";
export const FIELD_REQUIRED = "FIELD_REQUIRED";
export const TRANSACTION_TYPE_NOT_SYNC_BILLPAY_REQUEST = "TRANSACTION_TYPE_NOT_SYNC_BILLPAY_REQUEST";
export const ANGAZA_SERVER_NOT_FOUND = "ANGAZA_SERVER_NOT_FOUND";
export const ACCOUNT_VERIFICATION_FAILED = "ACCOUNT_VERIFICATION_FAILED";
export const AGENT_DOES_NOT_EXIST = "AGENT_DOES_NOT_EXIST";

export class MpesaXmlException extends HttpException {
  payload: ReceivePaymentNotificationType;
  constructor(private readonly xmlResponse: string, status: HttpStatus, payload?: ReceivePaymentNotificationType) {
    super(xmlResponse, status);
    this.payload = payload;
  }

  getJsonResponse(): string {
    return JSON.stringify(this.payload ? this.payload : {
      ResponseCode: "1",
      ResponseDescription: this.xmlResponse,
      BankReceipt: '',
      AccountName: ''
    });
  }

  getResponse(): string {
    const xml = new XML();
    return xml.generateMpesaXMLResponse({
      ResponseCode: "1",
      ResponseDescription: this.xmlResponse,
      BankReceipt: '',
      AccountName: ''
    });
  }
}

interface ErrorOjectInterface {
  RESULT?: string;
  ERRORCODE: MpesaErrorCodes;
  ERRORDESC: string;
  FLAG?: string;
  CONTENT?: string;
}

export enum MpesaErrorCodes {
  SUCCESS = 'error000',
  SERVICE_NOT_AVAILABLE = 'error001',
  INVALID_CUSTOMER_REFERENCE_NUMBER = 'error010',
  CUSTOMER_REFERENCE_ACCOUNT_LOCKED = 'error011',
  INVALID_AMOUNT = 'error012',
  AMOUNT_INSUFFICIENT = 'error013',
  AMOUNT_TOO_HIGH = 'error014',
  AMOUNT_TOO_LOW = 'error015',
  INVALID_PAYMENT = 'error016',
  GENERAL_ERROR = 'error100',
  RETRY_CONDITION = 'error111'
}

class XmlException extends HttpException {

  errorObjectTemplate = {
    TYPE: "SYNC_BILLPAY_RESPONSE",
    TXNID: "",
    REFID: "",
    RESULT: "TF",
    ERRORCODE: MpesaErrorCodes.GENERAL_ERROR,
    ERRORDESC: "",
    MSISDN: "",
    FLAG: "N",
    CONTENT: "",
  };

  constructor(private errorOject: ErrorOjectInterface, status: HttpStatus, private receivedNotification: ReceivePaymentNotificationType) {
    super(errorOject.ERRORDESC, status);
  }
}

export class AccountDoesNotExist extends XmlException {
  constructor(receivedNotification: ReceivePaymentNotificationType) {
    super({
      ERRORDESC: ACCOUNT_VERIFICATION_FAILED,
      ERRORCODE: MpesaErrorCodes.INVALID_CUSTOMER_REFERENCE_NUMBER,
    }, HttpStatus.OK, receivedNotification);
  }
}

export class AccountVerificationFailed extends XmlException {
  constructor(receivedNotification: ReceivePaymentNotificationType) {
    super({
      ERRORDESC: ACCOUNT_VERIFICATION_FAILED,
      ERRORCODE: MpesaErrorCodes.SERVICE_NOT_AVAILABLE
    }, HttpStatus.OK, receivedNotification);
  }
}

export class PaymentInsufficientError extends XmlException {
  constructor(receivedNotification: ReceivePaymentNotificationType) {
    super({
      ERRORDESC: ACCOUNT_VERIFICATION_FAILED,
      ERRORCODE: MpesaErrorCodes.INVALID_AMOUNT
    }, HttpStatus.OK, receivedNotification);
  }
}
export class AuthenticationFailure extends XmlException {
  constructor(receivedNotification: ReceivePaymentNotificationType) {
    super({
      ERRORDESC: AUTHENTICATION_FAILURE,
      ERRORCODE: MpesaErrorCodes.SERVICE_NOT_AVAILABLE
    }, HttpStatus.UNAUTHORIZED, receivedNotification);
  }
}
export class TransactionFailed extends XmlException {
  constructor(receivedNotification: ReceivePaymentNotificationType, error: string) {
    super({
      ERRORDESC: TRANSACTION_FAILED,
      ERRORCODE: MpesaErrorCodes.GENERAL_ERROR, CONTENT: error
    }, HttpStatus.OK, receivedNotification);
  }
}
export class AngazaServerNotFound extends XmlException {
  constructor(receivedNotification: ReceivePaymentNotificationType) {
    super({
      ERRORDESC: ANGAZA_SERVER_NOT_FOUND,
      ERRORCODE: MpesaErrorCodes.SERVICE_NOT_AVAILABLE
    }, HttpStatus.OK, receivedNotification);
  }
}
export class DuplicateTransaction extends XmlException {
  constructor(receivedNotification: ReceivePaymentNotificationType) {
    super({
      ERRORDESC: DUPLICATE_TRANSACTION,
      ERRORCODE: MpesaErrorCodes.GENERAL_ERROR
    }, HttpStatus.OK, receivedNotification);
  }
}
export class BadXMLStructure extends XmlException {
  constructor(receivedNotification: ReceivePaymentNotificationType) {
    super({
      ERRORDESC: BAD_XML_STRUCTURE,
      ERRORCODE: MpesaErrorCodes.GENERAL_ERROR
    }, HttpStatus.BAD_REQUEST, receivedNotification);
  }
}

export class TransactionTypeNotSyncBillPayRequest extends XmlException {
  constructor(receivedNotification: ReceivePaymentNotificationType) {
    super({
      ERRORDESC: TRANSACTION_TYPE_NOT_SYNC_BILLPAY_REQUEST,
      ERRORCODE: MpesaErrorCodes.GENERAL_ERROR
    }, HttpStatus.BAD_REQUEST, receivedNotification);
  }
}
