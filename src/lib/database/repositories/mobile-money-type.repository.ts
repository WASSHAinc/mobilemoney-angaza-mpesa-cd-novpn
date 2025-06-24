import { MobileMoneyTypeEntity } from "../entities";
import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { BaseRepository } from "./base.repository";

@Injectable()
export class MobileMoneyTypeRepository extends BaseRepository<MobileMoneyTypeEntity> {
  constructor(private dataSource: DataSource) {
    super(MobileMoneyTypeEntity, dataSource.createEntityManager());
  }
}
