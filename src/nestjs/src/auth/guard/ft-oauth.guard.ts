import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class IntraAuthGuard extends AuthGuard('42') {}

 
@Injectable()
export default class JwtTwoFactorGuard extends AuthGuard('jwt-two-factor') {}