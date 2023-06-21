import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RequestWithAuthentication } from './request.interface'; // Assurez-vous que le chemin d'importation est correct

@Injectable()
export class AuthenticatedGuard implements CanActivate 
{
  async canActivate(context: ExecutionContext): Promise<boolean> 
  {
    const req: RequestWithAuthentication = context.switchToHttp().getRequest();
    console.log("salut je suis ici les amis -- auth-guard\n");

    return req.isAuthenticated();
  }
}