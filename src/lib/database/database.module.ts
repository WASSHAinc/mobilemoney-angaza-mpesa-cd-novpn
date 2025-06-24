import { Module } from '@nestjs/common';
import { repositories } from './repositories';
import entities from './entities';

@Module({
  providers: [...repositories, ...entities],
  exports: [...repositories, ...entities],
})
export class DatabaseModule {}
