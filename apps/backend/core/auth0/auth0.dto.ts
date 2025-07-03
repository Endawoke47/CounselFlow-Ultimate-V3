export class CreateAuth0UserDto {
  email!: string;
  user_id!: string;
  connection!: string;
  password!: string;
  family_name!: string;

  phone_number?: string;
  user_metadata?: Record<string, unknown>;
  blocked?: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
  app_metadata?: Record<string, unknown>;
  given_name?: string;
  name?: string;
  nickname?: string;
  picture?: string;
  verify_email?: boolean;
  username?: string;
}
