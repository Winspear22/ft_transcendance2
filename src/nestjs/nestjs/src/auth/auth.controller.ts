import {
  Controller,
  Get,
  Req,
  UseGuards,
  Res,
  Post,
  Body,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { Response } from 'express';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { FtOauthGuard } from './guard/ft-oauth.guard';
import * as colors from '../colors';
import { JwtAuthGuard } from './guard/jwt-guard.guard';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserEntity } from 'src/user/user.entity';

export class TwoFactorAuthenticationCodeDto {
  @IsString()
  @IsNotEmpty()
  twoFactorAuthenticationCode: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  /*==========================================================================*/
  /*------------------------------42 LOGIN ROUTES-----------------------------*/
  /*==========================================================================*/
  @Public()
  @Get('42/login')
  @UseGuards(FtOauthGuard)
  async login() 
  {
    return ;
  }

  @Public()
  @Get('login/42/return')
  @UseGuards(FtOauthGuard)
  async redirect(@Res({ passthrough: true }) res: Response, @Req() req: ExpressRequest) 
  {
    this.authService.WriteCommandsNames("REQUEST 42 CALLBACK");
    const user = await this.userService.findUserByUsername(req.user['username']);
    this.userService.DisplayUserIdentity(user);
    const username = req.user['username'];
    await this.userService.CreateCookiesForNewUser(res, username);
  }

  @Public()
  @Get('login/guest')
  async redirect2(@Res({ passthrough: true }) res: Response) 
  {
    const c_user = { 
      login: this.userService.generateRandomPseudo(),
      email: "",
    }
    const user = await this.userService.findUserByUsername(c_user['login']);
    if (!user) {
      const rand = Math.random().toString(16).substr(2, 5);

      c_user['login'] = c_user['login'] + rand;
    }
    c_user['email'] = c_user['login'] + "@guest.com"
    const username = await this.userService.createUser2(c_user);
    this.authService.WriteCommandsNames("GUEST CALLBACK");
    await this.userService.CreateCookiesForNewGuest(res, username.username);
  }
  /*==========================================================================*/

  /*==========================================================================*/
  /*--------------------------------LOGOUT ROUTE------------------------------*/
  /*==========================================================================*/
  @Public()
  @Post('Logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: ExpressRequest, @Res() res: Response) 
  { 
    this.authService.WriteCommandsNames("REQUEST LOGOUT");
    const user = req.user as UserEntity;
    try 
    {
      await this.userService.FindAndUpdateUser(user.username, { user_status: 'Offline' });
      await this.userService.FindAndUpdateUser(user.username, { MyHashedRefreshToken: null });
      await this.userService.DisplayUserIdentity(user);
      const partialUser = await this.userService.returnPartialUserInfo(user.username);
      /* VERIFIER S'IL FAUT SUPPRIMER LE COOKIE OU NON*/
      res.clearCookie('PongAccessAndRefreshCookie');
      return res.status(HttpStatus.OK).json({ partialUser });
    } 
    catch (error) 
    {
      console.error(error);
    }
  }

  @Public()
  @Get('check-auth')
  @UseGuards(JwtAuthGuard)
  async checkAuth(@Req() req: ExpressRequest, @Res() res: Response) 
  {
    const user = req.user as UserEntity;
    const accessTokenCookie = req.cookies['PongAccessAndRefreshCookie'];
    if (accessTokenCookie) {
      try 
      {
        if (user)
          return res.json({ success: true, infoUser: user, cookie: accessTokenCookie});
      }
      catch (error) 
      {
        console.error(error);
      }
    }
    return res.json({ success: false });
  }

  /*==========================================================================*/
  
  /*==========================================================================*/
  /*-------------------------------REFRESH ROUTE------------------------------*/
  /*==========================================================================*/

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async CreateNewRefreshToken(@Req() req: ExpressRequest)
  {
    console.log(colors.YELLOW + colors.BRIGHT,"==============================================", colors.RESET);
    console.log(colors.GREEN + colors.BRIGHT, "------------------REFRESH ROUTE--------------", colors.RESET);
    console.log(colors.YELLOW + colors.BRIGHT,"==============================================", colors.RESET);

    const user = req.user as UserEntity;
    try 
    {
      return this.userService.CreateNewRefreshTokens(user.username, user.MyHashedRefreshToken);
    }
    catch (error) 
    {
      console.error(error);
    }
  }
  /*==========================================================================*/


  @Public()
  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async register(@Res() response: Response, @Req() req: ExpressRequest) 
  {
    const userId = req.body.id;
    console.log("USERID ====", userId);
    const user = await this.userService.findUserById(userId);
    console.log('COUCOU JE SUIS DANS GENERATE');
    const result = await this.authService.generateTwoFactorAuthenticationSecret(
      user,
    );
    console.log(result);
    return response.json(result);
  }

  @Public()
  @Post('turn-on')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async turnOnTwoFactorAuthentication(@Body() body, @Res() res: Response) 
  {
    this.authService.WriteCommandsNames("ACTIVATE 2FA");
    const isCodeValid =
      await this.userService.isTwoFactorAuthenticationCodeValid(
        body.TfaCode,
        body.username,
      );
    console.log('TfaCode', body.TfaCode, 'username', body.username);
    console.log("Is the code entered valid ? = ", isCodeValid);
    if (isCodeValid) 
    {
      await this.userService.turnOnTwoFactorAuthentication(body.username,);
      /* RENVOYER LES DATAS DE L'UTILISATEUR*/
      var partialUser = await this.userService.returnPartialUserInfo(body.username);
      console.log(partialUser);
      res.status(200).json({ message: '2FA enabled', partialUser });
    } 
    else 
    {
      /* RENVOYER LES DATAS DE L'UTILISATEUR*/
      var partialUser = await this.userService.returnPartialUserInfo(body.username);
      console.log(partialUser);
      res.status(401).json({ message: 'Invalid 2FA code', partialUser });
    }
  }

  @Public()
  @Post('authenticate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async authenticate(@Req() request, @Body() body, @Res({ passthrough: true }) res: Response) {
    let payload = null;
    this.authService.WriteCommandsNames("AUTHENTICATE");
    try
    {
      this.authService.WriteCommandsNames("1 STEP");
      
      const validation = await this.userService.isTwoFactorAuthenticationCodeValid(
        body.twoFactorAuthenticationCode,
        body.username,
      );
      if (validation)
      {
        this.authService.WriteCommandsNames("2 STEP");

        console.log("validation OK", validation)
        payload = await	this.userService.loginWith2fa(body.username, res);
        console.log("Payload", payload)
        return payload;
      }
    }
    catch{
      console.log("validation Ko")
    }
  }

  @Public()
  @Post('deactivate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async Deactivate2FA(@Body() body, @Res() res: Response ) 
  {
    this.authService.WriteCommandsNames("DEACTIVATE 2FA");
    const response = await this.userService.Deactivate2FA(body.username);
    console.log(response);
    res.status(200).json(response);
  }
  /* A SUPPRIMER AVANT LE PUSH FINAL*/
  @Delete('deleteallusers')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllUsers(@Res() res: Response) {
    await this.userService.deleteAllUsers();
    res.status(200).json({ message: 'All the Users in the database were deleted.' });
  }
}
