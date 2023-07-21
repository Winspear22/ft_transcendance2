import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User42Dto } from './user42.dto';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';

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

  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    return this.usersRepository.update(userId, {
      twoFactorAuthenticationSecret: secret,
    });
  }

  async findUserById(id: number): Promise<UserEntity> {
    return this.usersRepository.findOneBy({ id });
  }
}
