export const DRC_COUNTRY_CODE = "243"
export const MPESA_SUCCESS_CODE = "0";
export const MPESA_SUCCESS_DESCRIPTION = "Success";
export interface ReceivePaymentNotificationTypeCommand {
    BankReceipt: string,
    ResponseCode: string,
    ResponseDescription: string,
    AccountName: string
}
export interface ReceivePaymentNotificationType {
    MSISDN: string;
    Currency: string;
    Amount: number;
    TransactionDate: string;
    TransactionID: string;
    BankShortCode: string;
    BankAccount: string;
    TransactionType: string;
    CustomerKyc?: string; // Optional field for customer KYC information
}

export type angazaPaymentRequest = {
    transaction_id: string;
    reference_number: string;
    merchant_code: string;
    amount: number;
    customer_msisdn: string;
};

export enum angazaStatusCodesEnum {
    SUCCESS = "SUCCESS",
    INVALID_ACCOUNT = "INVALID-ACCOUNT",
    INVALID_AMOUNT = "INVALID-AMOUNT",
    BAD_REQUEST = "BAD-REQUEST",
    INVALID_MSISDN = "INVALID-MSISDN",
    UNKNOWN_ERROR = "UNSPECIFIED-ERROR",
    FORBIDDEN = 403,
}
