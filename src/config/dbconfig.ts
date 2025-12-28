import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dbConfig: DataSourceOptions = {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.DB_SYNC === 'true' || false,
    logging: false,
    migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
};

const dataSource = new DataSource(dbConfig);

export default dataSource;
