export type Auth0CreateUserPayload = {
  email: string;
  phone_number: string;
  user_metadata?: Record<string, unknown>;
  blocked?: boolean;
  email_verified: boolean;
  phone_verified?: boolean;
  app_metadata?: Record<string, unknown>;
  given_name?: string;
  family_name?: string;
  name?: string;
  nickname?: string;
  picture?: string;
  user_id: string;
  connection?: string;
  password: string;
  verify_email: boolean;
  username: string;
};
