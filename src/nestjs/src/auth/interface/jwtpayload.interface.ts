export interface JwtPayload 
{
  username: string;
  auth: boolean;
  twofa?: boolean;
  sub?: string;
  iat?: number;
  exp?: number;
}