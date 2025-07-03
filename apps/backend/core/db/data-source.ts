import 'dotenv/config';
import { configService } from '../services/config.service';
import { DataSource, DataSourceOptions } from 'typeorm';

export const AppDataSource = new DataSource(
  configService.getTypeOrmConfig() as DataSourceOptions,
);
