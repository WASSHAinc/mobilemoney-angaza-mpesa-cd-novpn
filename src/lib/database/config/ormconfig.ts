import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const ormConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT  || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    `${__dirname}/../**/*.entity.{js,ts}`,
  ],
  migrations: ['bazel-bin/src/lib/database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  synchronize: false,
};

export default ormConfig;
