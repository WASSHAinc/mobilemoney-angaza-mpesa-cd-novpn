import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { MemeSellEntity } from './meme-sell.entity';
import BaseEntity from './base.entity';
import { AgentEntity } from './agent.entity';

@Entity('airwatt_issue_ready')
export class AirwattIssueReadyEntity extends BaseEntity {

  @ManyToOne(() => AgentEntity)
  @JoinColumn({ name: 'agent_id' })
  agent: AgentEntity;

  @ManyToOne(() => MemeSellEntity)
  @JoinColumn({ name: 'meme_sell_id' })
  memeSell: MemeSellEntity;

  @Column()
  airwatt: number;

}
