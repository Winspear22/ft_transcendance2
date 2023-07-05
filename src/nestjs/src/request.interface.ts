import { Request as ExpressRequest } from 'express';

export interface RequestWithLogout extends ExpressRequest {
  logOut(): void;
}

export interface RequestWithAuthentication extends ExpressRequest {
  isAuthenticated(): boolean;
}

export interface RequestWithLogin extends ExpressRequest 
{
    logIn(user: any, options?: any, done?: (err: any, user: any) => void): void;
}

export interface JwtPayload {
  username: string;
  auth: boolean;
}