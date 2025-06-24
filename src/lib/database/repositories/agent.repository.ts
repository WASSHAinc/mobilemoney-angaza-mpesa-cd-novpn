import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { AgentEntity } from "../entities";
import { BaseRepository } from "./base.repository";

@Injectable()
export class AgentRepository extends BaseRepository<AgentEntity> {
  constructor(private dataSource: DataSource) {
    super(AgentEntity, dataSource.createEntityManager());
  }
}
