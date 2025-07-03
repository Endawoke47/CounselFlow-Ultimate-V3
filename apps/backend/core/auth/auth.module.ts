import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { configService, Env } from '../../services/config.service';
import { Auth0Module } from '../auth0/auth0.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';

// Please do not use forwardRef
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: configService.get(Env.JWT_SECRET),
      signOptions: { expiresIn: '15m' },
    }),
    Auth0Module,
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
})
export class AuthModule {}
