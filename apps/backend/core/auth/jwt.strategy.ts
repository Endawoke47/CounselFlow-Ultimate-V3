import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import * as jwksRsa from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { configService, Env } from '../../services/config.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-cookie') {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.accessToken,
      ]),
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksUri: `https://${configService.get(Env.AUTH0_DOMAIN)}/.well-known/jwks.json`,
      }),
      audience: configService.get(Env.AUTH0_AUDIENCE),
      issuer: `https://${configService.get(Env.AUTH0_DOMAIN)}/`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    const userData = await this.getUserData(payload.sub);

    return userData;
  }

  async getUserData(auth0Sub: string) {
    let user = null;
    try {
      const userUuid = auth0Sub.split('|')[1];
      user = await this.userService.findByUuid(userUuid);
      if (user === null) {
        throw new Error('Can find user');
      }
    } catch (error) {
      console.log('error: ', error);
      throw new ForbiddenException('Invalid user');
    }

    return user;
  }
}
