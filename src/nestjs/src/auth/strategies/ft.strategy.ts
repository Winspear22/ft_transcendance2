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
      callbackURL: 'http://localhost:3000/auth/login/42/return', // this is the redirect URI provided in 42 API
      passReqToCallBack: true, // allows us to pass back the entire request to the callback
      scopes: ['profile'], // the information we want to obtain from the user.
    });
  }

  async validate(
    accessToken: string, // useful to interact with 42 services
    refreshToken: string,
    profile: Profile, // Profile is an object with all the user informations
    cb: VerifyCallback, // a callback function where we will pass the user object and use it later to register it in the database and sign the JWT
  ): Promise<any> {

    const userDet = {
      provider: profile.provider,
      providerId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      picture: profile._json.image.link,
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
