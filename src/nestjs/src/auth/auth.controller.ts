import {
  Controller,
  Get,
  Req,
  UseGuards,
  Res,
  Post,
  Body,
  Delete,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  ExecutionContext
} from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { Response } from 'express';
import { IntraAuthGuard } from './guard/ft-oauth.guard';
import { Request as ExpressRequest } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { FtOauthGuard } from './guard/ft-oauth.guard';
import * as colors from '../colors';


import { IsNotEmpty, IsString } from 'class-validator';

export class TwoFactorAuthenticationCodeDto {
  @IsString()
  @IsNotEmpty()
  twoFactorAuthenticationCode: string;
}

@Controller()
export class AuthController {
  constructor(
    private jwtService: JwtService,
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
  /*==========================================================================*/

  /*==========================================================================*/
  /*--------------------------------LOGOUT ROUTE------------------------------*/
  /*==========================================================================*/
  @Public()
  @Post('Logout')
  async logout(@Req() req: ExpressRequest) 
  { 
    this.authService.WriteCommandsNames("REQUEST LOGOUT");
    const accessTokenCookie = req.cookies['PongAccessAndRefreshCookie'];
    if (accessTokenCookie) 
    {
      try 
      {
        const userData = JSON.parse(accessTokenCookie);
        const { username } = userData;
        let user = await this.userService.findUserByUsername(username);
        this.userService.FindAndUpdateUser(user.username, { user_status: 'Offline' });
        this.userService.FindAndUpdateUser(user.username, { MyHashedRefreshToken: null });
        let user2 = await this.userService.findUserByUsername(username);
        await this.userService.DisplayUserIdentity(user2);
      } 
      catch (error) 
      {
        console.error(error);
      }
    }

  }
  @Public()
  @Get('check-auth')
  async checkAuth(@Req() req: ExpressRequest, @Res() res: Response) {
    const accessTokenCookie = req.cookies['PongAccessAndRefreshCookie'];
    if (accessTokenCookie) {
      try 
      {
        const userData = JSON.parse(accessTokenCookie);
        const { username } = userData;
        const user = await this.userService.findUserByUsername(username);
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
  //@UseGuards(RtGuard) //A quoi sert le Guard
  @Post('refresh')
  async CreateNewRefreshToken(@Req() req: ExpressRequest)
  {
    console.log(colors.YELLOW + colors.BRIGHT,"==============================================", colors.RESET);
    console.log(colors.GREEN + colors.BRIGHT, "------------------REFRESH ROUTE--------------", colors.RESET);
    console.log(colors.YELLOW + colors.BRIGHT,"==============================================", colors.RESET);

    const accessTokenCookie = req.cookies['PongAccessAndRefreshCookie'];
    if (accessTokenCookie) 
    {
      try 
      {
        const userData = JSON.parse(accessTokenCookie);
        const { username } = userData;
        const user = await this.userService.findUserByUsername(username);
        if (user)
          req.user = user; // Ajoute l'utilisateur récupéré à l'objet req pou
        return this.userService.CreateNewRefreshTokens(user.username, user.MyHashedRefreshToken);
      }
      catch (error) 
      {
          console.error(error);
      }
    }
  }
  /*==========================================================================*/



  @Public()
  @Post('generate')
  //@UseGuards(JwtAuthenticationGuard)
  async register(@Res() response: Response, @Req() request: ExpressRequest) {
    const userId = request.body.userId;
    const user = await this.userService.findUserById(userId);
    console.log('COUCOU JE SUIS DANS GENERATE');
    const result = await this.authService.generateTwoFactorAuthenticationSecret(
      user,
    );
    return response.json(result);
  }

  @Public()
  @Post('turn-on')
  async turnOnTwoFactorAuthentication(@Body() body, @Res() res: Response) {
    console.log('le body ', body);
    const isCodeValid =
      await this.userService.isTwoFactorAuthenticationCodeValid(
        body.TfaCode,
        body.login,
        //res,
      );
    console.log("IS LOGGED VALID", isCodeValid);
    if (isCodeValid) {
      await this.userService.turnOnTwoFactorAuthentication(
        body.user_id,
      );
      res.status(200).json({ message: '2FA enabled' });
    } else {
      res.status(401).json({ message: 'Invalid 2FA code' });
    }
  }

  /*@Post('authenticate')
  @HttpCode(200)
  @UseGuards(IntraAuthGuard)
  async authenticate(
    @Req() request: ExpressRequest,
    @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
  ) {
    const isCodeValid = this.userService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode,
      request.body.username,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      request.body.id,
      true,
    );

    request.res.setHeader('Set-Cookie', [accessTokenCookie]);

    return request.user;
  }*/

  @Public()
  @Post('authenticate')
  @HttpCode(HttpStatus.OK)
  async authenticate(@Req() request, @Body() body, @Res({ passthrough: true }) res: Response) {
    let payload = null;
    this.authService.WriteCommandsNames("AUTHENTICATE");
    //console.log('le body ', body)
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
  async Deactivate2FA(@Body() body) {
    this.userService.Deactivate2FA(body.nickname);
  }

  @Delete('deleteallusers')
  async deleteAllUsers(@Res() res: Response) {
    await this.userService.deleteAllUsers();
    res.status(200).json({ message: 'All the Users in the database were deleted.' });
  }
}
