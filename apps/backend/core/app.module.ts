import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatchEverythingFilter } from './common/filters/catch-everything.filter';
import { HttpErrorFilter } from './common/filters/http-exception.filter';
import { AccountsModule } from './modules/accounts/accounts.module';
import { ActionsModule } from './modules/actions/actions.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { Auth0Module } from './modules/auth0/auth0.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CommentsModule } from './modules/comments/comments.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { GeoModule } from './modules/geo/geo.module';
import { HealthModule } from './modules/health/health.module';
import { MattersModule } from './modules/matters/matters.module';
import { RisksModule } from './modules/risks/risks.module';
import { SectorsModule } from './modules/sectors/sectors.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { UsersModule } from './modules/users/users.module';
import { configService } from './services/config.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    AuthModule,
    UsersModule,
    Auth0Module,
    GeoModule,
    CompaniesModule,
    AccountsModule,
    CategoriesModule,
    SectorsModule,
    UploadsModule,
    AdminModule,
    CommentsModule,
    HealthModule,
    MattersModule,
    ActionsModule,
    RisksModule,
    ContractsModule,
    DisputesModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
  ],
})
export class AppModule {}
