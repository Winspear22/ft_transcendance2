export interface JwtPayload {
  username: string;
  auth: boolean;
  sub?: string;
  iat?: number;
  exp?: number;
}