import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    url: configService.get('database.url'),
    type: 'postgres',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: true, // Set to false in production
  }),
  inject: [ConfigService],
};
