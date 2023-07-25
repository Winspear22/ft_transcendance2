import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class IntraAuthGuard extends AuthGuard('42') {}

 
@Injectable()
export default class JwtTwoFactorGuard extends AuthGuard('jwt-two-factor') {}

@Injectable()
export class FtOauthGuard extends AuthGuard('42') {
  async canActivate(context: ExecutionContext) {
    const activate = (await super.canActivate(context)) as boolean;
    context.switchToHttp().getRequest();

    // console.log('La requete de 42 OAuthguard', request);
    return activate;
  }
}