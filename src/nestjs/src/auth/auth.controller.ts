import { Controller, Get, Req, UseGuards, Res, Post } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { Response } from 'express';
import { IntraAuthGuard } from './guard/ft-oauth.guard';
import { Request } from 'express';
import { JwtPayload } from './interface/request.interface';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';

@Controller()
export class AuthController {
  constructor(
    private httpService: HttpService,
    private jwtService: JwtService,
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Public()
  @Get('42/login')
  @UseGuards(IntraAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  login() {}

  @Public()
  @Get('login/42/return')
  @UseGuards(IntraAuthGuard)
  async redirect(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const username = req.user['username'];
    const auth = false;
    const payload: JwtPayload = { username, auth };
    const accessToken: string = await this.jwtService.sign(payload);
    res.cookie('jwt', accessToken, { httpOnly: true });
    console.log("VOICI L'ID DE L'UTILISATEUR === " + req.user['id']);
    res.redirect(process.env.IP_FRONTEND);
  }

  @Public()
  @Post('generate')
  //@UseGuards(JwtAuthenticationGuard)
  async register(@Res() response: Response, @Req() request: Request) {
    const userId = request.body.userId;
    const user = await this.userService.findUserById(userId);
    console.log('COUCOU JE SUIS DANS GENERATE');
    const qrCode = await this.authService.generateTwoFactorAuthenticationSecret(
      user,
    );
    return response.json(qrCode);
  }
}
