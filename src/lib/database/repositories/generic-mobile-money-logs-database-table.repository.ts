
import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { BaseRepository } from "./base.repository";
import { GenericMobileMoneyLogsDatabaseTableEntity } from "../entities";
/**
 * TODO: replace this repository with the repository to store the logs
 * for the generic mobile money payment
 */
@Injectable()
export class GenericMobileMoneyLogsDatabaseTableRepository extends BaseRepository<GenericMobileMoneyLogsDatabaseTableEntity> {
  constructor(private dataSource: DataSource) {
    super(GenericMobileMoneyLogsDatabaseTableEntity, dataSource.createEntityManager());
  }
}
