import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { MobileMoneyTypeEntity } from "./mobile-money-type.entity";
import { SenderDescriptionEntity } from "./sender-description.entity";
import BaseEntity from "./base.entity";
import { AgentEntity } from "./agent.entity";

@Entity("meme_sell")
export class MemeSellEntity extends BaseEntity {
  @Column({ name: "phone_no" })
  phoneNo: string;

  @Column()
  meme: number;

  @Column()
  money: number;

  @Column({ name: "sms_received_local_time", nullable: true, type: "date" })
  smsReceivedLocalTime: Date;

  @Column({ name: "sms_id" })
  smsId: number;

  @Column({ name: "buyer_last_name", nullable: true })
  buyerLastName: string;

  @Column({ name: "buyer_first_name", nullable: true })
  buyerFirstName: string;

  @Column({ name: "registered_id", nullable: true })
  registeredId: string;

  @Column({ name: "kessai_date", nullable: true, type: "timestamp" })
  kessaiDate: Date;

  @Column({ name: "mpesa_code", nullable: true })
  mpesaCode: string;

  @ManyToOne(() => MobileMoneyTypeEntity)
  @JoinColumn({ name: "sender_id" })
  sender: MobileMoneyTypeEntity;

  @ManyToOne(() => SenderDescriptionEntity)
  @JoinColumn({ name: "sender_description_id" })
  senderDescription: SenderDescriptionEntity;

  @Column({ name: "reason", nullable: true })
  reason: string;

  @Column({ name: "input_by", nullable: true })
  inputBy: string;

  @ManyToOne(() => AgentEntity)
  @JoinColumn({ name: "agent_id" })
  agent: AgentEntity;

  @Column({ name: "meme_download_time", nullable: true, type: "date" })
  memeDownloadTime: Date;

  @Column({ name: "created_time", nullable: true, type: "date" })
  createdTime: Date;
}
