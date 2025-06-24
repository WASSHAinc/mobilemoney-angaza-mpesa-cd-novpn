import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { MobileMoneyTypeEntity } from './mobile-money-type.entity';
import BaseEntity from './base.entity';
import { AgentEntity } from './agent.entity';


@Entity('phone')
export class PhoneEntity extends BaseEntity {

  @ManyToOne(() => AgentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "agent_id" })
  agent: AgentEntity;

  @Column({ name: "phone_no" })
  phoneNo: string;

  @ManyToOne(() => MobileMoneyTypeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "mobile_money_type_id" })
  mobileMoneyType: MobileMoneyTypeEntity;

  @Column({ name: "registered_first_name" })
  registeredFirstName: string;

  @Column({ name: "registered_middle_name"})
  registeredMiddleName: string;

  @Column({ name: "registered_last_name" })
  registeredLastName: string;

  @Column({ name: "registered_id" })
  registeredId: string;

  @Column({ name: "is_sms_passcode", default: true })
  isSmsPasscode: boolean;

}
