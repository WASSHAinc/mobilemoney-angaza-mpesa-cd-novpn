import { AgentEntity } from "./agent.entity";
import { AirwattIssueReadyEntity } from "./airwatt-issue-ready.entity";
import { DistrictEntity } from "./district.entity";
import { MemeSellEntity } from "./meme-sell.entity";
import { MobileMoneyTypeEntity } from "./mobile-money-type.entity";
import { GenericMobileMoneyLogsDatabaseTableEntity } from "./generic-mobile-logs-data-table.sample"; //TODO: Update the import statement to match the entity file
import { PhoneEntity } from "./phone.entity";
import { RegionEntity } from "./region.entity";
import { SenderDescriptionEntity } from "./sender-description.entity";

const entities = [
  PhoneEntity,
  AirwattIssueReadyEntity,
  MemeSellEntity,
  SenderDescriptionEntity,
  MobileMoneyTypeEntity,
  AgentEntity,
  DistrictEntity,
  RegionEntity,
  GenericMobileMoneyLogsDatabaseTableEntity, //TODO: Update this line to match the entity file
];

export default entities;

export * from "./agent.entity";
export * from "./airwatt-issue-ready.entity";
export * from "./meme-sell.entity";
export * from "./mobile-money-type.entity";
export * from "./generic-mobile-logs-data-table.sample";
export * from "./phone.entity";
export * from "./sender-description.entity";
export * from "./region.entity";
export * from "./district.entity";
