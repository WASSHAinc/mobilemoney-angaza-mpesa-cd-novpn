import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import BaseEntity from './base.entity';

@Entity('sender_description')
export class SenderDescriptionEntity extends BaseEntity {
  @Column({ name: "sender_description" })
  senderDescription: string;

  @Column({ name: "del_flag", default: false })
  delFlag: boolean;
}
