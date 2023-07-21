import { PassportStrategy } from '@nestjs/passport';
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
}
