import { ReceivePaymentNotificationType, ReceivePaymentNotificationTypeCommand } from '../../app.types';
import { DateTime } from 'luxon';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
export class XML {
  builder: any;
  constructor() {
    this.builder = new XMLBuilder();
  }

  //convert from mpesa date format yyyyMMddhhmm to SQL Date
  convertDate(dateString: string): string {
    if (!dateString || dateString == '') return DateTime.now().toSQL({ includeOffset: false })
    let year = dateString.substring(0, 4);
    let month = dateString.substring(4, 6);
    let day = dateString.substring(6, 8);
    let hour = dateString.substring(8, 10);
    let minutes = dateString.substring(10, 12);
    let seconds = dateString.substring(12, 14);
    let fullDateString = `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`
    return DateTime.fromFormat(fullDateString, 'yyyy-MM-dd hh:mm:ss').toSQL({ includeOffset: false })
  }


  extractXmlSoapData(xml: string): ReceivePaymentNotificationType {
    const parser = new XMLParser({ ignoreAttributes: false });
    const json = parser.parse(xml);

    // Navigate to the dataItems inside the SOAP body
    const dataItems =
      json['soapenv:Envelope']?.['soapenv:Body']?.['gen:getGenericResult']?.Request?.dataItem;

    if (!dataItems || !Array.isArray(dataItems)) {
      throw new Error('Invalid or unexpected XML structure');
    }

    const result: ReceivePaymentNotificationType = {
      MSISDN: '',
      Currency: '',
      Amount: 0,
      TransactionDate: '',
      TransactionID: '',
      BankShortCode: '',
      BankAccount: '',
      TransactionType: '',
    };

    for (const item of dataItems) {
      const name: string = item.name?.trim?.();
      const value: string = String(item.value)?.trim?.();
      if (name && value !== undefined) {
        if (name === 'MSISDN') {
          result.MSISDN = value;
        }
        if (name === 'Currency') {
          result.Currency = value;
        }
        if (name === 'Amount') {
          result.Amount = Number(value);
        }
        if (name === 'TransactionDate') {
          result.TransactionDate = this.convertDate(value);
        }
        if (name === 'TransactionID') {
          result.TransactionID = value;
        }
        if (name === 'BankShortCode') {
          result.BankShortCode = value;
        }
        if (name === 'BankAccount') {
          result.BankAccount = value;
        }
        if (name === 'TransactionType') {
          result.TransactionType = value;
        }
        if (name === 'CustomerKyc') {
          result.CustomerKyc = value; // Optional field for customer KYC information
        }
      }
    }

    return result;
  }


  generateMpesaXMLResponse(data: ReceivePaymentNotificationTypeCommand): string {
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      suppressEmptyNode: true
    });

    const dataItems = Object.entries(data).map(([key, value]) => ({
      name: key,
      type: 'String',
      value: value,
    }));

    const jsonStructure = {
      '?xml': {
        '@_version': '1.0',
        '@_encoding': 'UTF-8',
        '@_standalone': 'yes',
      },
      response: {
        dataItem: dataItems,
      },
    };

    return builder.build(jsonStructure);
  }
}
