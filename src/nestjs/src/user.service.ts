import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity'

@Injectable()
export class UserService {
  constructor(@InjectRepository(UserEntity)
  private usersRepository: Repository<UserEntity>,) {}

  /*async createUser(): Promise<UserEntity> 
  {
    const user = this.usersRepository.create();
    try 
    {
      await this.usersRepository.save(user);
    } 
    catch (error) 
    {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    return user;
  }*/

  async createUser(username: string): Promise<UserEntity> {
    const user = this.usersRepository.create({ username });
    try {
      await this.usersRepository.save(user);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    return user;
  }

  getAllUsers(): Promise<UserEntity[]> 
  {
    return this.usersRepository.find();
  }

  async getUser(id: number): Promise<UserEntity> 
  {
    const user = await this.usersRepository.findOne({select: ['id', 'username'],
    where: {
      id,
    }
  }
  );

    if (!user) 
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

}