import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

class UserPassLoginDto {
  @ApiProperty({
    example: 'mike@1pd-dev.com',
    description: 'User email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'mike@1pd-dev.com',
    description: 'User password',
  })
  @IsString()
  password!: string;
}

class LoginResponseDto {
  @ApiProperty({
    example: 'Login successful',
    description: 'Success message',
  })
  message!: string;
}

class LogoutResponseDto {
  @ApiProperty({
    example: 'Logout successful',
    description: 'Success message',
  })
  message!: string;
}

class RefreshResponseDto {
  @ApiProperty({
    example: 'Token refreshed',
    description: 'Success message',
  })
  message!: string;
}

class ValidateTokenResponseDto {
  @ApiProperty({
    example: 'Token validated Successfully',
    description: 'Success message',
  })
  message!: string;

  @ApiProperty({
    description: 'User information',
    type: Object,
    additionalProperties: true,
  })
  user!: any;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description:
      'Login with email and password to receive authentication tokens in cookies',
  })
  @ApiBody({ type: UserPassLoginDto })
  @ApiOkResponse({
    description: 'Login successful, authentication cookies set',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid credentials or email format',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password',
  })
  async login(@Body() body: UserPassLoginDto, @Res() res: Response) {
    const userData = await this.authService.login(body.email, body.password);

    res.cookie('accessToken', userData.auth0Data.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });
    res.cookie('idToken', userData.auth0Data.id_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });

    return res.json(userData.user);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'User logout',
    description: 'Clear all authentication cookies',
  })
  @ApiOkResponse({
    description: 'Logout successful, cookies cleared',
    type: LogoutResponseDto,
  })
  logout(@Res() res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('idToken');
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logout successful' });
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Use refresh token to obtain new access token',
  })
  @ApiCookieAuth('refreshToken')
  @ApiOkResponse({
    description: 'Token refreshed successfully',
    type: RefreshResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
  })
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.refreshToken;
    const newTokens = await this.authService.refreshTokens(refreshToken);

    res.cookie('accessToken', newTokens.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });
    return res.json({ message: 'Token refreshed' });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Get current user profile information using ID token',
  })
  @ApiCookieAuth('idToken')
  @ApiOkResponse({
    description: 'User profile information retrieved successfully',
    type: 'object',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing ID token',
  })
  async getProfile(@Req() req: any) {
    const user = await this.authService.getUserInfo(req.cookies.idToken);
    return user;
  }

  @Post('validate-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Validate token',
    description: 'Validate the current ID token and return user information',
  })
  @ApiCookieAuth('idToken')
  @ApiOkResponse({
    description: 'Token validated successfully',
    type: ValidateTokenResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing ID token',
  })
  async validateToken(@Req() req: Request) {
    const user = await this.authService.getUserInfo(req.cookies.idToken);
    return {
      message: 'Token validated Successfully',
      user,
    };
  }
}
