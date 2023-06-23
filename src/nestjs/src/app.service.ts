import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService 
{
  getHello(): string 
  {
    return 'Bravo, tu t\'es connecte avec succes a 42 et a google !';
  }

  googleLogin(req) 
  {
    if (!req.user) {
      return 'No user from google'
    }
    return {
      message: 'User Info from Google',
      user: req.user
    }
  }
}
