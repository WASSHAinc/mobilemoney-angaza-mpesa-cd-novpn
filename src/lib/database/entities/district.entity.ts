import { Column, Entity } from "typeorm";
import BaseEntity from "./base.entity";

@Entity('district')
export class DistrictEntity extends BaseEntity {
    @Column()
    value: string;

    @Column({ name: 'region_id'})
    regionID: number;

    @Column({ name: 'del_flag', default: false})
    delFlag?: boolean;
}
