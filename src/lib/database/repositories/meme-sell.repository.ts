import { MemeSellEntity } from "../entities";
import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { BaseRepository } from "./base.repository";

@Injectable()
export class MemeSellRepository extends BaseRepository<MemeSellEntity> {
  constructor(private dataSource: DataSource) {
    super(MemeSellEntity, dataSource.createEntityManager());
  }
}
