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
} from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { Response } from 'express';
import { IntraAuthGuard } from './guard/ft-oauth.guard';
import { Request as ExpressRequest } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { FtOauthGuard } from './guard/ft-oauth.guard';
import { JwtPayload } from './interface/request.interface';
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

  @Public()
  @Get('42/login')
  @UseGuards(IntraAuthGuard)
  login() {}

  @Public()
  @Get('login/42/return')
  @UseGuards(IntraAuthGuard)
  async redirect(@Res({ passthrough: true }) res: Response, @Req() req: ExpressRequest) 
  {
    /*console.log(colors.YELLOW + colors.BRIGHT,"==============================================", colors.RESET);
    console.log(colors.GREEN + colors.BRIGHT, "------------------REQUETE---------------", colors.RESET);
    console.log(colors.YELLOW + colors.BRIGHT,"==============================================", colors.RESET);

    console.log(colors.RED + colors.BRIGHT + req);
    console.log(colors.YELLOW + colors.BRIGHT,"==============================================", colors.RESET);
    */
    console.log(colors.YELLOW + colors.BRIGHT,"==============================================", colors.RESET);
    console.log(colors.GREEN + colors.BRIGHT, "------------------REQUETE---------------", colors.RESET);
    console.log(colors.YELLOW + colors.BRIGHT,"==============================================", colors.RESET);
    //JSON.stringify(req)
    console.log(req.user);
    console.log(colors.YELLOW + colors.BRIGHT,"==============================================", colors.RESET);

    const username = req.user['username'];
    await this.userService.CreateCookiesForNewUser(res, username);
  }

  @Public()
  @Post('generate')
  //@UseGuards(JwtAuthenticationGuard)
  async register(@Res() response: Response, @Req() request: ExpressRequest) {
    const userId = request.body.userId;
    const user = await this.userService.findUserById(userId);
    console.log('COUCOU JE SUIS DANS GENERATE');
    const qrCode = await this.authService.generateTwoFactorAuthenticationSecret(
      user,
    );
    return response.json(qrCode);
  }

  @Public()
  @Post('turn-on')
  async turnOnTwoFactorAuthentication(@Body() body, @Res() res: Response) {
    console.log('le body ', body);
    const isCodeValid =
      await this.userService.isTwoFactorAuthenticationCodeValid(
        body.TfaCode,
        body.actualUser.login,
        //res,
      );
    if (isCodeValid) {
      await this.userService.turnOnTwoFactorAuthentication(
        body.actualUser.user_id,
      );
      res.status(200).json({ message: '2FA enabled' });
    } else {
      res.status(401).json({ message: 'Invalid 2FA code' });
    }
  }

  @Post('authenticate')
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
