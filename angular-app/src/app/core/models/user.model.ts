/**
 * Base User interface
 */
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  role: UserRole;
  roles?: UserRole[];
  status: UserStatus;
  createdAt: Date | string;
  updatedAt?: Date | string;
  lastLoginAt?: Date | string;
}

/**
 * User roles
 */
export type UserRole = 'user' | 'admin' | 'superadmin' | 'moderator';

/**
 * User status
 */
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

/**
 * Auth tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

/**
 * User profile update
 */
export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
}
