import { Module } from '@nestjs/common';
import { ClientModule } from '../client/client.module';
import { AngazaServiceAgent } from './angaza.agent';

@Module({
  providers: [AngazaServiceAgent],
  imports: [ClientModule],
  exports: [AngazaServiceAgent],
})
export class AngazaAgentModule {}
