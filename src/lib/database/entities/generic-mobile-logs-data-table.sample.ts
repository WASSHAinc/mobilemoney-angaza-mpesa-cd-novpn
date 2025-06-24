import { Column, Entity, OneToOne, JoinColumn } from "typeorm";
import BaseEntity from "./base.entity";
import { MemeSellEntity } from "./meme-sell.entity";

export enum GenericMobileMoneyLogsDatabaseTableStatusEnum {
  RECEIVED = "RECEIVED",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

/**
 * TODO: Update the entity to match the database table we will be using
 * to store the logs for the generic mobile money payment. We will change
 * the names of the entity to match the database table. e.g.
 */
@Entity("generic_mobile_money_logs_database_table")
export class GenericMobileMoneyLogsDatabaseTableEntity extends BaseEntity {
  @Column()
  amount: number;

  @Column()
  currency: string;

  @Column({ name: "error_message", nullable: true })
  errorMessage: string;

  @Column({ name: "error_code", nullable: true })
  errorCode: string;

  @Column()
  status: GenericMobileMoneyLogsDatabaseTableStatusEnum;

  @Column({ name: "deposit_time", type: "date" })
  depositTime: Date;

  @Column({ name: "transaction_id" })
  transactionId: string;

  @OneToOne(() => MemeSellEntity)
  @JoinColumn({ name: "meme_sell_id" })
  memesell?: MemeSellEntity;
}
