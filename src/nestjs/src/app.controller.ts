import { Controller, Get, Req, Post, Body, UseGuards, Redirect, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Profile } from 'passport-42'
import { User } from './user.decorator'
import { AuthenticatedGuard } from './authenticated.guard';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { FtOauthGuard } from './ft-oauth.guard';


import { Request as ExpressRequest } from 'express';

interface Request extends ExpressRequest {
  isAuthenticated(): boolean;
  logOut(): void;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string 
  {
    return this.appService.getHello();
  }
  /*Ne fais pas attention a cette route, c'est juste pour tester le bouton login*/
  @Post()
  handleLogin(@Body() data: any) 
  {
    console.log('Message from Vue.js:', data);
  }
  /*-----------------------------------*/
  @Get()
  home(@User() user: Profile) 
  {
    return { user };
  }

  @Get('login')
  logIn() 
  {
    return;
  }

  @Get('profile')
  @UseGuards(AuthenticatedGuard)
  profile(@User() user: Profile) 
  {
    return { user };
  }

  @Get('logout')
  @Redirect('/')
  logOut(@Req() req: Request) 
  {
    req.logOut();
  }

  @Get('auth/42')
  @UseGuards(AuthGuard('42'))  // Utilisation uniquement du guard pour 42
  async auth42(@Req() req) 
  {

  }

  @Get('auth/google')
  @UseGuards(AuthGuard('google'))  // Utilisation uniquement du guard pour Google
  async authGoogle(@Req() req) 
  {

  }

  @Get('auth/google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res: Response) {
    this.appService.googleLogin(req);
    res.redirect('/');
  }
}

@Controller('login')
export class LoginController {
  @Get('42')
  @UseGuards(FtOauthGuard)
  ftAuth() {}

  @Get('42/return')
  @UseGuards(FtOauthGuard)
  @Redirect('/login/google')  // Redirige vers Google après le succès de 42
  ftAuthCallback() {}

  @Get('google')
  @UseGuards(AuthGuard('google'))  // Authentification Google OAuth
  googleAuth() {}

  @Get('google/return')
  @UseGuards(AuthGuard('google'))  // Callback de Google OAuth
  @Redirect('/')
  googleAuthCallback() {}
}

  /*Comment cela aurait ete code sans l'@User
  @Get('profile')
  @UseGuards(AuthenticatedGuard)
  @Render('profile')
  profile(@Req() request: Request) 
  {
    const user = request.user;
    return { user };
  }
*/