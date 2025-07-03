import { Module } from '@nestjs/common';
import {
  getDataSourceToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AccountsModule } from '../accounts/accounts.module';
import { Auth0Module } from '../auth0/auth0.module';
import { CompaniesModule } from '../companies/companies.module';
import { GeoModule } from '../geo/geo.module';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { customUserRepositoryMethods } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CompaniesModule,
    Auth0Module,
    GeoModule,
    AccountsModule,
  ],
  providers: [
    UsersService,
    {
      provide: getRepositoryToken(User),
      inject: [getDataSourceToken()],
      useFactory(dataSource: DataSource) {
        // Extend default repository for User with a custom one
        return dataSource
          .getRepository(User)
          .extend(customUserRepositoryMethods);
      },
    },
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
