import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import { configService, Env } from 'src/services/config.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateAuth0UserDto } from './auth0.dto';

@Injectable()
export class Auth0Service {
  private managementToken: string | null = null;
  private tokenExpiry: number = 0;
  private auth0Domain: string;
  private clientId: string;
  private clientSecret: string;
  private auth0ManagementScopes: string[] = [
    'create:users read:users update:users delete:users',
    'create:users_app_metadata read:users_app_metadata update:users_app_metadata delete:users_app_metadata',
  ]; // Auth0 Dashboard > APIs > Auth0 Management API > Permissions tab
  private axiosInstance = axios.create();

  constructor() {
    this.auth0Domain = configService.get(Env.AUTH0_DOMAIN);
    this.clientId = configService.get(Env.AUTH0_CLIENT_ID);
    this.clientSecret = configService.get(Env.AUTH0_CLIENT_SECRET);

    this.axiosInstance.interceptors.request.use(
      config => {
        // Check if the request already has a Request ID; if not, generate one
        const requestId = config.headers['X-Request-ID'] || uuidv4();
        config.headers['X-Request-ID'] = requestId; // Ensure it's attached to headers

        // Attach metadata for logging
        (config as any).metadata = {
          requestId,
          startTime: new Date().getTime(),
        };

        Logger.log(
          `Auth0 [${requestId}] ⏩ Request: ${config.method?.toUpperCase()} ${config.url}`,
        );
        if (config.data) {
          Logger.log(
            `Auth0 [${requestId}] 📦 Payload: ${JSON.stringify(config.data)}`,
          );
        }

        return config;
      },
      error => {
        Logger.error(`Auth0 🚨 Request Error ${JSON.stringify(error)}`);
        return Promise.reject(error);
      },
    );

    this.axiosInstance.interceptors.response.use(
      response => {
        const metadata = (response.config as any).metadata;
        const endTime = new Date().getTime();
        const processingTime = endTime - metadata.startTime;

        Logger.log(
          `Auth0 [${metadata.requestId}] ✅ Response: ${response.status} - Time: ${processingTime}ms`,
        );
        Logger.log(
          `Auth0 [${metadata.requestId}] ✅ Response data: ${JSON.stringify(response.data, null, 4)}`,
        );

        return response;
      },
      error => {
        if (error.config) {
          const metadata = (error.config as any).metadata;
          const endTime = new Date().getTime();
          const processingTime = metadata
            ? endTime - metadata.startTime
            : 'Unknown';

          Logger.error(
            `Auth0 [${metadata?.requestId}] ❌ Error ${JSON.stringify(axios.isAxiosError(error) ? error.response?.data : error)} - Time: ${processingTime}ms`,
          );
        }
        return Promise.reject(error);
      },
    );
  }

