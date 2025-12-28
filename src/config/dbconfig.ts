import { DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export default (configService: ConfigService): DataSourceOptions => {
    const host = configService.get<string>('DB_HOST');
    const port = configService.get<number>('DB_PORT', 3306);
    const username = configService.get<string>('DB_USER');
    const password = configService.get<string>('DB_PASS');
    const database = configService.get<string>('DB_NAME');
    const synchronize = configService.get<boolean>('DB_SYNC', true);

    return {
        type: 'mysql',
        host,
        port,
        username,
        password,
        database,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize,
        logging: false,
    };
};
