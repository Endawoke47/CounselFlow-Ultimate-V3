import { Module } from '@nestjs/common';
import { AccountsModule } from 'src/modules/accounts/accounts.module';
import { CompaniesModule } from 'src/modules/companies/companies.module';
import { UsersModule } from 'src/modules/users/users.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [UsersModule, CompaniesModule, AccountsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
