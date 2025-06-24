import { HttpException, HttpStatus } from "@nestjs/common";

export const AGENT_DOES_NOT_EXIST = 'AGENT_DOES_NOT_EXIST';
export const AUTHENTICATION_FAILURE = 'AUTHENTICATION_FAILURE';
export const PAYMENT_AMOUNT_NOT_SUFFICIENT = 'PAYMENT_AMOUNT_NOT_SUFFICIENT'
export const OPAY_TRANSACTION_FAILED = 'OPAY_TRANSACTION_FAILED'
export const ERROR_PARSING_ENCRYPTED_DATA = 'ERROR_PARSING_ENCRYPTED_DATA'
export const DUPLICATE_OPAY_TRANSACTION = 'DUPLICATE_OPAY_TRANSACTION'

export class AgentDoesNotExist extends HttpException {
  constructor() {
    super(AGENT_DOES_NOT_EXIST, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class AuthenticationFailure extends HttpException {
  constructor() {
    super(AUTHENTICATION_FAILURE, HttpStatus.UNAUTHORIZED);
  }
}

export class PaymentAmountNotSufficient extends HttpException {
  constructor() {
    super(PAYMENT_AMOUNT_NOT_SUFFICIENT, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class OpayTransactionFailed extends HttpException {
  constructor() {
    super(OPAY_TRANSACTION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class DuplicateOpayTransaction extends HttpException {
  constructor() {
    super(DUPLICATE_OPAY_TRANSACTION, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class ErrorParsingEncryptedData extends HttpException {
  constructor() {
    super(ERROR_PARSING_ENCRYPTED_DATA, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
