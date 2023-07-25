/*import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, Profile } from 'passport-42';
import { AuthService } from '../auth.service';
import { UserEntity } from 'src/user/user.entity';

@Injectable()
export class IntraStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.FORTYTWO_CLIENT_ID,
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/login/42/return', //process.env.IP_REDIRECT,
      scope: ['public'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<UserEntity> {
    const { username } = profile;
    const profile_picture = profile['photos'][0]['value']; // Récupère l'URL de l'image de profil
    const email = profile['emails'][0]['value'];

    // Affiche l'URL de l'image de profil dans la console
    console.log('Profile picture URL:', profile_picture);
    console.log('Profile email:', email);

    const user = {
      username: username,
      email: profile['emails'][0]['value'],
      password: username,
      login42: username,
      //profile_picture: username
      //profile_picture: profile['photos'][0]['value'] // Récupère l'URL de l'image de profil
      profile_picture:
        'https://cdn.intra.42.fr/users/17ebd3378a57e126c48ec2c02348a5da/adaloui.jpg',
    };
    console.log('my email == ' + user.email);
    return this.authService.validateUser(user);
  }
}*/

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
      callbackURL: 'http://localhost:3000/login/42/return', // this is the redirect URI provided in 42 API
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
    // console.log("je rentre ici 5,5 ??")
    let lolo = await this.userService.findUserByUsername(userDet.login);
    console.log(colors.BLUE, "==============================================", colors.RESET);
    console.log(colors.GREEN,"-------------USER IMPORTED FROM 42------------", colors.RESET);
    console.log(colors.BLUE, "==============================================", colors.RESET);
    console.log(colors.MAGENTA, 'My User login === ', colors.WHITE + colors.BRIGHT + userDet.login);
    console.log(colors.MAGENTA, 'My User email === ', colors.WHITE + colors.BRIGHT + userDet.email);
    console.log(colors.MAGENTA, 'My User name === ', colors.WHITE + colors.BRIGHT + userDet.name);
    console.log(colors.MAGENTA, 'My User picture === ', colors.WHITE + colors.BRIGHT + userDet.picture);
    console.log(colors.MAGENTA, 'My User provider === ', colors.WHITE + colors.BRIGHT + userDet.provider);
    console.log(colors.MAGENTA, 'My User providerId === ', colors.WHITE + colors.BRIGHT + userDet.providerId);
    if (lolo) 
    {
      console.log(colors.MAGENTA + colors.BRIGHT + "My Current User Statut = " + colors.RED + colors.BRIGHT +lolo.user_status);
      lolo = await this.userService.FindAndUpdateUser(lolo.username, { user_status: 'Online' });
      console.log(colors.MAGENTA + colors.BRIGHT + "My Current User Statut = " + colors.GREEN + colors.BRIGHT +lolo.user_status);
      return cb(null, lolo);
    }
    const newUser = await this.userService.createUser(userDet);
    return cb(null, newUser);
  }
}
