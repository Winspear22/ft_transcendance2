import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { authenticator } from 'otplib';
import { Response } from 'express';
import { Request } from 'express';
import * as colors from '../colors';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  /*async validateUser42(userData: User42Dto): Promise<UserEntity> {
    let user: UserEntity = undefined;

    const { login42 } = userData;
    user = await this.usersRepository.findOneBy({ login42: login42 });
    // eslint-disable-next-line prettier/prettier
    if (user) 
      return user;
    let { username } = userData;
    user = await this.usersRepository.findOneBy({ username });
    if (user) {
      const rand = Math.random().toString(16).substr(2, 5);
      username = username + '-' + rand;
      userData.username = username;
    }
    const newUser: UserEntity = await this.createUser42(userData);
    return newUser;
  }

  async createUser42(userData: User42Dto): Promise<UserEntity> {
    const user: UserEntity = this.usersRepository.create(userData);
    await this.usersRepository.save(user);
    return user;
  }*/

  async createUser(userDet: any): Promise<UserEntity> {
    const newUser = this.usersRepository.create({
      username: userDet.login,
      email: userDet.email,
      profile_picture: userDet.picture,
      isTwoFactorAuthenticationEnabled: false,
      user_status: 'Online',
      id42: userDet.providerId,
      provider: userDet.provider,
    });
    console.log(colors.YELLOW + colors.BRIGHT, "==============================================", colors.RESET);
    console.log(colors.GREEN + colors.BRIGHT, "------------------USER CREATED---------------", colors.RESET);
    console.log(colors.YELLOW + colors.BRIGHT, "==============================================", colors.RESET);
    console.log(colors.GREEN + colors.BRIGHT, "login = ", colors.WHITE + colors.BRIGHT, newUser.username);
    console.log(colors.GREEN + colors.BRIGHT, "email = ", colors.WHITE + colors.BRIGHT, newUser.email);
    console.log(colors.GREEN + colors.BRIGHT, "profile_picture = ", colors.WHITE + colors.BRIGHT, newUser.profile_picture);
    console.log(colors.GREEN + colors.BRIGHT, "2FA activated ? = ", colors.WHITE + colors.BRIGHT, newUser.isTwoFactorAuthenticationEnabled);
    console.log(colors.GREEN + colors.BRIGHT, "user status ? = ", colors.WHITE + colors.BRIGHT, newUser.user_status);
    console.log(colors.GREEN + colors.BRIGHT, 'My User origin === ', colors.WHITE + colors.BRIGHT + newUser.provider);
    console.log(colors.GREEN + colors.BRIGHT, 'My User origin_id === ', colors.WHITE + colors.BRIGHT + colors.BRIGHT + newUser.id42);
    await this.usersRepository.save(newUser);
    //On ecrit l'id apres le save car c'est la fonction save qui attribut l'id.
    console.log(colors.GREEN + colors.BRIGHT, 'My User simple ID === ', colors.WHITE + colors.BRIGHT + newUser.id);
    console.log(colors.YELLOW + colors.BRIGHT, "==============================================", colors.RESET);
    return newUser;
  }
  /*=====================================================================*/
  /*-----------------------------2FA METHODES----------------------------*/
  /*=====================================================================*/

  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    return this.usersRepository.update(userId, {
      twoFactorAuthenticationSecret: secret,
    });
  }

  async turnOnTwoFactorAuthentication(userId: number) {
    return this.usersRepository.update(userId, {
      isTwoFactorAuthenticationEnabled: true,
    });
  }

  async isTwoFactorAuthenticationCodeValid(TfaCode: string, user: string) {
    try {
      // verify the authentication code with the user's secret
      const us = await this.findUserByUsername(user);
      console.log('JE SUIS === ' + user);
      console.log('Mon code === ' + TfaCode);
      const verif = authenticator.check(
        TfaCode,
        us.twoFactorAuthenticationSecret,
      );
      return verif;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async Deactivate2FA(username: string) {
    const user = await this.usersRepository.findOneBy({ username });
    if (user && user.isTwoFactorAuthenticationEnabled) {
      await this.usersRepository.update(user.id, {
        isTwoFactorAuthenticationEnabled: false,
        twoFactorAuthenticationSecret: null, // Réinitialisation du champ secret.
      });
    }
  }

  /*=====================================================================*/

  /*=====================================================================*/
  /*-----------------------------USER GETTERS----------------------------*/
  /*=====================================================================*/

  async findUserById(id: number): Promise<UserEntity> {
    return this.usersRepository.findOneBy({ id });
  }

  async findUserByUsername(username: string): Promise<UserEntity> {
    return this.usersRepository.findOneBy({ username });
  }

  async findUserByEmail(email: string): Promise<UserEntity> {
    return this.usersRepository.findOneBy({ email });
  }

  /*=====================================================================*/

  /*=====================================================================*/
  /*----------------------------USER UPDATER-----------------------------*/
  /*=====================================================================*/

  async FindAndUpdateUser(
    username: string,
    updateData: Partial<UserEntity>,
  ): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ username });
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepository.update(user.id, updateData);
    return await this.usersRepository.findOneBy({ username });
  }
  /*=====================================================================*/

  /*=====================================================================*/
  /*----------------------------USER DELETER-----------------------------*/
  /*=====================================================================*/
    async deleteUserByUsername(username: string): Promise<void> {
      await this.usersRepository.delete({ username });
    }

    async deleteUserById(id: number): Promise<void> {
      await this.usersRepository.delete({ id });
    }
    async deleteUserByEmail(email: string): Promise<void> {
      await this.usersRepository.delete({ email });
    }

    async deleteAllUsers(): Promise<void> {
      await this.usersRepository.clear();
    }
  
  /*=====================================================================*/

  /*=====================================================================*/
  /*-------------------------COOKIES CREATION METHOD---------------------*/
  /*=====================================================================*/

  async CreateCookiesForNewUser(res: Response, username: string)
  {
    const User = this.findUserByUsername(username);
    if ((await User).isTwoFactorAuthenticationEnabled === false)
    {
      const idAsString: string = (await User).id.toString();
      const tokens = await this.CreateAndSignTokens(idAsString, (await User).username);
      this.setCookie(
        {
          nickname: (await User).username,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          avatar: (await User).profile_picture
        },
        res,
      );
      return res.redirect(process.env.IP_FRONTEND);
    }
    else
    {
      const url = `http://localhost:3000/tfa?param1=${(await User).username}`;
      res.redirect(url);
    }
  }

  async CreateAndSignTokens(userId: string, nickname: string) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          nickname,
        },
        {
          secret: process.env.ACCESS_TOKEN,
          expiresIn: 60 * 15 * 20,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          nickname,
        },
        {
          secret: process.env.REFRESH_TOKEN,
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);
    return {access_token: new_access_token, refresh_token: new_refresh_token};
  }

  async setCookie(data: object, res: Response) {
    const serializeData = JSON.stringify(data);
    res.cookie('AdnenCookie', '', { expires: new Date(0) });
    res.cookie('AdnenCookie', serializeData, {
      httpOnly: false,
      sameSite: 'lax',
      secure: false,
      maxAge: 1800000000,
      domain: 'localhost',
      path: '/',
    });
  }
  /*=====================================================================*/
}
