import { Controller, Get, Req, UseGuards, Redirect, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Profile } from 'passport-42'
import { User } from './user.decorator'
import { AuthenticatedGuard } from './authenticated.guard';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { FtOauthGuard } from './ft-oauth.guard';
import { Request } from 'express';
import { UserService } from './user.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  logIn() 
  {
    return;
  }

  @Get('profile')
  @UseGuards(AuthenticatedGuard)
  profile(@User() user: Profile) 
  {
    console.log(user.id);
    console.log(user.username);
    return { user };
  }

  @Get('logout')
  logOut(@Req() req: Request, @Res() res: Response) {
      req.session.destroy(err => {
          if (err) {
              return res.send('Logout failed')
          }
          
          res.clearCookie('connect.sid');
          res.redirect('/');
      });
  }
}

@Controller('login')
export class LoginController 
{
  constructor(private userService: UserService) {} 

  @Get('42')
  @UseGuards(FtOauthGuard)
  ftAuth() {}

  @Get('42/return')
  @UseGuards(FtOauthGuard)
  @Redirect('/login/google')  // Redirige vers Google après le succès de 42
  ftAuthCallback()
  {
    console.log("JE SUIS DANS 42OAuTH");
    console.log("JE SUIS DANS 42OAuTH");
    console.log("JE SUIS DANS 42OAuTH");
    console.log("JE SUIS DANS 42OAuTH");
    console.log("JE SUIS DANS 42OAuTH");
    console.log("JE SUIS DANS 42OAuTH");

  }

  @Get('google')
  @UseGuards(AuthGuard('google'))  // Authentification Google OAuth
  async googleAuth(@User() user: Profile, @Res() response: Response): Promise<void> {
    console.log("jevais créer l'utilisateur ");

    const new_user = await this.userService.createUser(user.username); // Utilisez le nom d'utilisateur à partir des informations de l'utilisateur
    console.log("J'ai crée l'utilisateur, il est ici : ");
    console.log(new_user); // Loggez l'utilisateur pour vérifier qu'il a bien été créé
  }
  /*@Get('google/return')
  @UseGuards(AuthGuard('google'))  // Callback de Google OAuth
  @Redirect('/')
  async googleAuthCallback(@Req() req: any, @Res() response: Response): Promise<void> 
  {
    const new_user = await this.userService.createUser(); // Créez et sauvegardez le nouvel utilisateur
    console.log(new_user); // Loggez l'utilisateur pour vérifier qu'il a bien été créé
  }*/

  /*@Get('google/return')
  @UseGuards(AuthGuard('google'))  // Callback de Google OAuth
  @Redirect('/')
  async googleAuthCallback(@User() user: Profile, @Res() response: Response): Promise<void> {
    const new_user = await this.userService.createUser(user.username); // Utilisez le nom d'utilisateur à partir des informations de l'utilisateur
    console.log("J'ai crée l'utilisateur, il est ici : ");
    console.log(new_user); // Loggez l'utilisateur pour vérifier qu'il a bien été créé
  }*/
}