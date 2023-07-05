/*import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-42';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, '42') 
{
  constructor() 
  {
    super({
      clientID: process.env.FORTYTWO_CLIENT_ID,
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
      callbackURL: '/login/42/return',
      passReqToCallback: true,

});
  }
  async validate(request: { session: { accessToken: string } }, accessToken: string, refreshToken: string, profile: Profile, cb: VerifyCallback,
  ): Promise<any> {
    request.session.accessToken = accessToken;
    profile.twoFactorSecret = 'YOUR_SECRET';
    profile.isTwoFactorAuthenticated = false;

    const  { username } = profile;
		const user = {
			username: username,
			email: profile['emails'][0]['value'],
			password: username,
			login42: username
    }
    return cb(null, profile);
  }
}*/

import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { Strategy, Profile } from 'passport-42'
import { AppService } from './app.service';
import { UserEntity } from "./user.entity"

@Injectable()
export class IntraStrategy extends PassportStrategy(Strategy, '42') {
	constructor(private readonly authService: AppService) {
		super({
			clientID: process.env.FORTYTWO_CLIENT_ID,
			clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
			callbackURL: 'http://localhost:3000/login/42/return',//process.env.IP_REDIRECT,
			scope: ['public']
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<UserEntity> {
		const  { username } = profile;
		const user = {
			username: username,
			email: profile['emails'][0]['value'],
			password: username,
			login42: username
		}
		return this.authService.validateUser(user);
	}
}
