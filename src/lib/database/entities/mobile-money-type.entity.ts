import { Column, Entity } from "typeorm";
import BaseEntity from "./base.entity";

export const MOBILE_MONEY_TYPE_NAME = "Opay (Nigeria)";

@Entity('mobile_money_type')
export class MobileMoneyTypeEntity extends BaseEntity {

  @Column()
  value: string;

  @Column({ name: "del_flag", default: false })
  delFlag: boolean; 
  
}