  private async getManagementToken(): Promise<string> {
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds

    if (this.managementToken && currentTime < this.tokenExpiry) {
      return this.managementToken; // Return cached token
    }

    try {
      const response = await this.axiosInstance.post(
        `https://${this.auth0Domain}/oauth/token`,
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          audience: `https://${this.auth0Domain}/api/v2/`,
          grant_type: 'client_credentials',
          scope: this.auth0ManagementScopes.join(' '),
        },
      );

      this.managementToken = response.data.access_token;
      if (this.managementToken === null) {
        throw new Error('No access token found');
      }
      this.tokenExpiry = currentTime + response.data.expires_in - 60; // Subtract 60 sec buffer

      return this.managementToken;
    } catch (error) {
      Logger.error(
        `Error fetching Auth0 Management Token: ${JSON.stringify(error)}`,
      );
      throw new HttpException(
        'Failed to retrieve Auth0 token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createUser(body: CreateAuth0UserDto): Promise<any> {
    try {
      const response = await this.axiosInstance.post(
        `https://${this.auth0Domain}/api/v2/users`,
        JSON.stringify(body),
        {
          headers: {
            Authorization: `Bearer ${await this.getManagementToken()}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      return response.data;
    } catch (error: any) {
      // Check if it's a "user already exists" error which we can safely ignore
      if (error.response?.data?.message?.includes('already exists')) {
        Logger.warn(
          `Auth0 user already exists for email ${body.email}, continuing without error`,
        );
        // Return something to indicate the user already exists but not throw an error
        return {
          message: 'User already exists in Auth0',
          email: body.email,
          statusCode: error.response?.status || 409,
        };
      }

      console.log('error: ', error);
      Logger.error(`Error creating Auth0 user: ${JSON.stringify(error)}`);
      throw new HttpException(
        `Failed to create user: ${error.response?.data?.message || 'Unknown error'}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUsers(q?: Record<string, string>): Promise<any> {
    const response = await this.axiosInstance.get(
      `https://${this.auth0Domain}/api/v2/users?${new URLSearchParams(q)}`,
      {
        headers: {
          Authorization: `Bearer ${await this.getManagementToken()}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );
    return response.data;
  }

  async getUser(userId: number): Promise<any> {
    const response = await this.axiosInstance.get(
      `https://${this.auth0Domain}/api/v2/users/auth0|${userId}`,
      {
        headers: { Authorization: `Bearer ${await this.getManagementToken()}` },
      },
    );
    return response.data;
  }

  async login(email: string, password: string) {
    try {
      const response = await this.axiosInstance.post<{
        access_token: string;
        id_token: string;
        scope: string;
        expires_in: number;
        token_type: string;
      }>(`https://${this.auth0Domain}/oauth/token`, {
        grant_type: 'password',
        // grant_type: 'refresh_token',
        username: email,
        password,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        audience: configService.get(Env.AUTH0_AUDIENCE),
        scope: 'openid profile email offline_access',
        connection: 'Username-Password-Authentication',
      });

      return response.data;
    } catch {
      throw new BadRequestException('Invalid email or password');
    }
  }

  /**
   * Delete a user from Auth0
   *
   * @param userId The Auth0 user ID to delete
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await this.axiosInstance.delete(
        `https://${this.auth0Domain}/api/v2/users/auth0|${userId}`,
        {
          headers: {
            Authorization: `Bearer ${await this.getManagementToken()}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
    } catch (error: any) {
      Logger.error(`Error deleting Auth0 user: ${JSON.stringify(error)}`);
      throw new HttpException(
        `Failed to delete user: ${error.response?.data?.message || 'Unknown error'}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a user's password in Auth0
   *
   * @param userId The Auth0 user ID
   * @param password The new password
   */
  async updateUserPassword(userId: string, password: string): Promise<void> {
    try {
      await this.axiosInstance.patch(
        `https://${this.auth0Domain}/api/v2/users/auth0|${userId}`,
        {
          password,
          connection: 'Username-Password-Authentication',
        },
        {
          headers: {
            Authorization: `Bearer ${await this.getManagementToken()}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
    } catch (error: any) {
      Logger.error(
        `Error updating Auth0 user password: ${JSON.stringify(error)}`,
      );
      throw new HttpException(
        `Failed to update user password: ${error.response?.data?.message || 'Unknown error'}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update all user fields in Auth0
   *
   * @param userId The Auth0 user ID
   * @param data User data to update
   */
  async updateUser(
    userId: string,
    data: {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      title?: string;
      department?: string;
    },
  ): Promise<void> {
    try {
      const updateData: any = {
        connection: 'Username-Password-Authentication',
      };

      // Map our fields to Auth0 fields
      if (data.email) updateData.email = data.email;
      if (data.password) updateData.password = data.password;
      if (data.firstName) updateData.given_name = data.firstName;
      if (data.lastName) updateData.family_name = data.lastName;
      if (data.phone) updateData.phone_number = data.phone;
      if (data.title)
        updateData.user_metadata = {
          ...updateData.user_metadata,
          title: data.title,
        };
      if (data.department)
        updateData.user_metadata = {
          ...updateData.user_metadata,
          department: data.department,
        };

      console.log('updateData', updateData);

      await this.axiosInstance.patch(
        `https://${this.auth0Domain}/api/v2/users/auth0|${userId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${await this.getManagementToken()}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
    } catch (error: any) {
      Logger.error(`Error updating Auth0 user: ${JSON.stringify(error)}`);
      throw new HttpException(
        `Failed to update user: ${error.response?.data?.message || 'Unknown error'}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
