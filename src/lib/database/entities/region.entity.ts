import { Column, Entity } from "typeorm";
import BaseEntity from "./base.entity";

@Entity('region')
export class RegionEntity extends BaseEntity {
    @Column()
    value: string;

    @Column({ name: 'group_id'})
    countryID: number;

    @Column({ name: 'del_flag', default: false})
    delFlag?: boolean;
}
