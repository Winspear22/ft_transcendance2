/*import { Controller, Get, Req, UseGuards, Post, Res, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { IntraAuthGuard } from './auth/guard/ft-oauth.guard';
import { Request } from 'express';
import { UserEntity } from './user/user.entity';
import { JwtPayload } from './auth/request.interface';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';*/

import { Controller, Get, Req, UseGuards, Post, Res, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { IntraAuthGuard } from './guard/ft-oauth.guard';
import { Request } from 'express';
import { UserEntity } from '../user/user.entity';
import { JwtPayload } from './interface/request.interface';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';


@Controller()
export class AuthController {
	constructor (
		private httpService: HttpService,
		private jwtService: JwtService,
	) {}

	@Get('42/login')
	@UseGuards(IntraAuthGuard)
	login() {
	}

	@Get('login/42/return')
	@UseGuards(IntraAuthGuard)
	async redirect(@Res({passthrough: true}) res: Response, @Req() req: Request) {
		const username = req.user['username'];
		let auth: boolean = false;
		const payload: JwtPayload = { username, auth };
		const accessToken: string = await this.jwtService.sign(payload);
		res.cookie('jwt', accessToken, {httpOnly: true});
		res.redirect(process.env.IP_FRONTEND);
	}

	@UseGuards(AuthGuard('jwt'))
	@Get('2fa')
	async getQrcode(@Req() req) {
		const user: UserEntity = req.user;
	  	const resp = await this.httpService.get(
		  `https://www.authenticatorApi.com/pair.aspx?AppName=${process.env.TWO_FACTOR_AUTH_APP_NAME}&AppInfo=${user.username}&SecretCode=${user.id}`,
		).toPromise();
	  return resp.data;
	}

	@UseGuards(AuthGuard('jwt'))
	@Post('2fa/:secret')
	async validate(@Param('secret') secret, @Req() req, @Res({passthrough: true}) res: Response) {
		const user: UserEntity = req.user;
		const resp = await this.httpService.get(
		  `https://www.authenticatorApi.com/Validate.aspx?Pin=${secret}&SecretCode=${user.id}`,
		).toPromise();
		if (resp.data === 'True') {
			const username = user.username;
			const auth: boolean = true;
			const payload: JwtPayload = { username, auth };
			const accessToken: string = await this.jwtService.sign(payload);
			res.cookie('jwt', accessToken, {httpOnly: true});
		}
	  	return resp.data;
	}
}