import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import BaseEntity from './base.entity';

@Entity('agent')
export class AgentEntity extends BaseEntity{

  @Column({ name: 'serial_number' })
  serialNumber: number;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ nullable: true })
  address: string;

  @Column({ name: 'national_id', nullable: true })
  nationalId: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true, type: 'date' })
  birthday: Date;

  @Column({ nullable: true })
  picture: string;

  @Column({ nullable: true })
  status: string;

  @Column({ name: 'phone_model', nullable: true })
  phoneModel: string;

  @Column({ name: 'changed_to', nullable: true })
  changedTo: number;

  @Column({ name: 'nw_location_id', nullable: true })
  nwLocationId: number;

  @Column({ name: 'potential_agent_id', nullable: true })
  potentialAgentId: number;

  @Column({ name: 'master_owner_id', nullable: true })
  masterOwnerId: number;

  @Column({ nullable: true })
  name: string;

  @Column({ name: 'country_id' })
  country: number;

  @Column({ name: 'region_id' })
  region: number;

  @Column({ name: 'district_id' })
  district: number;

  @Column({ name: 'person_in_charge', nullable: true })
  personInCharge: string;

  @Column({ name: 'is_end_user', default: false })
  isEndUser: boolean;

  @Column({ name: 'installed_at', nullable: true, type: 'date' })
  installedAt: Date;

  @Column({ name: 'uninstalled_at', nullable: true, type: 'date' })
  uninstalledAt: Date;

  @Column({ name: 'recruited_by', nullable: true })
  recruitedBy: string;

  @Column({ name: 'installed_by', nullable: true })
  installedBy: string;

  @Column({ name: 'uninstalled_by', nullable: true })
  uninstalledBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

}
