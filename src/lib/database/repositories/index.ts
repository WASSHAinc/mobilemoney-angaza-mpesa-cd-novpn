import { AgentRepository } from "./agent.repository";
import { AirwattIssueReadyRepository } from "./airwatt-issue-ready.repository";
import { MemeSellRepository } from "./meme-sell.repository";
import { MobileMoneyTypeRepository } from "./mobile-money-type.repository";
import { GenericMobileMoneyLogsDatabaseTableRepository } from "./generic-mobile-money-logs-database-table.repository";
import { PhoneRepository } from "./phone.repository";
import { SenderDescriptionRepository } from "./sender-description.entity";

export const repositories = [
  MemeSellRepository,
  MobileMoneyTypeRepository,
  GenericMobileMoneyLogsDatabaseTableRepository,
  PhoneRepository,
  SenderDescriptionRepository,
  AirwattIssueReadyRepository,
  AgentRepository,
];

export * from "./phone.repository";
export * from "./airwatt-issue-ready.repository";
export * from "./meme-sell.repository";
export * from "./mobile-money-type.repository";
export * from "./generic-mobile-money-logs-database-table.repository";
export * from "./phone.repository";
export * from "./sender-description.entity";
export * from "./agent.repository";
