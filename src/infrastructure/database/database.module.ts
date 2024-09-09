import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './database.config';

@Module({
  imports: [TypeOrmModule.forRootAsync(databaseConfig)],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
