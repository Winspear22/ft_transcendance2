import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User42Dto } from './user42.dto';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { authenticator } from 'otplib';
import { Response } from 'express';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async validateUser42(userData: User42Dto): Promise<UserEntity> {
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
      isTwoFactorAuthenticationEnabled: true
    });
  }

  async isTwoFactorAuthenticationCodeValid(TfaCode: string, user: string, res: Response) {
    // verify the authentication code with the user's secret
     // const us = await this.userServ.searchUser(user);
     const us = await this.findUserByUsername(user);
      const verif = await authenticator.check(TfaCode, us.twoFactorAuthenticationSecret)
      if (!verif) {
        throw new UnauthorizedException('Wrong authentication code');
      }
      return verif;
  }

  async Deactivate2FA(username: string) {
    const user = await this.usersRepository.findOneBy({ username });
    if(user && user.isTwoFactorAuthenticationEnabled) {
      await this.usersRepository.update(user.id, {
        isTwoFactorAuthenticationEnabled: false,
        twoFactorAuthenticationSecret: null, // Réinitialisation du champ secret.
      });
    }
  }

  /*public isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: UserEntity) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twoFactorAuthenticationSecret
    })
  }*/

  /*=====================================================================*/

  /*=====================================================================*/
  /*-------------------------------GETTERS-------------------------------*/
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

}
