import { SenderDescriptionEntity } from "../entities";
import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { BaseRepository } from "./base.repository";

@Injectable()
export class SenderDescriptionRepository extends BaseRepository<SenderDescriptionEntity> {
  constructor(private dataSource: DataSource) {
    super(SenderDescriptionEntity, dataSource.createEntityManager());
  }
}
