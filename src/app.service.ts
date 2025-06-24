import {  ReceivePaymentNotificationDto } from "./lib/database/dtos/paymentNotification.dto";
import {
  PhoneRepository,
  AirwattIssueReadyRepository,
  MemeSellRepository,
  SenderDescriptionRepository,
  MobileMoneyTypeRepository,
  GenericMobileMoneyLogsDatabaseTableRepository,
} from "./lib/database/repositories";
import { Injectable } from "@nestjs/common";
import * as Errors from "./lib/errors";
import { NIGERIA_COUNTRY_CODE } from "./app.types";
import { SlackService } from "./lib/agent/slack/slack.service";
import { GenericMobileMoneyLogsDatabaseTableEntity } from "@database";

/**
 * TODO: this will be used to check if the phone number exists in the database.
 * If you do not need to do this you can remove this.
 */
const AGENT_STATUS = [
  "0", // WASSHA Agent (Installed)
  "2", // Test
  "100", // WASSHA Agent (Before install apps)
  "101", // WASSHA Agent (Prepare to install)
];

/**
 * TODO: this constant will be updated to match the mobile money type name.
 */
const MOBILE_MONEY_TYPE_NAME_AUTOMATIC = "added by manual (Opay (Nigeria))";
const MOBILE_MONEY_TYPE_NAME = "Opay (Nigeria)";
const MEME_SELL_REASON_NIGERIA_OPAY_API = "207";
const MEME_SELL_INPUT_BY_NIGERIA_OPAY = "NIGERIA_OPAY";

@Injectable()
export class AppService {
  constructor(
    private phoneRepository: PhoneRepository,
    private airwattIssueReadyRepository: AirwattIssueReadyRepository,
    private memeSellRepository: MemeSellRepository,
    private senderDescriptionRepository: SenderDescriptionRepository,
    private mobileMoneyTypeRepository: MobileMoneyTypeRepository,
    private genericMobileMoneyLogsDatabaseTableRepository: GenericMobileMoneyLogsDatabaseTableRepository,
    private slackService: SlackService,
  ) {}

