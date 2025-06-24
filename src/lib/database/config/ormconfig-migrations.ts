import { DataSource, DataSourceOptions } from 'typeorm';
import ormConfig from './ormconfig';

const dataSource = new DataSource(ormConfig as DataSourceOptions);

export default dataSource;
