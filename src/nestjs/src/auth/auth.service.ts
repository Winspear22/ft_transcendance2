/*import { Injectable } from '@nestjs/common';
import { User42Dto } from './user/user42.dto';
import { UserEntity } from './user/user.entity';
import { UserService } from './user/user.service';*/

import { Injectable } from '@nestjs/common';
import { User42Dto } from '../user/user42.dto';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';


@Injectable()
export class AuthService 
{
  constructor(private userService: UserService) {}

  getHello(): string 
  {
    return 'Bravo, tu t\'es connecte avec succes a 42 et a google !';
  }

  googleLogin(req) 
  {
    if (!req.user) {
      return 'No user from google'
    }
    return {
      message: 'User Info from Google',
      user: req.user
    }
  }

  async validateUser(userData: User42Dto): Promise<UserEntity>{
		return this.userService.validateUser42(userData);
	}
}
