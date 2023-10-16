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
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: ExpressRequest, @Res() res: Response) 
  { 
    const user = req.user as UserEntity;
    try 
    {
      await this.userService.FindAndUpdateUser(user.username, { user_status: 'Offline' });
      await this.userService.FindAndUpdateUser(user.username, { MyHashedRefreshToken: null });
      const partialUser = await this.userService.returnPartialUserInfo(user.username);
      return res.status(HttpStatus.OK).json({ partialUser });
    } 
    catch (error) 
    {
      console.error(error);
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

  @Public() 
  @Get('getUserInfo')
  @UseGuards(JwtAuthGuard)
  async getUserInfo(@Req() req: ExpressRequest, @Res() res: Response) {
      try {
          const user = req.user as UserEntity;
          // const user = await this.userService.findUserById(userId.id);//req.user as UserEntity;
          const cookie = req.cookies['PongAccessAndRefreshCookie'];
          return res.status(HttpStatus.OK).json({ success: true, user, cookie });
      } catch (error) {
          console.error(error);
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error retrieving user info' });
      }
  }


  /*==========================================================================*/
  
  @Public()
  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async register(@Res() response: Response, @Req() req: ExpressRequest) 
  {
    const userId = req.body.id;
    const user = await this.userService.findUserById(userId);
    const result = await this.authService.generateTwoFactorAuthenticationSecret(
      user,
    );
    return response.json(result);
  }

  @Public()
  @Post('turn-on')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async turnOnTwoFactorAuthentication(@Body() body, @Res() res: Response) 
  {
    const isCodeValid =
      await this.userService.isTwoFactorAuthenticationCodeValid(
        body.TfaCode,
        body.username,
      );
    if (isCodeValid) 
    {
      await this.userService.turnOnTwoFactorAuthentication(body.username,);
      var partialUser = await this.userService.returnPartialUserInfo(body.username);
      res.status(200).json({ message: '2FA enabled', partialUser });
    } 
    else 
    {
      var partialUser = await this.userService.returnPartialUserInfo(body.username);
      res.status(401).json({ message: 'Invalid 2FA code', partialUser });
    }
  }

  @Public()
  @Post('authenticate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async authenticate(@Req() request, @Body() body, @Res({ passthrough: true }) res: Response) 
  {
    let payload = null;
    try
    {      
      const validation = await this.userService.isTwoFactorAuthenticationCodeValid(
        body.twoFactorAuthenticationCode,
        body.username,
      );
      if (validation)
      {
        payload = await	this.userService.loginWith2fa(body.username, res);
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
    const response = await this.userService.Deactivate2FA(body.username);
    res.status(200).json(response);
  }
}
