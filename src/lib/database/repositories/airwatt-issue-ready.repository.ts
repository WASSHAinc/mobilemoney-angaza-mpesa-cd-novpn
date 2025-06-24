import { AirwattIssueReadyEntity } from "../entities";
import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { BaseRepository } from "./base.repository";

@Injectable()
export class AirwattIssueReadyRepository extends BaseRepository<AirwattIssueReadyEntity> {
  constructor(private dataSource: DataSource) {
    super(AirwattIssueReadyEntity, dataSource.createEntityManager());
  }
}
