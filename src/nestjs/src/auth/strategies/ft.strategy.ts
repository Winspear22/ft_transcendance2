import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-42';
import { UserService } from '../../user/user.service';
import { AuthService } from '../auth.service';
import * as colors from '../../colors';

@Injectable()
export class IntraStrategy extends PassportStrategy(Strategy, '42') {
  constructor(
    private readonly userService: UserService,
    private readonly auth: AuthService,
  ) {
    super({
      clientID: process.env.FORTYTWO_CLIENT_ID,
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
      callbackURL: 'http://' + process.env.VUE_APP_HOSTNAME2 + ':3000/auth/login/42/return',
      passReqToCallBack: true,
      scopes: ['profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    cb: VerifyCallback,
  ): Promise<any> {

    const userDet = {
      provider: profile.provider,
      providerId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      picture: "1.png",
      login: profile._json.login,
    };
    let user = await this.userService.findUserBy42Id(userDet.providerId);
    if (user) 
    {
      user = await this.userService.FindAndUpdateUser(user.username, { user_status: 'Online' });
      return cb(null, user);
    }
    const newUser = await this.userService.createUser(userDet);
    return cb(null, newUser);
  }
}