  async receivePaymentNotification(receivePaymentNotificationInput: ReceivePaymentNotificationDto, request: any) {
    this.savePaymentNotificationToLogs(receivePaymentNotificationInput);
    /**
     * TODO: Do the necessary validation here to ensure that the data is correct.
     * Here are some of the things to validate:
     * 1. Ensure that the data is not empty
     * 2. Check the status of the payment and ensure that it is successful
     * 3. Ensure that the transactionId is not empty
     * 4. Check the transactionId to ensure that it does not exist in the database or logs or any other place
     * 5. Check the amount to ensure that it is not empty or zero
     * 6. Convert the numbers and the dates to the correct data type
     */

    // TODO: Please update the phoneNo value to whatever value used to store the phone number in the notification input.
    const phone = await this.getUserFromPhoneNo(receivePaymentNotificationInput.phoneNo);

    //this is to check if the phone number exists in the database of our users. if it does then we will process the payment notification
    if (phone) {
      /**
       * TODO: Add the mechanism to process the payment notification.
       * Depending on what you are working on this might be a bit different.
       * 1. In EAAS Project this means add a record on MemeSellEntity() and AirwattIssueReadyEntity() since this operates in a way that the
       *    payment will be processed by a running CRON job that reads from the database. the values of AirwattIssueReadyEntity() will be
       *    retrieved in the CRON job and the payment will be processed from MemeSellEntity(). After this is done the value on
       *    AirwattIssueReadyEntity() will be deleted from the database
       * 2. In Angaza this means sending a request to their API to notify them that a new payment has been made.
       * 3. In the new implementation we will use a message queue to process the payment notification.
       */
      /**
       * Below is an example of how to process the payment notification in EAAS Project.
       * Note: The return value will be formated according to the documentation of the API.
       */
      // const AirWattAmount = parseInt(receivePaymentNotificationInputData.depositAmount);
      // const senderDescription = await this.senderDescriptionRepository.findOne({ where: { senderDescription: MOBILE_MONEY_TYPE_NAME_AUTOMATIC } });
      // const sender = await this.mobileMoneyTypeRepository.findOne({ where: { value: MOBILE_MONEY_TYPE_NAME } });
      // const utcDatetimeNow = new Date();
      // const memeSellEntity = new MemeSellEntity();
      // memeSellEntity.phoneNo = receivePaymentNotificationInputData.refId;
      // memeSellEntity.meme = AirWattAmount;
      // memeSellEntity.money = AirWattAmount;
      // memeSellEntity.smsReceivedLocalTime = utcDatetimeNow;
      // memeSellEntity.kessaiDate = utcDatetimeNow;
      // memeSellEntity.smsId = -1;
      // memeSellEntity.buyerFirstName = "";
      // memeSellEntity.buyerLastName = "";
      // memeSellEntity.sender = sender;
      // memeSellEntity.senderDescription = senderDescription;
      // memeSellEntity.reason = MEME_SELL_REASON_NIGERIA_OPAY_API;
      // memeSellEntity.mpesaCode = receivePaymentNotificationInputData.transactionId;
      // memeSellEntity.inputBy = MEME_SELL_INPUT_BY_NIGERIA_OPAY;
      // memeSellEntity.agent = phone.agent;
      // memeSellEntity.createdTime = new Date();
      // memeSellEntity.updatedAt = new Date();
      // memeSellEntity.createdAt = new Date();
      // const memeSale = await this.memeSellRepository.save(memeSellEntity);
      // opayPaymentEntity.memesell = memeSale;
      // opayPaymentEntity.status = OpayPaymentStatusEnum.SUCCESS;
      // await this.opayPaymentRepository.save(opayPaymentEntity);
      // const airwattIssueReady = new AirwattIssueReadyEntity();
      // airwattIssueReady.agent = phone.agent;
      // airwattIssueReady.memeSell = memeSale;
      // airwattIssueReady.airwatt = AirWattAmount;
      // airwattIssueReady.updatedAt = new Date();
      // airwattIssueReady.createdAt = new Date();
      // await this.airwattIssueReadyRepository.save(airwattIssueReady);
      // return {
      //   id: airwattIssueReady.memeSell.id,
      //   agent: airwattIssueReady.agent,
      //   code: "00000",
      //   message: "SUCCESSFUL",
      // };
    } else {
      /**
       * TODO: This happens when the phone number does not exist in our records.
       * If the phone number does not exist in our records the we need to do the following:
       * 1. If we can refund the money then we use the refund mechanism given by the API to
       *    refund the money. Most API will refund the money if you send them a response
       *    thats anything but 200.
       * 2. If we can not refund the money then we send a notification to the admin to
       *    refund the money through slack. An example of this is given below.
       */
      // const payload = receivePaymentNotificationInputData;
      // const message = `A payment notification with transactionId ${payload.transactionId} was received for an agent with phone number that does not exist in our records. Please Refund ${payload.currency} ${payload.depositAmount} to phone number ${payload.refId}`;
      // this.slackService.sendMessage(message);
      throw new Errors.AgentDoesNotExist();
    }
  }

  async getUserFromPhoneNo(phoneNo: string) {
    /**
     * TODO: Update this if we use another way to get the user from the phone number. Or Delete this if we do not need it.
     */
    return await this.phoneRepository
      .createQueryBuilder("phone")
      .leftJoinAndSelect("phone.agent", "agent")
      .where("phone.phoneNo IN (:phoneNos)", { phoneNos: this.getPhoneNoList(phoneNo) })
      .andWhere("phone.agent_id IS NOT NULL")
      .andWhere("agent.status IN (:status)", { status: AGENT_STATUS })
      .getOne();
  }

  async savePaymentNotificationToLogs(receivePaymentNotificationInputData: ReceivePaymentNotificationDto) {
    /**
     * TODO: Save the payment notification to the logs.
     * In the current implementation we are saving the payment notification to the
     * database. THis can be done in a different way. we could use logs or have a
     * separete database for logging.
     */

    
  }

  getPhoneNoList(phoneNumber: string): string[] {
    if (phoneNumber.indexOf("+") == 0) phoneNumber = phoneNumber.replace("+", "");
    if (phoneNumber.indexOf(NIGERIA_COUNTRY_CODE) == 0) phoneNumber = phoneNumber.replace(NIGERIA_COUNTRY_CODE, "");
    if (phoneNumber.indexOf("0") == 0) phoneNumber = phoneNumber.replace("0", "");
    phoneNumber = phoneNumber.replace(/ /g, "");
    return [phoneNumber, NIGERIA_COUNTRY_CODE + phoneNumber, "0" + phoneNumber];
  }
}
