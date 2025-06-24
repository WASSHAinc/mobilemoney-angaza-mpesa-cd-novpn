import { PhoneEntity } from "../entities";
import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { BaseRepository } from "./base.repository";

@Injectable()
export class PhoneRepository extends BaseRepository<PhoneEntity> {
  constructor(private dataSource: DataSource) {
    super(PhoneEntity, dataSource.createEntityManager());
  }
}
