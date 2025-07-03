import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios, { AxiosError } from 'axios';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import { configService, Env } from '../../services/config.service';
import { Auth0Service } from '../auth0/auth0.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly auth0Domain: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly audience: string;
  private readonly jwtSecret: string;
  private readonly jwksClient: jwksClient.JwksClient;

  constructor(
    private readonly jwtService: JwtService,
    private readonly auth0Service: Auth0Service,
    private readonly userService: UsersService,
  ) {
    this.jwksClient = new jwksClient.JwksClient({
      jwksUri: `https://${configService.get(Env.AUTH0_DOMAIN)}/.well-known/jwks.json`, // Replace with your Auth0 domain
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
    });
    this.auth0Domain = configService.get(Env.AUTH0_DOMAIN);
    this.clientId = configService.get(Env.AUTH0_CLIENT_ID);
    this.clientSecret = configService.get(Env.AUTH0_CLIENT_SECRET);
    this.audience = configService.get(Env.AUTH0_AUDIENCE);
    this.jwtSecret = configService.get(Env.JWT_SECRET);
  }

  async login(email: string, password: string) {
    try {
      const auth0Data = await this.auth0Service.login(email, password);
      const decoded = await this.decodeToken(auth0Data.id_token);
      const user = await this.getUserData(decoded.sub);

      return { auth0Data, user };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        Logger.error(axiosError.response?.data);
      } else {
        Logger.error(error);
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async validateUser(userData: any) {
    const payload = { sub: userData.id, email: userData.email };

    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: '15m',
        algorithm: 'HS256',
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '7d',
        algorithm: 'HS256',
      }),
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        algorithms: ['HS256'],
      });
      return {
        accessToken: this.jwtService.sign(
          { sub: payload.sub, email: payload.email },
          { expiresIn: '15m', algorithm: 'HS256' },
        ),
      };
    } catch (e) {
      Logger.error(e);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getUserInfo(idToken: string) {
    const decoded = await this.decodeToken(idToken);
    const userId = decoded.sub; // 'sub' is the user ID in Auth0
    const user = {
      id: userId,
      email: decoded.email,
      name: decoded.name,
      // Add other claims as needed
    };
    return user;
  }

  private async getKey(header: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.jwksClient.getSigningKey(header.kid, (err, key) => {
        if (err) {
          reject(err);
        } else {
          if (key === undefined) {
            return reject('Invalid key');
          }
          const signingKey = key.getPublicKey();
          resolve(signingKey);
        }
      });
    });
  }

  // Verify and decode the JWT
  async decodeToken(token: string): Promise<any> {
    const decodedHeader = jwt.decode(token, { complete: true });
    if (decodedHeader === null) {
      throw new UnauthorizedException('Invalid token');
    }
    const key = await this.getKey(decodedHeader.header);

    const decoded = jwt.verify(token, key, {
      audience: this.clientId,
      algorithms: ['RS256'],
    });

    return decoded;
  }

  async getUserData(auth0Sub: string) {
    let user = null;
    try {
      const userUuid = auth0Sub.split('|')[1];
      user = await this.userService.findByUuid(userUuid);
      if (user === null) {
        throw new BadRequestException('User or password wrong');
      }
    } catch (error) {
      console.log('error: ', error);
      throw new BadRequestException('User or password wrong');
    }

    return user;
  }
}
