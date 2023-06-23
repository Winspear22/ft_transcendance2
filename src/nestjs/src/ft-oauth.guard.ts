import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithLogin } from './request.interface'; // Assurez-vous que le chemin d'importation est correct

@Injectable()
export class FtOauthGuard extends AuthGuard('42') 
{
  async canActivate(context: ExecutionContext): Promise<boolean> 
  {
    const activate: boolean = (await super.canActivate(context)) as boolean;
    const request: RequestWithLogin = context.switchToHttp().getRequest();
    await super.logIn(request);
    console.log("salut je suis ici les amis -- ft-oauth\n");
    return activate;
  }
}

